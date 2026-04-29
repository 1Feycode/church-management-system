# Fresh Start Setup Guide

## ✅ Step 1: Update Environment Variables (DONE)

Your `.env` file has been updated with the new Supabase credentials:
- URL: `https://dwxzjjszerlvaaruxapk.supabase.co`
- Anon Key: `eyJhbGci...` (already set)

## 📋 Step 2: Run the Complete SQL Setup

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your new project: `dwxzjjszerlvaaruxapk`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the **ENTIRE** content from:
   ```
   church-management-system/supabase-migrations/00-COMPLETE-SETUP.sql
   ```
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

This will create all 9 tables:
- ✅ members (with auth support)
- ✅ groups
- ✅ announcements
- ✅ attendance
- ✅ events
- ✅ prayer_requests
- ✅ bible_studies
- ✅ comments
- ✅ notifications

## 🔐 Step 3: Enable Google OAuth

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to enable it
3. Add your Google OAuth credentials:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
4. Set **Redirect URL**: `http://localhost:5173/auth/callback`
5. Click **Save**

**Don't have Google OAuth credentials?**
- Go to: https://console.cloud.google.com/
- Create a new project or select existing
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `https://dwxzjjszerlvaaruxapk.supabase.co/auth/v1/callback`

## 🚀 Step 4: Restart Your React App

1. Stop the current dev server (Ctrl+C)
2. Restart it:
   ```bash
   cd church-management-system
   npm run dev
   ```
3. Open: http://localhost:5173

## 👤 Step 5: Create Your First Account

1. Go to: http://localhost:5173/login
2. Click **"Continue with Google"** OR use **Email/Password**
3. Complete the authentication
4. Fill out the **Complete Profile** form:
   - First Name
   - Last Name
   - Other optional fields
5. Click **"Complete Profile"**
6. You should be redirected to the dashboard!

## 👑 Step 6: Make Yourself Admin

After creating your profile:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your email):

```sql
UPDATE members 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

3. Refresh your app
4. You should now see all admin features in the sidebar!

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] All 9 tables created in Supabase
- [ ] RLS is disabled on all tables (for development)
- [ ] Google OAuth is enabled (or Email auth works)
- [ ] React app is running on http://localhost:5173
- [ ] Can access login page
- [ ] Can sign up / sign in
- [ ] Profile creation works
- [ ] Redirects to dashboard after profile creation
- [ ] Dashboard loads with sidebar and navbar
- [ ] Can see admin links in sidebar (after setting role to admin)

## 🐛 Troubleshooting

### Issue: "Failed to create profile"
**Solution:** 
1. Check browser console (F12) for errors
2. Verify RLS is disabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'members';
   ```
   Should show `rowsecurity = false`

### Issue: "Google OAuth not working"
**Solution:**
1. Check Google OAuth credentials in Supabase
2. Verify redirect URL is correct
3. Make sure Google+ API is enabled in Google Cloud Console

### Issue: "Profile already exists"
**Solution:**
```sql
-- Check existing profiles
SELECT * FROM members;

-- Delete if needed
DELETE FROM members WHERE email = 'your@email.com';
```

### Issue: "Can't see admin features"
**Solution:**
```sql
-- Verify your role
SELECT id, email, role FROM members WHERE email = 'your@email.com';

-- Set to admin if needed
UPDATE members SET role = 'admin' WHERE email = 'your@email.com';
```

## 📊 Useful SQL Queries

**Check all members:**
```sql
SELECT id, user_id, first_name, last_name, email, role FROM members;
```

**Check auth users:**
```sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
```

**Check table structure:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
```

**Reset everything (DANGER - deletes all data):**
```sql
-- Delete all data from all tables
TRUNCATE members, groups, announcements, attendance, events, 
         prayer_requests, bible_studies, comments, notifications 
CASCADE;
```

## 🎉 Success!

Once you complete all steps:
1. You'll have a fully functional church management system
2. You can login with Google or Email
3. You'll have admin access to all features
4. All tables are set up and ready to use

## 📝 Next Steps

After successful setup:
1. Test all features (Members, Groups, Events, etc.)
2. Create more admin users if needed
3. Invite members to sign up
4. Start using the system!

## 🆘 Need Help?

If you encounter any issues:
1. Check browser console (F12) for errors
2. Check Supabase logs in Dashboard → Logs
3. Verify all SQL queries ran successfully
4. Make sure .env file has correct credentials
5. Restart the React app after any changes

---

**Remember:** This setup has RLS disabled for easier development. For production, you should enable RLS and set up proper policies!
