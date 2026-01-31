# Database Migrations

## Important: RLS Policy Update Required

### Migration: `add_landlord_view_tenant_profiles_policy.sql`

**Status:** ⚠️ **REQUIRED FOR LANDLORD APPLICATION REVIEW FEATURE**

**Purpose:** This migration adds a Row-Level Security (RLS) policy that allows landlords to view the profile information of tenants who have applied to their properties.

**Why it's needed:**
The current RLS policies on the `profiles` table only allow users to view their own profile. This prevents landlords from seeing tenant information (income, score, employment type, preferences) when reviewing applications, even though the landlord has legitimate access to this data through the application relationship.

**What it does:**
Adds a new RLS policy called `"Landlords can view applicant profiles"` that allows a landlord to SELECT from the profiles table when:
- The profile belongs to a tenant who has submitted an application
- The application is for a property owned by the current user (landlord)

**How to apply:**

#### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/add_landlord_view_tenant_profiles_policy.sql`
4. Paste and execute the SQL
5. You should see a success message: "Policy 'Landlords can view applicant profiles' created successfully"

#### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push --file utils/supabase/migrations/add_landlord_view_tenant_profiles_policy.sql
```

#### Option 3: Manual Execution
```sql
-- Run this SQL in your database:
DROP POLICY IF EXISTS "Landlords can view applicant profiles" ON public.profiles;
CREATE POLICY "Landlords can view applicant profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.applications
      INNER JOIN public.properties ON applications.property_id = properties.id
      WHERE applications.tenant_id = profiles.id
      AND properties.landlord_id = auth.uid()
    )
  );
```

**Testing:**
After applying this migration:
1. Log in as a landlord user
2. Navigate to `/landlord/applications`
3. Click on any application
4. Verify that you can see the tenant's:
   - Full name and email
   - Income and credit score
   - Employment type
   - Lifestyle preferences (pets, smoking, parking)
   - Preferred zones

**Security Notes:**
- This policy is secure and follows the principle of least privilege
- Landlords can ONLY view profiles of tenants who have applied to their properties
- Landlords cannot view profiles of random tenants
- The policy uses PostgreSQL's RLS mechanism with proper authentication checks
- This aligns with the PRD requirements (FR-6.3: "Landlord can view applicants for their properties")

**Rollback:**
If you need to remove this policy:
```sql
DROP POLICY IF EXISTS "Landlords can view applicant profiles" ON public.profiles;
```

---

## Future Migrations

Add additional migration files here as needed, following the same documentation pattern.
