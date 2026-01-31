-- ============================================================================
-- Sample Data Insertion for Choozify MVP
-- Based on schema.sql v1.0 - January 31, 2026
-- ============================================================================

-- 1. CREATE USERS IN AUTH SCHEMA (auth.users)
-- This will automatically create profiles in public.profiles via the trigger

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES
-- Landlords
(gen_random_uuid(), 'carlos.prop@email.com', '{"full_name": "Carlos Arrendador", "role": "landlord"}'),
(gen_random_uuid(), 'ana.prop@email.com', '{"full_name": "Ana Inmobiliaria", "role": "landlord"}'),
-- Tenants
(gen_random_uuid(), 'juan.ten@email.com', '{"full_name": "Juan Inquilino", "role": "tenant"}'),
(gen_random_uuid(), 'maria.ten@email.com', '{"full_name": "Maria Prospecto", "role": "tenant"}'),
(gen_random_uuid(), 'luis.ten@email.com', '{"full_name": "Luis Buscador", "role": "tenant"}');

-- 2. UPDATE TENANT PROFILES WITH ELIGIBILITY DATA AND PREFERENCES

-- Juan: High income, no pets, non-smoker, needs parking, looking in Centro/Norte zones
UPDATE public.profiles
SET 
    income = 5000,
    score = 750,
    employment_type = 'full_time',
    preferences_json = jsonb_build_object(
        'preferred_zone_names', ARRAY['Centro', 'Norte'],
        'has_pets', false,
        'smokes', false,
        'needs_parking', true
    ),
    current_location_geom = ST_SetSRID(ST_MakePoint(-74.0817, 4.6097), 4326) -- Bogotá Centro
WHERE email = 'juan.ten@email.com';

-- Maria: Medium income, has pets, non-smoker, no parking needed, looking in Sur zone
UPDATE public.profiles
SET 
    income = 2500,
    score = 680,
    employment_type = 'contractor',
    preferences_json = jsonb_build_object(
        'preferred_zone_names', ARRAY['Sur'],
        'has_pets', true,
        'smokes', false,
        'needs_parking', false
    ),
    current_location_geom = ST_SetSRID(ST_MakePoint(-74.1200, 4.5800), 4326)
WHERE email = 'maria.ten@email.com';

-- Luis: Lower income, no pets, no parking, flexible on zones
UPDATE public.profiles
SET 
    income = 1800,
    score = 620,
    employment_type = 'part_time',
    preferences_json = jsonb_build_object(
        'preferred_zone_names', ARRAY['Sur', 'Oeste'],
        'has_pets', false,
        'smokes', false,
        'needs_parking', false
    ),
    current_location_geom = ST_SetSRID(ST_MakePoint(-74.1300, 4.5700), 4326)
WHERE email = 'luis.ten@email.com';

-- 3. INSERT REFERENCE ZONES (For proximity notifications)

INSERT INTO public.zones (zone_name, centroid_geom)
VALUES
    ('Centro', ST_SetSRID(ST_MakePoint(-74.0820, 4.6100), 4326)),
    ('Norte', ST_SetSRID(ST_MakePoint(-74.0500, 4.7000), 4326)),
    ('Sur', ST_SetSRID(ST_MakePoint(-74.1210, 4.5810), 4326)),
    ('Oeste', ST_SetSRID(ST_MakePoint(-74.1500, 4.6200), 4326)),
    ('Providencia', ST_SetSRID(ST_MakePoint(-70.6100, -33.4300), 4326)); -- Santiago, Chile example

-- 4. INSERT PROPERTIES

-- Property from Carlos: High-end apartment in Centro, strict criteria, no pets
INSERT INTO public.properties (
    landlord_id, 
    zone_name, 
    details_json, 
    criteria_json, 
    location_geom, 
    status
)
SELECT
    p.id,
    'Centro',
    jsonb_build_object(
        'price', 1800,
        'bedrooms', 2,
        'has_parking', true,
        'address', 'Calle 10 # 5-20'
    ),
    jsonb_build_object(
        'min_income', 4500,
        'min_score', 700,
        'employment_types_allowed', ARRAY['full_time', 'self_employed'],
        'pets_allowed', false,
        'smoking_allowed', false
    ),
    ST_SetSRID(ST_MakePoint(-74.0820, 4.6100), 4326),
    'active'
FROM public.profiles p
WHERE p.email = 'carlos.prop@email.com';

-- Property from Ana: Affordable studio in Sur, flexible criteria, pets allowed
INSERT INTO public.properties (
    landlord_id, 
    zone_name, 
    details_json, 
    criteria_json, 
    location_geom, 
    status
)
SELECT
    p.id,
    'Sur',
    jsonb_build_object(
        'price', 900,
        'bedrooms', 1,
        'has_parking', false,
        'address', 'Av Siempre Viva 123'
    ),
    jsonb_build_object(
        'min_income', 2000,
        'min_score', 600,
        'employment_types_allowed', ARRAY['full_time', 'part_time', 'contractor'],
        'pets_allowed', true,
        'smoking_allowed', false
    ),
    ST_SetSRID(ST_MakePoint(-74.1210, 4.5810), 4326),
    'active'
FROM public.profiles p
WHERE p.email = 'ana.prop@email.com';

-- Additional property from Carlos: Budget-friendly option in Norte
INSERT INTO public.properties (
    landlord_id, 
    zone_name, 
    details_json, 
    criteria_json, 
    location_geom, 
    status
)
SELECT
    p.id,
    'Norte',
    jsonb_build_object(
        'price', 1200,
        'bedrooms', 1,
        'has_parking', true,
        'address', 'Carrera 15 # 85-30'
    ),
    jsonb_build_object(
        'min_income', 3000,
        'min_score', 650,
        'employment_types_allowed', ARRAY['full_time', 'contractor'],
        'pets_allowed', false,
        'smoking_allowed', false
    ),
    ST_SetSRID(ST_MakePoint(-74.0500, 4.7000), 4326),
    'active'
FROM public.profiles p
WHERE p.email = 'carlos.prop@email.com';

-- 5. INSERT APPLICATIONS

-- Juan applies to Carlos's Centro apartment (should be a good match: high income, no pets, needs parking)
INSERT INTO public.applications (tenant_id, property_id, status, visit_scheduled_at)
SELECT
    tenant.id,
    prop.id,
    'submitted',
    now() + interval '3 days' -- Schedule visit in 3 days
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'juan.ten@email.com'
    AND prop.zone_name = 'Centro'
    AND prop.details_json->>'address' = 'Calle 10 # 5-20';

-- Maria applies to Ana's Sur studio (good match: has pets, pets allowed)
INSERT INTO public.applications (tenant_id, property_id, status)
SELECT
    tenant.id,
    prop.id,
    'submitted'
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'maria.ten@email.com'
    AND prop.zone_name = 'Sur'
    AND prop.details_json->>'address' = 'Av Siempre Viva 123';

-- Luis applies to Ana's Sur studio (borderline match: low income, but no pets)
INSERT INTO public.applications (tenant_id, property_id, status)
SELECT
    tenant.id,
    prop.id,
    'submitted'
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'luis.ten@email.com'
    AND prop.zone_name = 'Sur'
    AND prop.details_json->>'address' = 'Av Siempre Viva 123';

-- Juan also applies to Carlos's Norte property (another good match)
INSERT INTO public.applications (tenant_id, property_id, status)
SELECT
    tenant.id,
    prop.id,
    'reviewing' -- Landlord is already reviewing this one
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'juan.ten@email.com'
    AND prop.zone_name = 'Norte'
    AND prop.details_json->>'address' = 'Carrera 15 # 85-30';

-- 6. INSERT SAMPLE CHAT HISTORY (Optional)

-- Juan's chat with AI assistant
INSERT INTO public.chats (user_id, message_history)
SELECT
    id,
    jsonb_build_array(
        jsonb_build_object(
            'role', 'user',
            'content', 'Estoy buscando un apartamento de 2 habitaciones en el centro con parqueadero',
            'timestamp', now() - interval '1 hour'
        ),
        jsonb_build_object(
            'role', 'assistant',
            'content', 'Encontré algunas opciones que coinciden con tus criterios. ¿Cuál es tu presupuesto mensual?',
            'timestamp', now() - interval '55 minutes'
        ),
        jsonb_build_object(
            'role', 'user',
            'content', 'Mi presupuesto es de hasta $2000 mensuales',
            'timestamp', now() - interval '50 minutes'
        )
    )
FROM public.profiles
WHERE email = 'juan.ten@email.com';

-- Maria's chat with AI assistant
INSERT INTO public.chats (user_id, message_history)
SELECT
    id,
    jsonb_build_array(
        jsonb_build_object(
            'role', 'user',
            'content', 'Tengo un perro pequeño, necesito un lugar que acepte mascotas',
            'timestamp', now() - interval '2 hours'
        ),
        jsonb_build_object(
            'role', 'assistant',
            'content', 'Perfecto, tengo varias propiedades que aceptan mascotas. ¿En qué zona prefieres buscar?',
            'timestamp', now() - interval '115 minutes'
        )
    )
FROM public.profiles
WHERE email = 'maria.ten@email.com';
