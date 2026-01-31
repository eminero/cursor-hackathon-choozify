-- 1. CREAR USUARIOS EN EL ESQUEMA DE AUTENTICACIÓN (auth.users)
-- Esto disparará automáticamente la creación de perfiles en public.profiles gracias al Trigger que creamos.

INSERT INTO auth.users (id, email, raw_user_meta_data, confirmed_at)
VALUES
-- Propietarios
(uuid_generate_v4(), 'carlos.prop@email.com', '{"full_name": "Carlos Arrendador", "role": "landlord"}', now()),
(uuid_generate_v4(), 'ana.prop@email.com', '{"full_name": "Ana Inmobiliaria", "role": "landlord"}', now()),
-- Inquilinos
(uuid_generate_v4(), 'juan.ten@email.com', '{"full_name": "Juan Inquilino", "role": "tenant"}', now()),
(uuid_generate_v4(), 'maria.ten@email.com', '{"full_name": "Maria Prospecto", "role": "tenant"}', now()),
(uuid_generate_v4(), 'luis.ten@email.com', '{"full_name": "Luis Buscador", "role": "tenant"}', now());

-- 2. ACTUALIZAR PERFILES CON DATOS ESPECÍFICOS (Matching & Geo)
-- Aquí simulamos los ingresos de los inquilinos y sus zonas de interés.

-- Juan: Ingresos altos, busca zona céntrica.
UPDATE public.profiles
SET profile_data = '{"income": 5000, "pets": false, "occupation": "Software Engineer"}',
    search_preferences = '{"max_price": 2000, "preferred_zones": ["Centro", "Norte"]}',
    location_base = ST_GeographyFromText('POINT(-74.0817 4.6097)') -- Coordenadas ejemplo (Bogotá Centro)
WHERE email = 'juan.ten@email.com';

-- Maria: Ingresos medios, tiene mascotas.
UPDATE public.profiles
SET profile_data = '{"income": 2500, "pets": true, "occupation": "Designer"}',
    search_preferences = '{"max_price": 1200, "preferred_zones": ["Sur"]}',
    location_base = ST_GeographyFromText('POINT(-74.1200 4.5800)')
WHERE email = 'maria.ten@email.com';

-- 3. INSERTAR PROPIEDADES (Para los 2 propietarios)

-- Propiedad de Carlos: Exigente, no mascotas.
INSERT INTO public.properties (landlord_id, title, description, price, details, tenant_criteria, location, address_text, status)
SELECT
  id,
  'Apartamento Moderno Centro',
  'Increíble vista, acabados de lujo.',
  1800,
  '{"rooms": 2, "bathrooms": 2, "parking": true}',
  '{"min_income": 4500, "pets_allowed": false}',
  ST_GeographyFromText('POINT(-74.0820 4.6100)'),
  'Calle 10 # 5-20',
  'published'
FROM public.profiles WHERE email = 'carlos.prop@email.com';

-- Propiedad de Ana: Más flexible, acepta mascotas.
INSERT INTO public.properties (landlord_id, title, description, price, details, tenant_criteria, location, address_text, status)
SELECT
  id,
  'Estudio acogedor Sur',
  'Cerca a parques y transporte público.',
  900,
  '{"rooms": 1, "bathrooms": 1, "parking": false}',
  '{"min_income": 2000, "pets_allowed": true}',
  ST_GeographyFromText('POINT(-74.1210 4.5810)'),
  'Av Siempre Viva 123',
  'published'
FROM public.profiles WHERE email = 'ana.prop@email.com';

-- 4. INSERTAR SOLICITUDES (Applications)

-- Juan aplica a la propiedad de Carlos (Debería ser un Match alto)
INSERT INTO public.applications (property_id, tenant_id, status, cover_letter, ai_match_score)
SELECT
  p.id, t.id, 'pending', 'Hola, me interesa mucho por la ubicación.', 0.95
FROM public.properties p, public.profiles t
WHERE p.title = 'Apartamento Moderno Centro' AND t.email = 'juan.ten@email.com';

-- Maria aplica a la propiedad de Ana
INSERT INTO public.applications (property_id, tenant_id, status, cover_letter, ai_match_score)
SELECT
  p.id, t.id, 'pending', 'Tengo un perro pequeño, espero no sea problema.', 0.88
FROM public.properties p, public.profiles t
WHERE p.title = 'Estudio acogedor Sur' AND t.email = 'maria.ten@email.com';