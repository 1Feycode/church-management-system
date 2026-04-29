# Quick Fix Guide - Profile Creation Issue

## Problem
- Form disappears after submission
- Black loading page appears
- Members table has old data without auth columns

## Solution (Follow these steps in order)

### Step 1: Run the Fixed Migration

Go to **Supabase Dashboard** → **SQL Editor** and run this:

```sql
-- Fix Members Table for Authentication
-- This migration properly updates the members table for auth support

-- Step 1: Disable RLS temporarily to avoid issues
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Step 2: Add new columns if they don't exist
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS christian_since INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'));

-- Step 3: Update existing records to have default role
UPDATE members SET role = 'member' WHERE role IS NULL;

-- Step 4: Now make role NOT NULL
ALTER TABLE members ALTER COLUMN role SET NOT NULL;

-- Step 5: Migrate existing name to first_name and last_name
UPDATE members 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
    THEN SPLIT_PART(name, ' ', 2)
    ELSE SPLIT_PART(name, ' ', 1)
  END
WHERE first_name IS NULL AND name IS NOT NULL;

-- Step 6: Create unique index on user_id
DROP INDEX IF EXISTS idx_members_user_id;
CREATE UNIQUE INDEX idx_members_user_id ON members(user_id) WHERE user_id IS NOT NULL;

-- Step 7: Create index on role
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
```

### Step 2: Verify the Migration

Run this to check if columns were added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
```

You should see:
- `user_id` (uuid)
- `first_name` (text)
- `middle_name` (text)
- `last_name` (text)
- `education_level` (text)
- `christian_since` (integer)
- `role` (text)

### Step 3: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use: Ctrl+Shift+Delete → Clear cache

### Step 4: Logout and Login Again

1. If you're stuck on a loading page, go to: `http://localhost:5173/login`
2. Sign in again
3. Fill out the profile form
4. Submit

### Step 5: Check if Profile Was Created

Run this in Supabase SQL Editor:

```sql
SELECT * FROM members WHERE user_id IS NOT NULL;
```

You should see your new profile with all the auth fields filled.

## If Still Not Working

### Option A: Create Profile Manually

1. Get your user ID:
```sql
SELECT id, email FROM auth.users;
```

2. Create profile manually:
```sql
INSERT INTO members (
  user_id,
  first_name,
  last_name,
  name,
  email,
  role
) VALUES (
  'YOUR_USER_ID_FROM_STEP_1',
  'Your',
  'Name',
  'Your Name',
  'your@email.com',
  'member'
);
```

3. Refresh the app and go to `/dashboard`

### Option B: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Share the errors for specific help

### Option C: Reset Everything

If nothing works, reset:

```sql
-- Delete all members
DELETE FROM members;

-- Disable RLS
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- Try creating profile again
```

## Expected Behavior After Fix

1. Login → Redirects to `/complete-profile`
2. Fill form → Click "Complete Profile"
3. Profile created → Redirects to `/dashboard`
4. Dashboard loads with sidebar and navbar

## Common Issues

### Issue: "column 'role' does not exist"
**Fix:** Run Step 1 migration again

### Issue: "duplicate key value violates unique constraint"
**Fix:** Profile already exists. Check with:
```sql
SELECT * FROM members WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL');
```

### Issue: Still shows loading page
**Fix:** 
1. Clear browser cache
2. Go directly to `/login`
3. Login again

### Issue: "new row violates row-level security policy"
**Fix:** RLS is still enabled. Run:
```sql
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
```

## Verification Checklist

- [ ] Migration ran successfully
- [ ] New columns exist in members table
- [ ] RLS is disabled
- [ ] Browser cache cleared
- [ ] Logged out and back in
- [ ] Profile form loads
- [ ] Profile creation works
- [ ] Redirects to dashboard
- [ ] Dashboard loads properly

## Need More Help?

Share:
1. Browser console errors
2. Result of: `\d members` in Supabase
3. Result of: `SELECT * FROM members;`
4. Screenshot of the issue
