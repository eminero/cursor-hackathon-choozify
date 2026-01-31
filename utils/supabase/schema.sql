-- 1. EXTENSIONES (PostGIS para mapas y distancias)
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS PERSONALIZADOS
CREATE TYPE user_role AS ENUM ('landlord', 'tenant', 'admin');
CREATE TYPE app_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE prop_status AS ENUM ('draft', 'published', 'rented', 'archived');

-- 3. TABLA DE PERFILES (Sincronizada con Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'tenant',
  is_verified BOOLEAN DEFAULT FALSE,
  profile_data JSONB DEFAULT '{}'::jsonb, -- Ingresos, empleo, mascotas, etc.
  search_preferences JSONB DEFAULT '{}'::jsonb, -- Zonas de interés, presupuestos
  location_base GEOGRAPHY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE PROPIEDADES (Con PostGIS para ubicación)
CREATE TABLE public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  landlord_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  details JSONB DEFAULT '{}'::jsonb, -- Cuartos, baños, parking
  tenant_criteria JSONB DEFAULT '{}'::jsonb, -- Requisitos del dueño
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address_text TEXT,
  status prop_status DEFAULT 'published',
  is_certified BOOLEAN DEFAULT FALSE, -- Certificación de habitabilidad
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE SOLICITUDES Y CHAT
CREATE TABLE public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status app_status DEFAULT 'pending',
  cover_letter TEXT,
  ai_match_score FLOAT, -- Para ranking basado en perfil
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, tenant_id)
);

CREATE TABLE public.ai_chat_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  history JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. LOGICA DE AUTOMATIZACIÓN (Trigger para Auth)
-- Crea un perfil automáticamente cuando alguien se registra en Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'tenant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. SEGURIDAD (RLS - Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Políticas: Cualquiera ve casas publicadas, pero solo dueños editan las suyas.
CREATE POLICY "Public properties are viewable by everyone" 
ON public.properties FOR SELECT USING (status = 'published');

CREATE POLICY "Users can manage their own profile" 
ON public.profiles FOR ALL USING (auth.uid() = id);

-- 8. ÍNDICES PARA BÚSQUEDA RÁPIDA
CREATE INDEX idx_properties_location ON public.properties USING GIST (location);
CREATE INDEX idx_properties_data ON public.properties USING GIN (details, tenant_criteria);