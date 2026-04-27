-- Fix for Groups table Row Level Security (RLS)
-- This disables RLS on the groups table to allow insert operations
-- For production, you should create proper policies instead

-- Disable RLS on groups table
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- Also ensure the members table has RLS disabled if you want to allow inserts
-- ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Also ensure the announcements table has RLS disabled if you want to allow inserts
-- ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
