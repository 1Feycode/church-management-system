-- Update Members Table for Authentication
-- This migration adds authentication-related fields to the members table

-- Add new columns if they don't exist
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS christian_since INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member'));

-- Add comments
COMMENT ON COLUMN members.user_id IS 'Foreign key to Supabase auth.users - links member to authenticated user';
COMMENT ON COLUMN members.first_name IS 'Member first name';
COMMENT ON COLUMN members.middle_name IS 'Member middle name (optional)';
COMMENT ON COLUMN members.last_name IS 'Member last name';
COMMENT ON COLUMN members.education_level IS 'Member education level';
COMMENT ON COLUMN members.christian_since IS 'Year the member became a Christian';
COMMENT ON COLUMN members.role IS 'User role: admin or member';

-- Create unique index on user_id (one member per auth user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Update existing name column to first_name if needed (optional migration)
-- UPDATE members SET first_name = name WHERE first_name IS NULL AND name IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all members" ON members;
DROP POLICY IF EXISTS "Users can insert their own profile" ON members;
DROP POLICY IF EXISTS "Users can update their own profile" ON members;
DROP POLICY IF EXISTS "Admins can do everything" ON members;

-- Create RLS policies
-- Policy: Anyone can view all members (for now, adjust based on requirements)
CREATE POLICY "Users can view all members"
ON members FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON members FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can do everything
CREATE POLICY "Admins can do everything"
ON members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Note: To create the first admin, temporarily disable RLS, insert the record, then re-enable:
-- ALTER TABLE members DISABLE ROW LEVEL SECURITY;
-- INSERT INTO members (user_id, first_name, last_name, role, ...) VALUES (..., 'admin');
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;
