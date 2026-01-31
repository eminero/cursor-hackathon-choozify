# Seed Data Guide for Choozify

## Overview

This guide explains how to populate your Choozify database with test data for development and testing.

## Files

1. **`Insert.sql`** - Initial seed data (MUST run first)
2. **`seed-additional-properties.sql`** - 3 additional properties + 6 applications (run after Insert.sql)

## Quick Setup

### Step 1: Run Initial Seed Data

```bash
# In Supabase Dashboard → SQL Editor
# Copy and run: utils/supabase/Insert.sql
```

**Creates:**
- 2 Landlords: Carlos, Ana
- 3 Tenants: Juan, María, Luis
- 5 Zones: Centro, Norte, Sur, Oeste, Providencia
- 3 Properties (1 Centro, 1 Sur, 1 Norte)
- 4 Applications
- 2 Chat histories

### Step 2: Run Additional Seed Data (Optional)

```bash
# In Supabase Dashboard → SQL Editor
# Copy and run: utils/supabase/seed-additional-properties.sql
```

**Adds:**
- 3 More Properties (1 Oeste, 1 Sur, 1 Providencia)
- 6 More Applications (various statuses)

## Complete Data Summary

### Users Created

#### Landlords:
| Email | Full Name | Properties |
|-------|-----------|------------|
| `carlos.prop@email.com` | Carlos Arrendador | 3 properties |
| `ana.prop@email.com` | Ana Inmobiliaria | 3 properties |

#### Tenants:
| Email | Full Name | Income | Score | Employment |
|-------|-----------|--------|-------|------------|
| `juan.ten@email.com` | Juan Inquilino | $5,000 | 750 | Full-time |
| `maria.ten@email.com` | Maria Prospecto | $2,500 | 680 | Contractor |
| `luis.ten@email.com` | Luis Buscador | $1,800 | 620 | Part-time |

### Properties Created (6 Total)

#### From Insert.sql (3 properties):

1. **Centro - High-end Apartment**
   - Landlord: Carlos
   - Price: $1,800/month
   - Bedrooms: 2
   - Parking: Yes
   - Pets: No
   - Address: Calle 10 # 5-20

2. **Sur - Affordable Studio**
   - Landlord: Ana
   - Price: $900/month
   - Bedrooms: 1
   - Parking: No
   - Pets: Yes
   - Address: Av Siempre Viva 123

3. **Norte - Budget Apartment**
   - Landlord: Carlos
   - Price: $1,200/month
   - Bedrooms: 1
   - Parking: Yes
   - Pets: No
   - Address: Carrera 15 # 85-30

#### From seed-additional-properties.sql (3 properties):

4. **Oeste - Family Home**
   - Landlord: Ana
   - Price: $1,400/month
   - Bedrooms: 3
   - Parking: Yes
   - Pets: Yes
   - Address: Carrera 68 # 45-12, Zona Oeste

5. **Sur - Budget Apartment**
   - Landlord: Carlos
   - Price: $850/month
   - Bedrooms: 2
   - Parking: No
   - Pets: Yes
   - Address: Calle 27 Sur # 34-56

6. **Providencia - Premium Penthouse**
   - Landlord: Ana
   - Price: $2,500/month
   - Bedrooms: 3
   - Parking: Yes
   - Pets: No
   - Address: Av. Providencia 1234, Piso 12

### Applications Created (10 Total)

#### From Insert.sql (4 applications):

| Tenant | Property | Zone | Status | Eligible? |
|--------|----------|------|--------|-----------|
| Juan | Carlos's Centro Apt | Centro | Submitted | ✅ Yes |
| Maria | Ana's Sur Studio | Sur | Submitted | ✅ Yes |
| Luis | Ana's Sur Studio | Sur | Submitted | ⚠️ Borderline |
| Juan | Carlos's Norte Apt | Norte | Reviewing | ✅ Yes |

#### From seed-additional-properties.sql (6 applications):

| Tenant | Property | Zone | Status | Eligible? | Notes |
|--------|----------|------|--------|-----------|-------|
| Maria | Ana's Oeste Home | Oeste | Submitted | ✅ Yes | Has pets, property allows |
| Luis | Carlos's Sur Apt | Sur | Submitted | ✅ Yes | Meets minimum |
| Maria | Carlos's Sur Apt | Sur | Reviewing | ✅ Yes | Already being reviewed |
| Juan | Ana's Oeste Home | Oeste | Accepted | ✅ Yes | Already accepted! |
| Juan | Ana's Providencia | Providencia | Submitted | ❌ No | Income too low |
| Luis | Ana's Oeste Home | Oeste | Rejected | ❌ No | Income too low |

### Zones Available

| Zone Name | Location | Coordinates |
|-----------|----------|-------------|
| Centro | Bogotá Centro | -74.0820, 4.6100 |
| Norte | Bogotá Norte | -74.0500, 4.7000 |
| Sur | Bogotá Sur | -74.1210, 4.5810 |
| Oeste | Bogotá Oeste | -74.1500, 4.6200 |
| Providencia | Santiago, Chile | -70.6100, -33.4300 |

## Application Status Distribution

After running both seed files:

- **Submitted:** 5 applications (need review)
- **Reviewing:** 2 applications (in progress)
- **Accepted:** 1 application (approved)
- **Rejected:** 1 application (declined)

## Testing Scenarios

### Test Login Credentials

**Landlord (Carlos):**
- Email: `carlos.prop@email.com`
- Has 3 properties
- Has 5 applications to review

**Landlord (Ana):**
- Email: `ana.prop@email.com`
- Has 3 properties
- Has 5 applications to review

**Tenant (Juan):**
- Email: `juan.ten@email.com`
- High income ($5,000)
- Good score (750)
- Has 4 applications

**Tenant (María):**
- Email: `maria.ten@email.com`
- Medium income ($2,500)
- Has pets
- Has 3 applications

**Tenant (Luis):**
- Email: `luis.ten@email.com`
- Low income ($1,800)
- Has 3 applications (1 rejected)

### Test Scenarios Covered

1. **Eligible Applications:** Multiple tenants meeting requirements
2. **Ineligible Applications:** Income/score not meeting minimums
3. **Pet Compatibility:** Properties allowing/not allowing pets
4. **Employment Types:** Different employment types tested
5. **Parking Requirements:** Properties with/without parking
6. **Various Statuses:** Submitted, reviewing, accepted, rejected
7. **Multiple Zones:** Properties across different neighborhoods

## Verification Queries

### Check All Applications by Landlord

```sql
SELECT 
    l.full_name AS landlord_name,
    p.zone_name,
    p.details_json->>'address' AS property_address,
    t.full_name AS tenant_name,
    a.status,
    CASE 
        WHEN t.income >= (p.criteria_json->>'min_income')::numeric
             AND t.score >= (p.criteria_json->>'min_score')::numeric
        THEN '✅ Eligible'
        ELSE '❌ Ineligible'
    END AS eligibility
FROM applications a
JOIN profiles t ON a.tenant_id = t.id
JOIN properties p ON a.property_id = p.id
JOIN profiles l ON p.landlord_id = l.id
ORDER BY l.full_name, a.status;
```

### Count Properties per Landlord

```sql
SELECT 
    p.full_name AS landlord,
    p.email,
    COUNT(prop.id) AS property_count
FROM profiles p
LEFT JOIN properties prop ON p.id = prop.landlord_id
WHERE p.role = 'landlord'
GROUP BY p.id, p.full_name, p.email;
```

### Count Applications per Property

```sql
SELECT 
    p.zone_name,
    p.details_json->>'address' AS address,
    COUNT(a.id) AS application_count,
    COUNT(CASE WHEN a.status = 'submitted' THEN 1 END) AS pending,
    COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) AS accepted
FROM properties p
LEFT JOIN applications a ON p.id = a.property_id
GROUP BY p.id, p.zone_name, p.details_json
ORDER BY application_count DESC;
```

## Troubleshooting

### Problem: "duplicate key value violates unique constraint"

**Solution:** You're trying to run the seed data again. Applications have a unique constraint on (tenant_id, property_id). Either:
1. Delete existing data first
2. Use `ON CONFLICT DO NOTHING` (already included in additional seeds)

### Problem: "null value in column violates not-null constraint"

**Solution:** Make sure you ran `Insert.sql` first before running `seed-additional-properties.sql`. The users must exist first.

### Problem: "Cannot find landlord/tenant"

**Solution:** Check that profiles were created:
```sql
SELECT id, email, full_name, role FROM profiles;
```

### Reset All Data

```sql
-- WARNING: This deletes ALL data
DELETE FROM public.applications;
DELETE FROM public.properties;
DELETE FROM public.chats;
DELETE FROM public.profiles;
DELETE FROM auth.users WHERE email LIKE '%email.com' OR email LIKE '%prop@email.com';
DELETE FROM public.zones;

-- Then re-run Insert.sql and seed-additional-properties.sql
```

## Next Steps

1. ✅ Run both seed files
2. ✅ Apply RLS policy migration (see MIGRATION_README.md)
3. ✅ Log in as landlord: `carlos.prop@email.com`
4. ✅ Navigate to `/landlord/applications`
5. ✅ Review and test application management features

## Additional Resources

- **Database Schema:** `schema.sql`
- **Migration Guide:** `MIGRATION_README.md`
- **Feature Documentation:** `LANDLORD_APPLICATIONS_FEATURE.md`
- **Setup Guide:** `SETUP_LANDLORD_APPLICATIONS.md`
