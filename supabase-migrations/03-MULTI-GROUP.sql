-- ============================================================
-- MIGRATION: Many-to-Many Group Membership
-- A member can join multiple groups.
-- A leader can lead multiple groups.
--
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Create the junction table
CREATE TABLE IF NOT EXISTS group_members (
  id          BIGSERIAL PRIMARY KEY,
  group_id    BIGINT NOT NULL REFERENCES groups(id)   ON DELETE CASCADE,
  member_id   BIGINT NOT NULL REFERENCES members(id)  ON DELETE CASCADE,
  joined_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (group_id, member_id)          -- prevent duplicate membership
);

CREATE INDEX IF NOT EXISTS idx_group_members_group  ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_member ON group_members(member_id);

-- 2. Migrate existing memberships from members.group_id → group_members
INSERT INTO group_members (group_id, member_id)
SELECT group_id, id
FROM   members
WHERE  group_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Enable RLS on the new table
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users can see group memberships
CREATE POLICY "group_members_select_authenticated"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);

-- INSERT / DELETE: admin only
CREATE POLICY "group_members_insert_admin"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "group_members_delete_admin"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Verify
SELECT 'group_members rows migrated:', COUNT(*) FROM group_members;
