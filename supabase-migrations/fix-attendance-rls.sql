-- Fix Row Level Security for attendance table
-- This disables RLS to allow insert/update/delete operations
-- For production, you should create proper policies instead

-- Disable RLS on attendance table
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
