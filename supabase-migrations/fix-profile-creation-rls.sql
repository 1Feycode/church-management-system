-- Fix Profile Creation RLS Issue
-- This migration fixes the RLS policy to allow new users to create their profile

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON members;

-- Create a more permissive insert policy
-- This allows authenticated users to insert a profile with their own user_id
CREATE POLICY "Users can insert their own profile"
ON members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Alternative: If the above doesn't work, temporarily disable RLS for testing
-- Uncomment the line below to disable RLS (NOT recommended for production)
-- ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS after testing:
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'members';
