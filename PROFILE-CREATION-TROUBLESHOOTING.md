# Profile Creation Troubleshooting Guide

## Current Issue
- Profile form loads correctly
- User fills out all fields
- Clicks "Complete Profile" button
- Button shows "Creating Profile..." (loading state)
- Page stays stuck in loading state indefinitely
- Profile is never created in database

## Root Cause Analysis

The issue is most likely one of these:

1. **Row Level Security (RLS) is blocking the insert** - Most common
2. **JavaScript error preventing the request** - Check console
3. **Profile already exists** - Duplicate key error
4. **Network/Supabase connection issue** - Check network tab

## Step-by-Step Fix

### Step 1: Check Browser Console for Errors

**This is the MOST IMPORTANT step!**

1. Open your browser DevTools:
   - Press `F12` OR
   - Right-click → "Inspect" OR
   - `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

2. Click the **Console** tab

3. Clear the console (trash icon)

4. Try creating the profile again

5. **Look for error messages in RED**

6. Take a screenshot or copy the error message

**Common errors you might see:**

```
Error creating profile: {code: "42501", message: "new row violates row-level security policy"}
```
→ **Fix:** RLS is blocking the insert. Go to Step 2.

```
Error creating profile: {code: "23505", message: "duplicate key value violates unique constraint"}
```
→ **Fix:** Profile already exists. Go to Step 3.

```
Error creating profile: {code: "23503", message: "violates foreign key constraint"}
```
→ **Fix:** user_id doesn't match auth.users. Go to Step 4.

```
TypeError: Cannot read property 'id' of null
```
→ **Fix:** User not logged in. Go to Step 5.

### Step 2: Disable Row Level Security (RLS)

**If you see RLS error in console:**

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Run this command:

```sql
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
```

4. Verify it's disabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members';
```

Expected result: `rowsecurity = false`

5. Go back to your app
6. **Clear browser cache** (Ctrl+Shift+Delete)
7. **Logout** (if logged in)
8. **Login again**
9. Try creating profile again

### Step 3: Check if Profile Already Exists

**If you see duplicate key error:**

1. Go to **Supabase Dashboard** → **SQL Editor**

2. Check if profile exists:

```sql
-- Replace 'your@email.com' with your actual email
SELECT * FROM members 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);
```

3. **If profile exists:**
   - You don't need to create it again!
   - Just go to: `http://localhost:5173/dashboard`
   - It should load normally

4. **If you want to recreate it:**

```sql
-- Delete existing profile
DELETE FROM members WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'your@email.com'
);

-- Then try creating profile in the app again
```

### Step 4: Verify User ID Exists

**If you see foreign key constraint error:**

1. Check your auth user exists:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

2. Check if user_id matches:

```sql
-- In browser console, check what user ID the app is using
console.log('User ID:', user?.id)
```

3. If they don't match, logout and login again

### Step 5: Verify User is Logged In

**If you see "Cannot read property 'id' of null":**

1. User is not logged in
2. Go to: `http://localhost:5173/login`
3. Login again
4. Try creating profile

### Step 6: Manual Profile Creation (Workaround)

**If nothing else works, create profile manually:**

1. Get your user ID:

```sql
SELECT id, email FROM auth.users WHERE email = 'your@email.com';
```

Copy the `id` value.

2. Create profile manually:

```sql
-- Replace values with your actual data
INSERT INTO members (
  user_id,
  first_name,
  middle_name,
  last_name,
  name,
  phone,
  email,
  address,
  baptism_status,
  education_level,
  christian_since,
  role
) VALUES (
  'YOUR_USER_ID_FROM_STEP_1',  -- Paste your user ID here
  'John',                       -- Your first name
  'Michael',                    -- Your middle name (or NULL)
  'Doe',                        -- Your last name
  'John Doe',                   -- Full name
  '+1234567890',                -- Phone (or NULL)
  'john@example.com',           -- Email
  '123 Main St',                -- Address (or NULL)
  true,                         -- Baptism status (true/false)
  'Bachelor''s Degree',         -- Education level (or NULL)
  2020,                         -- Christian since year (or NULL)
  'member'                      -- Role: 'member' or 'admin'
);
```

3. Verify it was created:

```sql
SELECT * FROM members WHERE user_id = 'YOUR_USER_ID';
```

4. Go to: `http://localhost:5173/dashboard`

### Step 7: Check Network Tab

**If no console errors:**

1. Open DevTools (F12)
2. Click **Network** tab
3. Try creating profile again
4. Look for a request to Supabase
5. Click on the request
6. Check the **Response** tab
7. Look for error messages

### Step 8: Verify Migration Ran Successfully

**Check if all columns exist:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
```

**You should see these columns:**
- `user_id` (uuid)
- `first_name` (text)
- `middle_name` (text)
- `last_name` (text)
- `education_level` (text)
- `christian_since` (integer)
- `role` (text)

**If columns are missing:**

Run the migration again:
```sql
-- Copy and paste the entire content of:
-- church-management-system/supabase-migrations/fix-members-table-for-auth.sql
```

## Quick Checklist

Before asking for help, verify:

- [ ] Checked browser console for errors
- [ ] RLS is disabled on members table
- [ ] All required columns exist in members table
- [ ] User is logged in (check `user?.id` in console)
- [ ] Profile doesn't already exist
- [ ] Browser cache cleared
- [ ] Logged out and back in
- [ ] Network tab shows Supabase request
- [ ] Supabase connection is working

## Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Share the following information:**
   - Browser console error (screenshot or text)
   - Network tab response (screenshot)
   - Result of: `SELECT * FROM members;`
   - Result of: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'members';`
   - Result of: `SELECT id, email FROM auth.users;`

2. **Try the nuclear option:**

```sql
-- WARNING: This deletes ALL members data!
DELETE FROM members;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
```

Then try creating profile again.

## Expected Behavior After Fix

1. Login → Redirects to `/complete-profile`
2. Fill form → Click "Complete Profile"
3. Button shows "Creating Profile..." for 1-2 seconds
4. Console shows: "Profile created successfully: {data}"
5. Alert shows: "Profile created successfully!"
6. Redirects to `/dashboard`
7. Dashboard loads with sidebar and navbar

## Common Mistakes

1. **Not checking browser console** - Always check console first!
2. **Not disabling RLS** - RLS blocks inserts by default
3. **Not clearing browser cache** - Old code might be cached
4. **Not logging out/in after changes** - Session might be stale
5. **Running wrong migration** - Make sure to run fix-members-table-for-auth.sql
6. **Profile already exists** - Check database before creating

## Prevention

To avoid this issue in the future:

1. Always check browser console for errors
2. Keep RLS disabled during development
3. Test profile creation immediately after migration
4. Use proper error handling in code
5. Add better error messages to UI
6. Log all Supabase operations

## Next Steps After Profile Creation Works

Once profile creation is working:

1. **Create first admin user:**
```sql
UPDATE members SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
```

2. **Test role-based access:**
   - Login as admin → Should see all sidebar links
   - Login as member → Should see limited links

3. **Test protected routes:**
   - Try accessing `/members` as member → Should show access denied
   - Try accessing `/members` as admin → Should work

4. **Enable RLS (optional, for production):**
```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
```

But only after testing thoroughly!

## Contact

If you're still stuck after following this guide:
1. Share the browser console error
2. Share the SQL query results
3. Share screenshots of the issue
4. Describe exactly what happens when you click "Complete Profile"
