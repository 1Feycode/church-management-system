-- ============================================================
-- MIGRATION: Backfill group_members from members.group_id
-- Run this to ensure all existing members.group_id values
-- are reflected in the group_members junction table.
-- Safe to run multiple times (ON CONFLICT DO NOTHING).
-- ============================================================

INSERT INTO group_members (group_id, member_id)
SELECT group_id, id
FROM   members
WHERE  group_id IS NOT NULL
ON CONFLICT (group_id, member_id) DO NOTHING;

-- Verify counts match
SELECT
  'members with group_id set' AS label,
  COUNT(*) AS count
FROM members WHERE group_id IS NOT NULL
UNION ALL
SELECT
  'rows in group_members' AS label,
  COUNT(*) AS count
FROM group_members;
