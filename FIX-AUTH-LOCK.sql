-- FIX AUTH LOCK TIMEOUT ISSUE
-- Run this in Supabase SQL Editor

-- Step 1: Disable RLS (this is likely causing the lock)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members';
-- Should show: rowsecurity = false

-- Step 3: Check if profile already exists
-- Replace 'your@email.com' with your actual email
SELECT * FROM members 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);

-- Step 4: If profile exists, delete it so you can recreate
-- Uncomment the line below if you want to start fresh
-- DELETE FROM members WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'your@email.com');

-- Step 5: Verify members table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members'
ORDER BY ordinal_position;
