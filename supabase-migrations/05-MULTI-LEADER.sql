-- ============================================================
-- MIGRATION: Multiple Leaders per Group (max 7)
-- ============================================================

-- 1. Create group_leaders junction table
CREATE TABLE IF NOT EXISTS group_leaders (
  id         BIGSERIAL PRIMARY KEY,
  group_id   BIGINT NOT NULL REFERENCES groups(id)  ON DELETE CASCADE,
  member_id  BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (group_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_group_leaders_group  ON group_leaders(group_id);
CREATE INDEX IF NOT EXISTS idx_group_leaders_member ON group_leaders(member_id);

-- 2. Migrate existing single leader_id → group_leaders
INSERT INTO group_leaders (group_id, member_id)
SELECT id, leader_id
FROM   groups
WHERE  leader_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Enable RLS
ALTER TABLE group_leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_leaders_select_authenticated"
  ON group_leaders FOR SELECT TO authenticated USING (true);

CREATE POLICY "group_leaders_insert_admin"
  ON group_leaders FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "group_leaders_delete_admin"
  ON group_leaders FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin'));

-- 4. Verify
SELECT 'group_leaders migrated:', COUNT(*) FROM group_leaders;
