# Development Guide - Choozify

## Common Development Issues & Solutions

### 1. Email Rate Limit Exceeded Error

**Problem:** Supabase has rate limits on auth operations (especially signups) to prevent abuse. During development, you might see "email rate limit exceeded" errors.

**Solutions:**

#### Option A: Create Test Users via SQL (Recommended for Development)
Use the helper SQL script to create test accounts directly:

```bash
# Run the SQL script
cat utils/supabase/create-test-user.sql
```

Or use the Supabase SQL Editor to run:
```sql
-- See utils/supabase/create-test-user.sql for the full script
```

**Test Accounts Created:**
- Landlord: `landlord@demo.com` / `test1234`
- Landlord: `landlord.test@example.com` / `password123`

#### Option B: Disable Email Confirmation (Development Only)
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, disable:
   - "Confirm email" (set to OFF)
4. Set "Minimum password length" to 6 (for testing)
5. Save changes

This allows unlimited signups without email confirmation during development.

#### Option C: Use Different Email Domains
If rate limited, try using different email providers:
- Use `+` addressing: `youremail+test1@gmail.com`, `youremail+test2@gmail.com`
- Use different domains: `@gmail.com`, `@yahoo.com`, `@outlook.com`, `@example.com`

#### Option D: Wait for Rate Limit Reset
Supabase rate limits typically reset after 1 hour. You can wait and try again.

### 2. Image Loading Issues

**Problem:** Property images from Supabase Storage return 400/404 errors.

**Solution:**
1. Verify the image paths in the database match the actual files in Storage
2. Check that the `properties` bucket is public
3. Ensure `next.config.ts` includes Supabase domains in `remotePatterns`

See the database update in this commit for the fix applied to property #1.

### 3. Missing Environment Variables

**Problem:** `OPENAI_API_KEY` or Supabase keys not found.

**Solution:**
Create a `.env.local` file (not committed to git):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration (Optional - for AI chat)
OPENAI_API_KEY=your-openai-api-key
```

## Running the Development Server

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000` (or 3001 if 3000 is in use).

## Database Management

### Reset Database
If you need to reset the database and start fresh:

```bash
# Run the schema
# Then run the Insert.sql for sample data
```

### Create Additional Test Properties
Modify `utils/supabase/Insert.sql` and add more property entries, or create them via the landlord dashboard.

## Testing Different User Roles

### Landlord Features
- Login as: `landlord.test@example.com` / `password123`
- Access: `/landlord/dashboard`
- Can create properties, view applications

### Tenant Features
- Login as: `juan.ten@email.com` (no password - use SQL to set one)
- Access: `/tenant/dashboard`
- Can search properties, apply to properties

## Useful SQL Queries

### List All Users
```sql
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
ORDER BY created_at DESC;
```

### List All Profiles
```sql
SELECT id, email, full_name, role 
FROM profiles 
ORDER BY created_at DESC;
```

### List All Properties
```sql
SELECT id, zone_name, details_json->>'price' as price, status 
FROM properties 
ORDER BY created_at DESC;
```

### Delete a Test User
```sql
-- This will cascade delete the profile
DELETE FROM auth.users WHERE email = 'test@example.com';
```

## Additional Tips

1. **Supabase Studio:** Use the Supabase Dashboard's Table Editor for quick data inspection
2. **Browser DevTools:** Check Network tab for API errors
3. **Next.js DevTools:** Use React DevTools to inspect component state
4. **Logs:** Check terminal output for server-side errors

## Production Considerations

Before deploying to production:
1. ✅ Re-enable email confirmation in Supabase Auth
2. ✅ Remove test accounts
3. ✅ Set strong password requirements
4. ✅ Configure proper rate limits
5. ✅ Set up proper error logging (e.g., Sentry)
6. ✅ Add OPENAI_API_KEY for AI chat functionality
