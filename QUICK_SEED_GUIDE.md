# 🚀 Quick Seed Data Guide

## TL;DR - Copy & Paste This

### Step 1: Go to Supabase Dashboard
https://app.supabase.com → Your Project → SQL Editor

### Step 2: Run This SQL

```sql
-- Copy and paste the entire contents of:
-- utils/supabase/seed-additional-properties.sql
```

**Or use this direct link to the file:**
`utils/supabase/seed-additional-properties.sql`

---

## What You'll Get

### 3 New Properties

1. **Oeste - Family Home** ($1,400/mo, 3 bed, pets OK) - Ana
2. **Sur - Budget Apartment** ($850/mo, 2 bed, pets OK) - Carlos  
3. **Providencia - Premium Penthouse** ($2,500/mo, 3 bed, no pets) - Ana

### 6 New Applications

| Tenant | Property | Status | Eligible |
|--------|----------|--------|----------|
| Maria → Oeste | Submitted | ✅ Yes |
| Luis → Sur | Submitted | ✅ Yes |
| Maria → Sur | Reviewing | ✅ Yes |
| Juan → Oeste | Accepted | ✅ Yes |
| Juan → Providencia | Submitted | ❌ No (low income) |
| Luis → Oeste | Rejected | ❌ No (low income) |

---

## After Running

### Total Data in Database:

- **6 Properties** total (3 from Insert.sql + 3 new)
- **10 Applications** total (4 from Insert.sql + 6 new)
- **5 Zones** (Centro, Norte, Sur, Oeste, Providencia)
- **2 Landlords** (Carlos, Ana)
- **3 Tenants** (Juan, María, Luis)

### Test the Feature:

1. Log in as landlord: `carlos.prop@email.com`
2. Go to: `/landlord/applications`
3. You should see **5 applications** for Carlos
4. Click any application to see full details

---

## Application Status Breakdown

After seeding:
- 🟡 **5 Submitted** (pending review)
- 🔵 **2 Reviewing** (in progress)
- 🟢 **1 Accepted** (approved)
- 🔴 **2 Rejected** (declined)

---

## Verification

Run this to check it worked:

```sql
SELECT COUNT(*) as total_properties FROM properties;
-- Should show: 6

SELECT COUNT(*) as total_applications FROM applications;
-- Should show: 10
```

---

## Full Documentation

For complete details, see:
- **`utils/supabase/SEED_DATA_README.md`** - Complete seed data guide
- **`utils/supabase/seed-additional-properties.sql`** - The SQL file to run

---

## Troubleshooting

**"duplicate key" error?**
→ You already ran this. It's using `ON CONFLICT DO NOTHING`, so it's safe.

**"cannot find user" error?**
→ Run `Insert.sql` first to create users.

**Not seeing applications?**
→ Make sure you ran the RLS policy migration (see MIGRATION_README.md)

---

That's it! 🎉
