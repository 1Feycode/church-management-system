-- ============================================
-- VERIFICATION SCRIPT
-- Run this after 00-COMPLETE-SETUP.sql to verify everything is correct
-- ============================================

-- 1. List all tables (should show 9 tables)
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check RLS status (should all be FALSE for development)
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '❌ ENABLED (should be disabled)'
    ELSE '✅ DISABLED (correct)'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check members table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;

-- 4. Check if any members exist
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'member' THEN 1 END) as member_count
FROM members;

-- 5. Check auth users
SELECT 
  COUNT(*) as total_auth_users
FROM auth.users;

-- 6. Check foreign key relationships
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- 1. Should show 9 tables: announcements, attendance, bible_studies, 
--    comments, events, groups, members, notifications, prayer_requests
-- 2. All tables should have RLS DISABLED (✅)
-- 3. Members table should have: user_id, first_name, middle_name, 
--    last_name, role, education_level, christian_since, etc.
-- 4. Members count will be 0 until you create your first profile
-- 5. Auth users count will be 0 until you sign up
-- 6. Should show all foreign key relationships
-- ============================================
