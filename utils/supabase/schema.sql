-- ============================================================================
-- RentalMatch (Choozify MVP) - Database Schema
-- Based on PRD v1.0 - January 31, 2026
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. CUSTOM TYPES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('landlord', 'tenant', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE employment_type AS ENUM (
    'full_time', 
    'part_time', 
    'contractor', 
    'self_employed', 
    'unemployed', 
    'student', 
    'retired', 
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('submitted', 'reviewing', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('active', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
-- Stores user profiles with role-specific eligibility data
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'tenant' NOT NULL,
  
  -- Tenant eligibility fields (FR-2.1 to FR-2.6)
  income NUMERIC, -- Monthly income
  score NUMERIC, -- Credit score
  employment_type employment_type,
  
  -- Tenant preferences and constraints (FR-2.7)
  -- Contains: preferred_zone_names (array), has_pets (bool), smokes (bool), needs_parking (bool)
  preferences_json JSONB DEFAULT '{}'::jsonb,
  
  -- Optional location for tenant
  current_location_geom GEOMETRY(Point, 4326),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profiles with role-specific data for eligibility matching';
COMMENT ON COLUMN public.profiles.preferences_json IS 'Tenant preferences: preferred_zone_names, has_pets, smokes, needs_parking';

-- 4. PROPERTIES TABLE
-- Stores property listings with details and tenant criteria
DROP TABLE IF EXISTS public.properties CASCADE;
CREATE TABLE public.properties (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  zone_name TEXT NOT NULL, -- Named zone (e.g., "Providencia")
  
  -- Property details (FR-3.1)
  -- Contains: price (numeric), bedrooms (int), has_parking (bool), address (text)
  details_json JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- Tenant criteria (FR-3.2)
  -- Contains: min_income (numeric), min_score (numeric), employment_types_allowed (array), 
  --           pets_allowed (bool), smoking_allowed (bool)
  criteria_json JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- PostGIS point for distance calculations (FR-3.3)
  location_geom GEOMETRY(Point, 4326) NOT NULL,
  
  -- Property images from Supabase Storage
  images_json JSONB DEFAULT '[]'::jsonb NOT NULL,
  
  status property_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.properties IS 'Property listings with eligibility criteria and geospatial data';
COMMENT ON COLUMN public.properties.details_json IS 'Property details: price, bedrooms, has_parking, address';
COMMENT ON COLUMN public.properties.criteria_json IS 'Tenant criteria: min_income, min_score, employment_types_allowed, pets_allowed, smoking_allowed';
COMMENT ON COLUMN public.properties.images_json IS 'Property images stored in Supabase Storage bucket "properties". Array of objects: [{url: string, path: string, alt: string}]';

-- 5. APPLICATIONS TABLE
-- Stores tenant applications to properties
DROP TABLE IF EXISTS public.applications CASCADE;
CREATE TABLE public.applications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  
  status application_status DEFAULT 'submitted' NOT NULL,
  visit_scheduled_at TIMESTAMPTZ, -- Optional: for scheduling visits
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- One application per tenant per property
  UNIQUE(tenant_id, property_id)
);

COMMENT ON TABLE public.applications IS 'Tenant applications to properties with status tracking';

-- 6. CHATS TABLE
-- Stores AI chat message history per user (FR-5.2)
DROP TABLE IF EXISTS public.chats CASCADE;
CREATE TABLE public.chats (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Array of message objects (user/assistant turns)
  message_history JSONB DEFAULT '[]'::jsonb NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.chats IS 'AI chat message history for property search';

-- 7. ZONES TABLE (Helper/Reference)
-- Maps zone names to centroid points for proximity calculations (FR-7.2)
DROP TABLE IF EXISTS public.zones CASCADE;
CREATE TABLE public.zones (
  zone_name TEXT PRIMARY KEY,
  centroid_geom GEOMETRY(Point, 4326) NOT NULL, -- Reference point for "nearby" logic
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.zones IS 'Reference table mapping zone names to centroid points for proximity notifications';

-- 8. AUTOMATION LOGIC
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'tenant')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update chats.updated_at on message append
CREATE OR REPLACE FUNCTION public.update_chat_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_chat_update ON public.chats;
CREATE TRIGGER on_chat_update
  BEFORE UPDATE ON public.chats
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_timestamp();

-- 9. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables (NFR-1.1)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can manage their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow landlords to view tenant profiles when they have applied to landlord's properties
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

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Properties: Published properties viewable by all; landlords manage their own
DROP POLICY IF EXISTS "Published properties viewable by authenticated users" ON public.properties;
CREATE POLICY "Published properties viewable by authenticated users"
  ON public.properties FOR SELECT
  TO authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Landlords can insert own properties" ON public.properties;
CREATE POLICY "Landlords can insert own properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can update own properties" ON public.properties;
CREATE POLICY "Landlords can update own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can delete own properties" ON public.properties;
CREATE POLICY "Landlords can delete own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = landlord_id);

-- Applications: Tenants view their applications; landlords view applications to their properties
DROP POLICY IF EXISTS "Tenants can view own applications" ON public.applications;
CREATE POLICY "Tenants can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Landlords can view applications to their properties" ON public.applications;
CREATE POLICY "Landlords can view applications to their properties"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tenants can insert own applications" ON public.applications;
CREATE POLICY "Tenants can insert own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Landlords can update applications to their properties" ON public.applications;
CREATE POLICY "Landlords can update applications to their properties"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- Chats: Users can only access their own chat history
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
CREATE POLICY "Users can view own chats"
  ON public.chats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chats" ON public.chats;
CREATE POLICY "Users can insert own chats"
  ON public.chats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chats" ON public.chats;
CREATE POLICY "Users can update own chats"
  ON public.chats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Zones: Public read-only reference data (accessible to everyone including anon users)
DROP POLICY IF EXISTS "Zones viewable by everyone" ON public.zones;
CREATE POLICY "Zones viewable by everyone"
  ON public.zones FOR SELECT
  USING (true);

-- 10. INDEXES FOR PERFORMANCE (NFR-2.1 to NFR-2.3)

-- Profiles
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Properties (NFR-2.2, NFR-2.3)
CREATE INDEX idx_properties_location_geom ON public.properties USING GIST(location_geom);
CREATE INDEX idx_properties_zone_name ON public.properties(zone_name);
CREATE INDEX idx_properties_landlord_id ON public.properties(landlord_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_details ON public.properties USING GIN(details_json);
CREATE INDEX idx_properties_criteria ON public.properties USING GIN(criteria_json);
CREATE INDEX idx_properties_images ON public.properties USING GIN(images_json);

-- Applications (NFR-2.1)
CREATE INDEX idx_applications_tenant_id ON public.applications(tenant_id);
CREATE INDEX idx_applications_property_id ON public.applications(property_id);
CREATE INDEX idx_applications_status ON public.applications(status);

-- Chats (NFR-2.1)
CREATE INDEX idx_chats_user_id ON public.chats(user_id);

-- Zones
CREATE INDEX idx_zones_centroid_geom ON public.zones USING GIST(centroid_geom);

-- 11. GRANTS (NFR-1.2)
-- Table-level SELECT/DELETE, Column-level INSERT/UPDATE

-- Profiles
GRANT SELECT ON public.profiles TO authenticated;
GRANT DELETE ON public.profiles TO authenticated;
GRANT INSERT (id, email, full_name, role, income, score, employment_type, preferences_json, current_location_geom) 
  ON public.profiles TO authenticated;
GRANT UPDATE (email, full_name, income, score, employment_type, preferences_json, current_location_geom) 
  ON public.profiles TO authenticated;

-- Properties
GRANT SELECT ON public.properties TO authenticated;
GRANT DELETE ON public.properties TO authenticated;
GRANT INSERT (landlord_id, zone_name, details_json, criteria_json, location_geom, status, images_json) 
  ON public.properties TO authenticated;
GRANT UPDATE (zone_name, details_json, criteria_json, location_geom, status, images_json) 
  ON public.properties TO authenticated;

-- Applications
GRANT SELECT ON public.applications TO authenticated;
GRANT DELETE ON public.applications TO authenticated;
GRANT INSERT (tenant_id, property_id, status, visit_scheduled_at) 
  ON public.applications TO authenticated;
GRANT UPDATE (status, visit_scheduled_at) 
  ON public.applications TO authenticated;

-- Chats
GRANT SELECT ON public.chats TO authenticated;
GRANT DELETE ON public.chats TO authenticated;
GRANT INSERT (user_id, message_history) 
  ON public.chats TO authenticated;
GRANT UPDATE (message_history) 
  ON public.chats TO authenticated;

-- Zones (read-only for users)
GRANT SELECT ON public.zones TO authenticated;