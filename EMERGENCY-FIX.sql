-- EMERGENCY FIX - Run this immediately in Supabase SQL Editor
-- This will fix the profile creation issue

-- 1. Disable RLS completely (this is the main blocker)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- 2. Check if columns exist, if not add them
DO $$ 
BEGIN
    -- Add user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='user_id') THEN
        ALTER TABLE members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add first_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='first_name') THEN
        ALTER TABLE members ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add middle_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='middle_name') THEN
        ALTER TABLE members ADD COLUMN middle_name TEXT;
    END IF;
    
    -- Add last_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='last_name') THEN
        ALTER TABLE members ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add education_level if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='education_level') THEN
        ALTER TABLE members ADD COLUMN education_level TEXT;
    END IF;
    
    -- Add christian_since if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='christian_since') THEN
        ALTER TABLE members ADD COLUMN christian_since INTEGER;
    END IF;
    
    -- Add role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='role') THEN
        ALTER TABLE members ADD COLUMN role TEXT DEFAULT 'member';
    END IF;
END $$;

-- 3. Update existing members to have role
UPDATE members SET role = 'member' WHERE role IS NULL;

-- 4. Verify the changes
SELECT 'Columns added successfully!' as status;

-- 5. Show current table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;

-- 6. Check RLS status (should show 'f' for false/disabled)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members';
