-- FIX: Remove strict foreign key constraint on user_id
-- This fixes "violates foreign key constraint members_user_id_fkey"

-- Step 1: Drop the foreign key constraint
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_user_id_fkey;

-- Step 2: Keep user_id as UUID but without the foreign key reference
-- This allows inserting without needing auth.users to have the record first
ALTER TABLE members ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Step 3: Make sure RLS is still disabled
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify the constraint is gone
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'members'::regclass;

-- Step 5: Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
