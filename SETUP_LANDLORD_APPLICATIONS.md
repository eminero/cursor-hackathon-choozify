# Quick Setup Guide: Landlord Applications Feature

## 🚀 Quick Start (3 Steps)

### Step 1: Run Database Migration ⚠️ REQUIRED

The feature won't work without this migration!

**Option A: Supabase Dashboard (Easiest)**
1. Open your Supabase project: https://app.supabase.com
2. Go to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add policy for landlords to view tenant profiles through applications
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

4. Click **Run** or press `Cmd/Ctrl + Enter`
5. You should see: "Success. No rows returned"

**Option B: Use the migration file**
```bash
# File location:
cat utils/supabase/migrations/add_landlord_view_tenant_profiles_policy.sql

# Copy the contents and run in Supabase SQL Editor
```

### Step 2: Verify Your Test Data

Make sure you have:
- ✅ At least one landlord user
- ✅ At least one tenant user  
- ✅ At least one property owned by the landlord
- ✅ At least one application from tenant to landlord's property

**Quick test data insert:**
```sql
-- Check existing applications
SELECT 
  a.id,
  a.status,
  t.email as tenant_email,
  l.email as landlord_email,
  p.zone_name
FROM applications a
JOIN profiles t ON a.tenant_id = t.id
JOIN properties p ON a.property_id = p.id
JOIN profiles l ON p.landlord_id = l.id;
```

### Step 3: Test the Feature

1. **Log in as a landlord**
   ```
   Email: landlord.test@example.com
   Password: password123
   ```

2. **Access applications** (any of these methods):
   - Click "Aplicaciones" in the top navigation bar
   - Click "Ver Aplicaciones" button on dashboard
   - Click the "Aplicaciones Pendientes" stat card

3. **Review an application:**
   - Click on any application card
   - You should see full tenant details
   - Try accepting or rejecting the application

## ✅ Verification Checklist

After migration, verify these work:

- [ ] Navigate to `/landlord/applications` - page loads
- [ ] See list of applications - no errors in console
- [ ] Click an application - detail page opens
- [ ] See tenant profile info (income, score, employment)
- [ ] See eligibility status (green or red banner)
- [ ] See lifestyle preferences (pets, smoking, parking)
- [ ] Click "Aceptar Aplicación" - status updates
- [ ] No RLS (Row Level Security) errors in console

## 🐛 Troubleshooting

### Problem: "Applications page is blank"
**Solution:** Check browser console for errors. Most likely the migration wasn't run.

### Problem: "Row level security policy violated"
**Solution:** Run the migration SQL. This adds the required RLS policy.

### Problem: "Can't see tenant details"
**Symptom:** Application loads but profile fields show empty or N/A
**Solution:** 
1. Run the migration
2. Clear browser cache
3. Log out and log back in

### Problem: "No applications showing"
**Solution:** Make sure you have test applications in the database:
```sql
-- Check applications for your landlord account
SELECT * FROM applications a
JOIN properties p ON a.property_id = p.id
WHERE p.landlord_id = auth.uid();
```

### Problem: "Accept/Reject buttons don't work"
**Solution:** Check:
1. Browser console for errors
2. Network tab for failed API calls
3. Verify you're logged in as a landlord

## 📱 Feature Navigation

### From Dashboard:
```
Dashboard → "Ver Aplicaciones" button → Applications List
Dashboard → "Aplicaciones Pendientes" card → Applications List
Dashboard → Recent Applications → Click item → Application Detail
```

### From Navbar:
```
Top Navigation → "Aplicaciones" link → Applications List
Applications List → Click any card → Application Detail
```

## 🎯 Key Pages

1. **Applications List:** `/landlord/applications`
   - Shows all applications across all properties
   - Grouped by status
   - Click any card to see details

2. **Application Detail:** `/landlord/applications/[id]`
   - Complete tenant profile
   - Eligibility analysis
   - Accept/reject actions
   - Property information

## 📊 What Landlords Can See

### Tenant Financial Info:
- Monthly income (with requirement comparison)
- Credit score (with requirement comparison)
- Employment type (with allowed types check)

### Tenant Lifestyle:
- Has pets? (and property compatibility)
- Smokes? (and property compatibility)
- Needs parking? (and property availability)
- Preferred zones

### Eligibility Status:
- ✅ Green banner: "Cumple todos los requisitos"
- ❌ Red banner: "No cumple algunos requisitos"
- Individual ✓/✗ for each criterion

## 🔒 Security Notes

The feature is secure:
- ✅ Landlords can ONLY see applicants to their own properties
- ✅ Row-Level Security (RLS) enforced at database level
- ✅ API endpoints verify landlord ownership
- ✅ All queries filtered by authenticated user ID

## 📚 Additional Documentation

- **Full Feature Documentation:** `LANDLORD_APPLICATIONS_FEATURE.md`
- **Migration Details:** `utils/supabase/MIGRATION_README.md`
- **Database Schema:** `utils/supabase/schema.sql`

## 🆘 Still Having Issues?

1. Check all linter errors: `npm run lint`
2. Verify environment variables are set
3. Check Supabase project is active
4. Review browser console for specific errors
5. Check the detailed documentation in `LANDLORD_APPLICATIONS_FEATURE.md`

---

**That's it!** The feature should now be working. 🎉

If you completed the migration and verification checklist, landlords can now fully review and manage tenant applications.
