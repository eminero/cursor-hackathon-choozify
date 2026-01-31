-- ============================================================================
-- Migration: Add RLS policy for landlords to view tenant profiles
-- Date: January 31, 2026
-- Purpose: Allow landlords to view profile information of tenants who have
--          applied to their properties
-- ============================================================================

-- Add policy for landlords to view tenant profiles through applications
DROP POLICY IF EXISTS "Landlords can view applicant profiles" ON public.profiles;
CREATE POLICY "Landlords can view applicant profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    -- Allow viewing if there's an application from this tenant to a property owned by the current user
    EXISTS (
      SELECT 1 
      FROM public.applications
      INNER JOIN public.properties ON applications.property_id = properties.id
      WHERE applications.tenant_id = profiles.id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Landlords can view applicant profiles'
  ) THEN
    RAISE NOTICE 'Policy "Landlords can view applicant profiles" created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create policy';
  END IF;
END $$;
