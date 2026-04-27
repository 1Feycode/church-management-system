-- Fix for all tables Row Level Security (RLS)
-- This disables RLS on all tables to allow insert operations
-- For production, you should create proper policies instead

-- Disable RLS on groups table
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- Disable RLS on members table
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Disable RLS on announcements table
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
