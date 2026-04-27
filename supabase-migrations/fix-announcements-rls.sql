-- Fix for Announcements table Row Level Security (RLS)
-- This disables RLS on the announcements table to allow insert/update/delete operations
-- For production, you should create proper policies instead

-- Disable RLS on announcements table
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
