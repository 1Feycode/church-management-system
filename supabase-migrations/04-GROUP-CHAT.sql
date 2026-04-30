-- ============================================================
-- MIGRATION: Group Chat
-- Real-time messaging for group members and leaders.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Create the messages table
CREATE TABLE IF NOT EXISTS group_messages (
  id         BIGSERIAL PRIMARY KEY,
  group_id   BIGINT NOT NULL REFERENCES groups(id)  ON DELETE CASCADE,
  member_id  BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  message    TEXT NOT NULL CHECK (char_length(trim(message)) > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group   ON group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_member  ON group_messages(member_id);

-- 2. Enable Realtime on this table
ALTER TABLE group_messages REPLICA IDENTITY FULL;

-- 3. Enable RLS
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a member of a given group?
CREATE OR REPLACE FUNCTION is_group_member(p_group_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM group_members gm
    JOIN members m ON m.id = gm.member_id
    WHERE gm.group_id = p_group_id
      AND m.user_id = auth.uid()
  );
$$;

-- SELECT: only group members (and admins) can read messages
CREATE POLICY "group_messages_select"
  ON group_messages FOR SELECT
  TO authenticated
  USING (
    is_group_member(group_id)
    OR EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- INSERT: only group members can send, and member_id must be their own
CREATE POLICY "group_messages_insert"
  ON group_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_member(group_id)
    AND member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
  );

-- DELETE: own messages, or admin can delete any
CREATE POLICY "group_messages_delete"
  ON group_messages FOR DELETE
  TO authenticated
  USING (
    member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)
    OR EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Verify
SELECT 'group_messages table created ✅';
