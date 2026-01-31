import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import type { ApplicationStatus } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to verify they are a landlord
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'landlord') {
      return NextResponse.json({ error: 'Forbidden - Landlord role required' }, { status: 403 });
    }

    const { applicationId, status } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: ApplicationStatus[] = ['submitted', 'reviewing', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Verify the landlord owns the property for this application
    const { data: application } = await supabase
      .from('applications')
      .select('property_id, properties!inner(landlord_id)')
      .eq('id', applicationId)
      .single();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // TypeScript fix: Extract landlord_id from the nested property
    const landlordId = (application.properties as any)?.landlord_id;

    if (landlordId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this property' },
        { status: 403 }
      );
    }

    // Update the application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error('Error in update-status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
