# Troubleshooting Groups Page Not Rendering

## Common Issues and Solutions

### 1. SQL Migration Not Run
**Problem:** The `leader_id` column doesn't exist in the groups table yet.

**Solution:**
1. Go to Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste this SQL:

```sql
-- Add leader_id to groups table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS leader_id BIGINT REFERENCES members(id) ON DELETE SET NULL;
```

4. Click "Run"
5. Refresh your React app

### 2. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors:
- Look for Supabase query errors
- Look for "Error loading data" messages
- Check the logged data: "Groups data:" and "Members data:"

### 3. Verify Tables Exist
In Supabase Dashboard → Table Editor:
- Verify `groups` table exists
- Verify `members` table exists
- Verify `groups` has columns: id, name, description, leader_id, created_at
- Verify `members` has columns: id, name, phone, group_id, etc.

### 4. Check Row Level Security (RLS)
If RLS is enabled, you might not be able to fetch data.

**Solution:**
Run this SQL in Supabase SQL Editor:

```sql
-- Disable RLS for development
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
```

### 5. Verify Data Exists
Check if you have any groups and members in your database:

```sql
-- Check groups
SELECT * FROM groups;

-- Check members
SELECT * FROM members;
```

### 6. Check Network Tab
In browser DevTools → Network tab:
- Look for failed requests to Supabase
- Check if the API calls are returning 200 status
- Look at the response data

### 7. Simplify the Query
If the advanced query is failing, try a simpler version first.

The current query is:
```javascript
supabase
  .from('groups')
  .select(`
    *,
    leader:leader_id(id, name)
  `)
```

If this fails, try:
```javascript
supabase
  .from('groups')
  .select('*')
```

### 8. Check Supabase Connection
Verify your Supabase credentials in `src/lib/supabase.js`:
- Correct URL
- Correct anon key
- No typos

### 9. React Component Errors
Check if there are any React errors:
- Missing imports
- Syntax errors
- Component not exported correctly

### 10. Routing Issue
Verify the route is correct in `src/routes/AppRoutes.jsx`:
```javascript
import GroupsAdvanced from '../pages/GroupsAdvanced'
// ...
<Route path="/groups" element={<GroupsAdvanced />} />
```

## Quick Debug Steps

1. **Open browser console (F12)**
2. **Navigate to Groups page**
3. **Look for these console logs:**
   - "Groups data: [...]"
   - "Members data: [...]"
   - Any error messages

4. **If you see errors:**
   - Copy the error message
   - Check which SQL migration is missing
   - Run the appropriate SQL in Supabase

5. **If no data shows:**
   - Check if groups/members exist in database
   - Verify RLS is disabled
   - Check Supabase connection

## Expected Console Output

When the page loads successfully, you should see:
```
Groups data: [{id: 1, name: "Group Name", description: "...", leader_id: null, leader: null}, ...]
Members data: [{id: 1, name: "Member Name", group_id: 1}, ...]
```

## Still Not Working?

If none of the above works:
1. Check if the old Groups.jsx works (temporarily switch back)
2. Verify all SQL migrations were run
3. Clear browser cache and reload
4. Check Supabase dashboard for any service issues
