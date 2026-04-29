-- ============================================
-- COMPLETE DATABASE SETUP FOR CHURCH MANAGEMENT SYSTEM
-- Run this in Supabase SQL Editor for a fresh setup
-- ============================================

-- ============================================
-- 1. MEMBERS TABLE (with Authentication Support)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT, -- For backward compatibility
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gender TEXT,
  age INTEGER,
  address TEXT,
  baptism_status BOOLEAN DEFAULT false,
  education_level TEXT,
  christian_since INTEGER,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  group_id BIGINT, -- Will add foreign key after groups table is created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for members
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- Disable RLS for development (easier to work with)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_leader ON groups(leader_id);

ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2.1 ADD GROUP FOREIGN KEY TO MEMBERS
-- ============================================
-- Now that groups table exists, add the foreign key constraint
ALTER TABLE members 
ADD CONSTRAINT fk_member_group 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_members_group ON members(group_id);

-- ============================================
-- 3. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  content TEXT, -- Alias for message for backward compatibility
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  attendance_date DATE, -- Alias for date for backward compatibility
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, member_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_group ON attendance(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('service', 'meeting', 'conference', 'social', 'other')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. PRAYER REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'prayed')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_member ON prayer_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_visibility ON prayer_requests(visibility);

ALTER TABLE prayer_requests DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. BIBLE STUDIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bible_studies (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  verses TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bible_studies_created ON bible_studies(created_at DESC);

ALTER TABLE bible_studies DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. COMMENTS TABLE (for Bible Studies)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  bible_study_id BIGINT NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_bible_study ON comments(bible_study_id);
CREATE INDEX IF NOT EXISTS idx_comments_member ON comments(member_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at);

ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  bible_study_id BIGINT REFERENCES bible_studies(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. ADD COMMENTS TO TABLES
-- ============================================
COMMENT ON TABLE members IS 'Church members with authentication support';
COMMENT ON TABLE groups IS 'Church groups and ministries';
COMMENT ON TABLE announcements IS 'Church announcements and news';
COMMENT ON TABLE attendance IS 'Group attendance tracking';
COMMENT ON TABLE events IS 'Church events and schedule';
COMMENT ON TABLE prayer_requests IS 'Prayer requests from members';
COMMENT ON TABLE bible_studies IS 'Bible study posts and content';
COMMENT ON TABLE comments IS 'Comments on bible studies';
COMMENT ON TABLE notifications IS 'User notifications';

-- ============================================
-- 11. VERIFY SETUP
-- ============================================
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check RLS status (should all be false for development)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Enable Google OAuth in Supabase Dashboard → Authentication → Providers
-- 2. Set redirect URL: http://localhost:5173/auth/callback
-- 3. Update your .env file with new Supabase credentials
-- 4. Restart your React app
-- 5. Sign up and create your first profile
-- 6. Manually set your role to 'admin' using:
--    UPDATE members SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================
