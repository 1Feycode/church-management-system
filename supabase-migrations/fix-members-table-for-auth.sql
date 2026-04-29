-- Fix Members Table for Authentication
-- This migration properly updates the members table for auth support

-- Step 1: Disable RLS temporarily to avoid issues
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Step 2: Add new columns if they don't exist (without NOT NULL first)
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS christian_since INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'));

-- Step 3: Update existing records to have default role
UPDATE members SET role = 'member' WHERE role IS NULL;

-- Step 4: Now make role NOT NULL (after all records have a value)
ALTER TABLE members ALTER COLUMN role SET NOT NULL;

-- Step 5: Migrate existing name to first_name and last_name if needed
UPDATE members 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
    THEN SPLIT_PART(name, ' ', 2)
    ELSE SPLIT_PART(name, ' ', 1)
  END
WHERE first_name IS NULL AND name IS NOT NULL;

-- Step 6: Create unique index on user_id (one member per auth user)
DROP INDEX IF EXISTS idx_members_user_id;
CREATE UNIQUE INDEX idx_members_user_id ON members(user_id) WHERE user_id IS NOT NULL;

-- Step 7: Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Step 8: Add comments
COMMENT ON COLUMN members.user_id IS 'Foreign key to Supabase auth.users - links member to authenticated user';
COMMENT ON COLUMN members.first_name IS 'Member first name';
COMMENT ON COLUMN members.middle_name IS 'Member middle name (optional)';
COMMENT ON COLUMN members.last_name IS 'Member last name';
COMMENT ON COLUMN members.education_level IS 'Member education level';
COMMENT ON COLUMN members.christian_since IS 'Year the member became a Christian';
COMMENT ON COLUMN members.role IS 'User role: admin or member';

-- Step 9: Keep RLS disabled for now (easier for development)
-- You can enable it later when ready
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Step 10: Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all members" ON members;
DROP POLICY IF EXISTS "Users can insert their own profile" ON members;
DROP POLICY IF EXISTS "Users can update their own profile" ON members;
DROP POLICY IF EXISTS "Admins can do everything" ON members;

-- Step 11: Create RLS policies (but RLS is disabled, so they won't block anything yet)
CREATE POLICY "Users can view all members"
ON members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON members FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

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

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
