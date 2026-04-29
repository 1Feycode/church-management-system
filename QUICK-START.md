# 🚀 Quick Start Guide

## 📋 What You Need to Do (In Order)

### 1️⃣ Run SQL Setup (5 minutes)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Copy **ALL** content from: `supabase-migrations/00-COMPLETE-SETUP.sql`
4. Paste and click **Run**
5. Wait for "Success" message

### 2️⃣ Enable Google OAuth (2 minutes)

1. In Supabase: **Authentication** → **Providers** → **Google**
2. Enable it and add credentials (or skip and use Email auth)
3. Set redirect URL: `http://localhost:5173/auth/callback`

### 3️⃣ Restart Your App (1 minute)

```bash
cd church-management-system
npm run dev
```

### 4️⃣ Create Your Account (2 minutes)

1. Go to: http://localhost:5173/login
2. Sign up with Google or Email
3. Fill out profile form
4. Click "Complete Profile"
5. Should redirect to dashboard ✅

### 5️⃣ Make Yourself Admin (1 minute)

1. Go to **Supabase** → **SQL Editor**
2. Run:
```sql
UPDATE members SET role = 'admin' WHERE email = 'your@email.com';
```
3. Refresh your app
4. You're now admin! 👑

---

## ✅ Success Checklist

- [ ] SQL setup completed (9 tables created)
- [ ] App is running on http://localhost:5173
- [ ] Can login/signup
- [ ] Profile creation works
- [ ] Dashboard loads
- [ ] Made yourself admin
- [ ] Can see all admin features

---

## 🐛 If Something Goes Wrong

**Profile creation stuck?**
- Check browser console (F12) for errors
- Make sure SQL setup ran successfully
- Verify RLS is disabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'members';`

**Can't login?**
- Check Supabase credentials in `.env` file
- Make sure app is restarted after changing `.env`
- Try email/password if Google OAuth isn't working

**Not seeing admin features?**
- Run: `SELECT email, role FROM members;` to check your role
- Make sure you ran the UPDATE query to set role = 'admin'
- Refresh the app after changing role

---

## 📁 Files Created for You

1. **00-COMPLETE-SETUP.sql** - Complete database setup (RUN THIS FIRST)
2. **01-VERIFY-SETUP.sql** - Verify everything is correct (optional)
3. **02-CREATE-ADMIN.sql** - Make yourself admin (RUN AFTER SIGNUP)
4. **FRESH-START-GUIDE.md** - Detailed setup guide
5. **QUICK-START.md** - This file (quick reference)

---

## 🎉 You're Done!

Once you complete all 5 steps, you'll have:
- ✅ Fully functional church management system
- ✅ Authentication with Google/Email
- ✅ Admin access to all features
- ✅ All 9 tables set up and ready

**Now you can:**
- Add members
- Create groups
- Post announcements
- Schedule events
- Manage prayer requests
- Publish bible studies
- And more!

---

## 📞 Need Help?

1. Check **FRESH-START-GUIDE.md** for detailed instructions
2. Check browser console (F12) for errors
3. Check Supabase logs in Dashboard
4. Verify SQL queries ran successfully

**Common Issues:**
- Profile stuck loading → Disable RLS in Supabase
- Can't login → Check .env credentials
- Not admin → Run UPDATE query to set role
- Tables missing → Re-run 00-COMPLETE-SETUP.sql
