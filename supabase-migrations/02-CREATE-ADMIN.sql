-- ============================================
-- CREATE FIRST ADMIN USER
-- Run this AFTER you've created your profile through the app
-- ============================================

-- Step 1: Check all auth users and their emails
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check all members
SELECT id, user_id, first_name, last_name, email, role 
FROM members;

-- Step 3: Make yourself admin
-- Replace 'your@email.com' with your actual email
UPDATE members 
SET role = 'admin' 
WHERE email = 'your@email.com';

-- Step 4: Verify you're now admin
SELECT id, user_id, first_name, last_name, email, role 
FROM members 
WHERE email = 'your@email.com';

-- ============================================
-- ALTERNATIVE: Make admin by user_id
-- ============================================
-- If you know your user_id from auth.users:
-- UPDATE members SET role = 'admin' WHERE user_id = 'YOUR_USER_ID_HERE';

-- ============================================
-- MAKE MULTIPLE ADMINS
-- ============================================
-- If you want to make multiple users admin:
-- UPDATE members 
-- SET role = 'admin' 
-- WHERE email IN ('admin1@example.com', 'admin2@example.com', 'admin3@example.com');

-- ============================================
-- VERIFICATION
-- ============================================
-- Check all admins
SELECT id, first_name, last_name, email, role 
FROM members 
WHERE role = 'admin';

-- Check all members
SELECT id, first_name, last_name, email, role 
FROM members 
WHERE role = 'member';

-- ============================================
-- EXPECTED RESULT:
-- ============================================
-- After running the UPDATE query, you should see:
-- - Your role changed from 'member' to 'admin'
-- - When you refresh the app, you'll see all admin features
-- - Sidebar will show all admin links (Members, Groups, Announcements)
-- - Navbar will show "Admin" badge next to your name
-- ============================================
