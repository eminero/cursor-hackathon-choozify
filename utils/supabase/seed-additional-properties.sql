-- ============================================================================
-- Additional Sample Data - 3 More Properties and Applications
-- Date: January 31, 2026
-- Purpose: Expand test data for landlord application review feature
-- ============================================================================

-- IMPORTANT: Run this AFTER the main Insert.sql to add more test data
-- This assumes the following exist:
-- - Landlords: carlos.prop@email.com, ana.prop@email.com
-- - Tenants: juan.ten@email.com, maria.ten@email.com, luis.ten@email.com
-- - Zones: Centro, Norte, Sur, Oeste, Providencia

-- ============================================================================
-- 1. INSERT 3 NEW PROPERTIES
-- ============================================================================

-- Property 1: Ana's Oeste Property - Family home with parking and pets allowed
INSERT INTO public.properties (
    landlord_id, 
    zone_name, 
    details_json, 
    criteria_json, 
    location_geom, 
    status,
    images_json
)
SELECT
    p.id,
    'Oeste',
    jsonb_build_object(
        'price', 1400,
        'bedrooms', 3,
        'has_parking', true,
        'address', 'Carrera 68 # 45-12, Zona Oeste'
    ),
    jsonb_build_object(
        'min_income', 3500,
        'min_score', 650,
        'employment_types_allowed', ARRAY['full_time', 'contractor', 'self_employed'],
        'pets_allowed', true,
        'smoking_allowed', false
    ),
    ST_SetSRID(ST_MakePoint(-74.1500, 4.6200), 4326), -- Oeste centroid
    'active',
    '[]'::jsonb
FROM public.profiles p
WHERE p.email = 'ana.prop@email.com'
LIMIT 1;

-- Property 2: Carlos's Sur Property - Budget apartment, no parking, flexible on pets
INSERT INTO public.properties (
    landlord_id, 
    zone_name, 
    details_json, 
    criteria_json, 
    location_geom, 
    status,
    images_json
)
SELECT
    p.id,
    'Sur',
    jsonb_build_object(
        'price', 850,
        'bedrooms', 2,
        'has_parking', false,
        'address', 'Calle 27 Sur # 34-56'
    ),
    jsonb_build_object(
        'min_income', 2200,
        'min_score', 600,
        'employment_types_allowed', ARRAY['full_time', 'part_time', 'contractor', 'student'],
        'pets_allowed', true,
        'smoking_allowed', false
    ),
    ST_SetSRID(ST_MakePoint(-74.1250, 4.5750), 4326), -- Sur zone, slight variation
    'active',
    '[]'::jsonb
FROM public.profiles p
WHERE p.email = 'carlos.prop@email.com'
LIMIT 1;

-- Property 3: Ana's Providencia Property - Premium penthouse, high requirements
INSERT INTO public.properties (
    landlord_id, 
    zone_name, 
    details_json, 
    criteria_json, 
    location_geom, 
    status,
    images_json
)
SELECT
    p.id,
    'Providencia',
    jsonb_build_object(
        'price', 2500,
        'bedrooms', 3,
        'has_parking', true,
        'address', 'Av. Providencia 1234, Piso 12'
    ),
    jsonb_build_object(
        'min_income', 7000,
        'min_score', 750,
        'employment_types_allowed', ARRAY['full_time', 'self_employed'],
        'pets_allowed', false,
        'smoking_allowed', false
    ),
    ST_SetSRID(ST_MakePoint(-70.6100, -33.4300), 4326), -- Providencia centroid (Santiago, Chile)
    'active',
    '[]'::jsonb
FROM public.profiles p
WHERE p.email = 'ana.prop@email.com'
LIMIT 1;

-- ============================================================================
-- 2. INSERT APPLICATIONS FOR THESE PROPERTIES
-- ============================================================================

-- Application 1: Maria applies to Ana's Oeste property
-- Good match: has pets, property allows pets, income sufficient
INSERT INTO public.applications (tenant_id, property_id, status, visit_scheduled_at)
SELECT
    tenant.id,
    prop.id,
    'submitted',
    now() + interval '5 days' -- Schedule visit in 5 days
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'maria.ten@email.com'
    AND prop.zone_name = 'Oeste'
    AND prop.details_json->>'address' = 'Carrera 68 # 45-12, Zona Oeste'
LIMIT 1
ON CONFLICT (tenant_id, property_id) DO NOTHING;

-- Application 2: Luis applies to Carlos's Sur property
-- Good match: income meets minimum, part-time allowed, pets not an issue
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
    AND prop.details_json->>'address' = 'Calle 27 Sur # 34-56'
LIMIT 1
ON CONFLICT (tenant_id, property_id) DO NOTHING;

-- Application 3: Maria also applies to Carlos's Sur property
-- Good match: contractor allowed, pets allowed, income sufficient
INSERT INTO public.applications (tenant_id, property_id, status)
SELECT
    tenant.id,
    prop.id,
    'reviewing' -- Already under review by landlord
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'maria.ten@email.com'
    AND prop.zone_name = 'Sur'
    AND prop.details_json->>'address' = 'Calle 27 Sur # 34-56'
LIMIT 1
ON CONFLICT (tenant_id, property_id) DO NOTHING;

-- Application 4: Juan applies to Ana's Oeste property
-- Perfect match: high income, no pets, full-time employment, needs parking
INSERT INTO public.applications (tenant_id, property_id, status)
SELECT
    tenant.id,
    prop.id,
    'accepted' -- Landlord already accepted this application
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'juan.ten@email.com'
    AND prop.zone_name = 'Oeste'
    AND prop.details_json->>'address' = 'Carrera 68 # 45-12, Zona Oeste'
LIMIT 1
ON CONFLICT (tenant_id, property_id) DO NOTHING;

-- Application 5: Juan applies to Ana's Providencia property
-- Bad match: income too low ($5000 vs required $7000)
-- This demonstrates an ineligible application
INSERT INTO public.applications (tenant_id, property_id, status)
SELECT
    tenant.id,
    prop.id,
    'submitted'
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'juan.ten@email.com'
    AND prop.zone_name = 'Providencia'
    AND prop.details_json->>'address' = 'Av. Providencia 1234, Piso 12'
LIMIT 1
ON CONFLICT (tenant_id, property_id) DO NOTHING;

-- Application 6: Luis applies to Ana's Oeste property
-- Bad match: income too low ($1800 vs required $3500)
-- Another ineligible application example
INSERT INTO public.applications (tenant_id, property_id, status)
SELECT
    tenant.id,
    prop.id,
    'rejected' -- Landlord already rejected due to low income
FROM 
    public.profiles tenant,
    public.properties prop
WHERE 
    tenant.email = 'luis.ten@email.com'
    AND prop.zone_name = 'Oeste'
    AND prop.details_json->>'address' = 'Carrera 68 # 45-12, Zona Oeste'
LIMIT 1
ON CONFLICT (tenant_id, property_id) DO NOTHING;

-- ============================================================================
-- 3. VERIFICATION QUERIES
-- ============================================================================

-- Verify new properties were created
DO $$
DECLARE
    new_prop_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO new_prop_count
    FROM public.properties
    WHERE details_json->>'address' IN (
        'Carrera 68 # 45-12, Zona Oeste',
        'Calle 27 Sur # 34-56',
        'Av. Providencia 1234, Piso 12'
    );
    
    RAISE NOTICE '✓ Successfully created % new properties', new_prop_count;
    
    IF new_prop_count < 3 THEN
        RAISE WARNING 'Expected 3 properties, but only created %', new_prop_count;
    END IF;
END $$;

-- Verify applications were created
DO $$
DECLARE
    new_app_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO new_app_count
    FROM public.applications a
    JOIN public.properties p ON a.property_id = p.id
    WHERE p.details_json->>'address' IN (
        'Carrera 68 # 45-12, Zona Oeste',
        'Calle 27 Sur # 34-56',
        'Av. Providencia 1234, Piso 12'
    );
    
    RAISE NOTICE '✓ Successfully created % new applications', new_app_count;
    
    IF new_app_count < 6 THEN
        RAISE WARNING 'Expected 6 applications, but only created %', new_app_count;
    END IF;
END $$;

-- Show summary of new data
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SUMMARY OF NEW DATA CREATED';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'NEW PROPERTIES:';
    RAISE NOTICE '1. Ana''s Oeste Property: $1,400/month, 3 bed, parking, pets OK';
    RAISE NOTICE '2. Carlos''s Sur Property: $850/month, 2 bed, no parking, pets OK';
    RAISE NOTICE '3. Ana''s Providencia Property: $2,500/month, 3 bed, parking, no pets';
    RAISE NOTICE '';
    RAISE NOTICE 'NEW APPLICATIONS:';
    RAISE NOTICE '1. Maria → Oeste (submitted) ✓ eligible';
    RAISE NOTICE '2. Luis → Sur (submitted) ✓ eligible';
    RAISE NOTICE '3. Maria → Sur (reviewing) ✓ eligible';
    RAISE NOTICE '4. Juan → Oeste (accepted) ✓ eligible';
    RAISE NOTICE '5. Juan → Providencia (submitted) ✗ ineligible (low income)';
    RAISE NOTICE '6. Luis → Oeste (rejected) ✗ ineligible (low income)';
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;

-- Optional: Display detailed view of all applications by landlord
SELECT 
    l.full_name AS landlord_name,
    l.email AS landlord_email,
    p.zone_name,
    p.details_json->>'address' AS property_address,
    p.details_json->>'price' AS monthly_price,
    t.full_name AS tenant_name,
    t.email AS tenant_email,
    t.income AS tenant_income,
    t.score AS tenant_score,
    a.status AS application_status,
    a.created_at AS application_date
FROM 
    public.applications a
    JOIN public.profiles t ON a.tenant_id = t.id
    JOIN public.properties p ON a.property_id = p.id
    JOIN public.profiles l ON p.landlord_id = l.id
WHERE
    p.details_json->>'address' IN (
        'Carrera 68 # 45-12, Zona Oeste',
        'Calle 27 Sur # 34-56',
        'Av. Providencia 1234, Piso 12'
    )
ORDER BY 
    l.email, p.zone_name, a.created_at;
