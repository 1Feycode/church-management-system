-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Church Management System
--
-- Run this in Supabase SQL Editor AFTER your tables are created.
--
-- Architecture notes:
--   auth.uid()        → UUID of the currently authenticated user
--   members.user_id   → UUID column linking a member row to auth.users
--   members.id        → BIGINT primary key used by all other tables
--
-- Admin check pattern (reused across all tables):
--   EXISTS (
--     SELECT 1 FROM members
--     WHERE user_id = auth.uid()
--       AND role = 'admin'
--   )
-- ============================================================


-- ============================================================
-- HELPER: is_admin()
-- A stable security-definer function so the subquery is
-- evaluated once per statement, not once per row.
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM members
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ============================================================
-- HELPER: my_member_id()
-- Returns the members.id (BIGINT) for the current auth user.
-- Used for tables that reference members.id, not auth.uid().
-- ============================================================
CREATE OR REPLACE FUNCTION my_member_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;


-- ============================================================
-- 1. MEMBERS TABLE
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- SELECT: every authenticated user can read all member rows
-- (needed so the app can display group members, leaders, etc.)
CREATE POLICY "members_select_authenticated"
  ON members FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: a user can only create their own profile row
-- (user_id must match the caller's auth UID)
CREATE POLICY "members_insert_own"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: a user can update their own row; admins can update any row
CREATE POLICY "members_update_own_or_admin"
  ON members FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR is_admin()
  );

-- DELETE: only admins can delete member rows
CREATE POLICY "members_delete_admin_only"
  ON members FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- 2. GROUPS TABLE
-- ============================================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users can view groups
CREATE POLICY "groups_select_authenticated"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: admin only
CREATE POLICY "groups_insert_admin_only"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: admin only
CREATE POLICY "groups_update_admin_only"
  ON groups FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE: admin only
CREATE POLICY "groups_delete_admin_only"
  ON groups FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- 3. EVENTS TABLE
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users
CREATE POLICY "events_select_authenticated"
  ON events FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: admin only
CREATE POLICY "events_insert_admin_only"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: admin only
CREATE POLICY "events_update_admin_only"
  ON events FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE: admin only
CREATE POLICY "events_delete_admin_only"
  ON events FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- 4. ANNOUNCEMENTS TABLE
-- ============================================================
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users
CREATE POLICY "announcements_select_authenticated"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: admin only
CREATE POLICY "announcements_insert_admin_only"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: admin only
CREATE POLICY "announcements_update_admin_only"
  ON announcements FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE: admin only
CREATE POLICY "announcements_delete_admin_only"
  ON announcements FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- 5. BIBLE STUDIES TABLE
-- ============================================================
ALTER TABLE bible_studies ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users
CREATE POLICY "bible_studies_select_authenticated"
  ON bible_studies FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: admin only
CREATE POLICY "bible_studies_insert_admin_only"
  ON bible_studies FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- UPDATE: admin only
CREATE POLICY "bible_studies_update_admin_only"
  ON bible_studies FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE: admin only
CREATE POLICY "bible_studies_delete_admin_only"
  ON bible_studies FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- 6. COMMENTS TABLE
-- comments.member_id is a BIGINT (references members.id),
-- so we use my_member_id() to compare.
-- ============================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users can read comments
CREATE POLICY "comments_select_authenticated"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: any authenticated user can post a comment,
-- but the member_id must match their own members.id
CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (member_id = my_member_id());

-- DELETE: admin can delete any comment;
-- a member can delete only their own comment
CREATE POLICY "comments_delete_own_or_admin"
  ON comments FOR DELETE
  TO authenticated
  USING (
    member_id = my_member_id()
    OR is_admin()
  );


-- ============================================================
-- 7. PRAYER REQUESTS TABLE
-- prayer_requests.member_id is a BIGINT (references members.id)
-- ============================================================
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- SELECT: users see their own requests OR any public request;
-- admins see everything
CREATE POLICY "prayer_requests_select"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR member_id = my_member_id()
    OR visibility = 'public'
  );

-- INSERT: authenticated users can submit a request,
-- but member_id must be their own
CREATE POLICY "prayer_requests_insert_own"
  ON prayer_requests FOR INSERT
  TO authenticated
  WITH CHECK (member_id = my_member_id());

-- UPDATE: users can update their own requests; admins can update any
CREATE POLICY "prayer_requests_update_own_or_admin"
  ON prayer_requests FOR UPDATE
  TO authenticated
  USING (
    member_id = my_member_id()
    OR is_admin()
  )
  WITH CHECK (
    member_id = my_member_id()
    OR is_admin()
  );

-- DELETE: users can delete their own; admins can delete any
CREATE POLICY "prayer_requests_delete_own_or_admin"
  ON prayer_requests FOR DELETE
  TO authenticated
  USING (
    member_id = my_member_id()
    OR is_admin()
  );


-- ============================================================
-- 8. NOTIFICATIONS TABLE
-- notifications.user_id is a BIGINT (references members.id)
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only see their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = my_member_id());

-- INSERT: the app (or admin) inserts notifications;
-- allow authenticated inserts so the frontend can create them
-- (tighten to service_role only if you move this server-side)
CREATE POLICY "notifications_insert_authenticated"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: users can mark their own notifications as read
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = my_member_id())
  WITH CHECK (user_id = my_member_id());

-- DELETE: users can delete their own; admins can delete any
CREATE POLICY "notifications_delete_own_or_admin"
  ON notifications FOR DELETE
  TO authenticated
  USING (
    user_id = my_member_id()
    OR is_admin()
  );


-- ============================================================
-- 9. ATTENDANCE TABLE
-- ============================================================
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users (members need to see their own attendance)
CREATE POLICY "attendance_select_authenticated"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

-- INSERT / UPDATE / DELETE: admin only
CREATE POLICY "attendance_insert_admin_only"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "attendance_update_admin_only"
  ON attendance FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "attendance_delete_admin_only"
  ON attendance FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- 10. VERIFY — check RLS is now enabled on all tables
-- ============================================================
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================
-- 11. VERIFY — list all policies created
-- ============================================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd        AS operation,
  roles,
  qual       AS using_expr,
  with_check AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================
-- DONE ✅
--
-- How it works:
--
-- is_admin()      → checks members.role = 'admin' for auth.uid()
-- my_member_id()  → returns members.id for auth.uid()
--
-- Both are SECURITY DEFINER functions, meaning they run with
-- elevated privileges so they can always read the members table
-- regardless of the caller's own RLS context.
--
-- Unauthenticated requests (anon key without a session) are
-- blocked on every table because all policies are TO authenticated.
--
-- To test:
--   1. Sign in as a member → try to POST to /rest/v1/events → 403
--   2. Sign in as an admin → same request → 200
--   3. Member fetching prayer_requests → only sees own + public rows
-- ============================================================
