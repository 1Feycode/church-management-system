-- EMERGENCY FIX FOR PROFILE CREATION ISSUE
-- Run this in Supabase SQL Editor to fix the stuck profile creation

-- ============================================
-- STEP 1: Check Current RLS Status
-- ============================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members';
-- Expected: rowsecurity should be 'false' (disabled)
-- If it shows 'true', RLS is enabled and blocking inserts

-- ============================================
-- STEP 2: Disable RLS Completely
-- ============================================
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Verify Columns Exist
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
-- You should see: user_id, first_name, middle_name, last_name, 
-- education_level, christian_since, role

-- ============================================
-- STEP 4: Check if Profile Already Exists
-- ============================================
-- Replace 'YOUR_EMAIL' with your actual email
SELECT * FROM members 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL'
);
-- If this returns a row, profile already exists!
-- If empty, profile needs to be created

-- ============================================
-- STEP 5: Check Auth Users
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
-- Copy your user ID from here

-- ============================================
-- STEP 6: Manual Profile Creation (if needed)
-- ============================================
-- Replace 'YOUR_USER_ID' with the ID from Step 5
-- Replace other values with your actual data
INSERT INTO members (
  user_id,
  first_name,
  middle_name,
  last_name,
  name,
  phone,
  email,
  address,
  baptism_status,
  education_level,
  christian_since,
  role
) VALUES (
  'YOUR_USER_ID',  -- Replace with your user ID
  'John',          -- Replace with your first name
  'Michael',       -- Replace with your middle name (or NULL)
  'Doe',           -- Replace with your last name
  'John Doe',      -- Full name
  '+1234567890',   -- Phone (or NULL)
  'john@example.com', -- Email
  '123 Main St',   -- Address (or NULL)
  true,            -- Baptism status (true/false)
  'Bachelor''s Degree', -- Education level (or NULL)
  2020,            -- Christian since year (or NULL)
  'member'         -- Role: 'member' or 'admin'
);

-- ============================================
-- STEP 7: Verify Profile Was Created
-- ============================================
SELECT * FROM members WHERE user_id IS NOT NULL;

-- ============================================
-- STEP 8: Create First Admin User (Optional)
-- ============================================
-- If you want to make yourself an admin, run this:
-- Replace 'YOUR_USER_ID' with your actual user ID
UPDATE members 
SET role = 'admin' 
WHERE user_id = 'YOUR_USER_ID';

-- ============================================
-- STEP 9: Final Verification
-- ============================================
-- Check RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'members';

-- Check your profile exists
SELECT id, user_id, first_name, last_name, email, role 
FROM members 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');

-- ============================================
-- TROUBLESHOOTING NOTES
-- ============================================
-- If profile creation still fails in the app:
-- 1. Open browser DevTools (F12)
-- 2. Go to Console tab
-- 3. Try creating profile again
-- 4. Look for error messages in red
-- 5. Share those errors for specific help

-- Common errors and fixes:
-- - "duplicate key value" → Profile already exists, use UPDATE instead
-- - "violates foreign key constraint" → user_id doesn't exist in auth.users
-- - "violates row-level security policy" → RLS still enabled, run Step 2 again
-- - "column does not exist" → Run the fix-members-table-for-auth.sql migration

-- ============================================
-- RESET EVERYTHING (Last Resort)
-- ============================================
-- Only run this if you want to start completely fresh
-- WARNING: This deletes ALL members data!
/*
DELETE FROM members;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
-- Then try creating profile again in the app
*/
