-- ============================================================================
-- Create Test Users (Bypassing Rate Limits)
-- Use this to create test accounts during development
-- ============================================================================
-- 
-- USAGE:
-- 1. Replace the email and other details below
-- 2. Run this SQL in your Supabase SQL Editor or via CLI
-- 3. Default password for all test users: 'password123'
-- 
-- The password hash below is for: 'password123'
-- If you need a different password, generate it using:
-- bcrypt.hash('your-password', 10)
-- ============================================================================

-- Example: Create a Landlord
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'new.landlord@example.com',  -- CHANGE THIS
  '$2a$10$rKVLLgCBWiLBQQJKoI5dguVG6n2vg0m.QrPxWtJoLRzQqmVBqBJ3u', -- password123
  NOW(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object(
    'full_name', 'New Landlord Name',  -- CHANGE THIS
    'role', 'landlord'
  ),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
RETURNING id, email;

-- Example: Create a Tenant
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'new.tenant@example.com',  -- CHANGE THIS
  '$2a$10$rKVLLgCBWiLBQQJKoI5dguVG6n2vg0m.QrPxWtJoLRzQqmVBqBJ3u', -- password123
  NOW(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object(
    'full_name', 'New Tenant Name',  -- CHANGE THIS
    'role', 'tenant'
  ),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
RETURNING id, email;

-- ============================================================================
-- NOTES:
-- 1. The trigger 'on_auth_user_created' will automatically create a profile
--    in the public.profiles table
-- 2. All users created this way have their email automatically confirmed
-- 3. This bypasses Supabase's rate limits completely
-- ============================================================================
