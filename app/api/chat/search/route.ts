import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchParamsSchema, searchPropertyFunction } from '@/lib/ai/search-params-schema';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get tenant profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje inválido' },
        { status: 400 }
      );
    }

    // Call OpenAI to extract search parameters
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente que ayuda a buscar propiedades de alquiler. Extrae los parámetros de búsqueda del mensaje del usuario en español.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      functions: [searchPropertyFunction],
      function_call: { name: 'search_properties' },
      temperature: 0,
    });

    const functionCall = completion.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      return NextResponse.json(
        { error: 'No se pudieron extraer parámetros de búsqueda' },
        { status: 400 }
      );
    }

    // Parse and validate extracted parameters
    const rawParams = JSON.parse(functionCall.arguments);
    const extractedFilters = searchParamsSchema.parse(rawParams);

    // Build Supabase query with eligibility rules
    let query = supabase.from('properties').select('*').eq('status', 'active');

    // Apply extracted filters
    if (extractedFilters.max_price) {
      query = query.lte('details_json->>price', extractedFilters.max_price);
    }

    if (extractedFilters.bedrooms) {
      query = query.eq('details_json->>bedrooms', extractedFilters.bedrooms);
    }

    if (extractedFilters.zone_name) {
      query = query.ilike('zone_name', `%${extractedFilters.zone_name}%`);
    }

    if (extractedFilters.has_parking) {
      query = query.eq('details_json->>has_parking', true);
    }

    // Apply tenant eligibility rules (FR-4.1 to FR-4.6)
    if (profile.income) {
      query = query.lte('criteria_json->>min_income', profile.income);
    }

    if (profile.score) {
      query = query.lte('criteria_json->>min_score', profile.score);
    }

    // Pets constraint
    if (profile.preferences_json?.has_pets) {
      query = query.eq('criteria_json->>pets_allowed', true);
    }

    // Smoking constraint
    if (profile.preferences_json?.smokes) {
      query = query.eq('criteria_json->>smoking_allowed', true);
    }

    // Parking constraint
    if (profile.preferences_json?.needs_parking) {
      query = query.eq('details_json->>has_parking', true);
    }

    // Execute query
    const { data: properties, error: queryError } = await query.limit(10);

    if (queryError) {
      console.error('Query error:', queryError);
      return NextResponse.json(
        { error: 'Error al buscar propiedades' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      properties: properties || [],
      extracted_filters: extractedFilters,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
