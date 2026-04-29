-- ============================================
-- CHURCH MANAGEMENT SYSTEM - COMPLETE DATABASE SETUP
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click RUN
-- ============================================

-- ============================================
-- 1. MEMBERS TABLE
-- ============================================
CREATE TABLE members (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT, -- For backward compatibility
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender TEXT,
  age INT,
  address TEXT,
  baptism_status BOOLEAN DEFAULT FALSE,
  education_level TEXT,
  christian_since INT, -- Year as integer
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  group_id BIGINT, -- Will link to groups table
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE members DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. GROUPS TABLE
-- ============================================
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_leader FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL
);

ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. ADD GROUP FOREIGN KEY TO MEMBERS
-- ============================================
ALTER TABLE members 
ADD CONSTRAINT fk_group 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

-- ============================================
-- 4. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. EVENTS TABLE
-- ============================================
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  event_date TIMESTAMP,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT,
  member_id BIGINT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'present', -- present / absent
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_att_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. PRAYER REQUESTS TABLE
-- ============================================
CREATE TABLE prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new / prayed
  visibility TEXT DEFAULT 'public', -- public / private
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_pr_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

ALTER TABLE prayer_requests DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. BIBLE STUDIES TABLE
-- ============================================
CREATE TABLE bible_studies (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  verses TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE bible_studies DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  bible_study_id BIGINT,
  member_id BIGINT,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_comment_study FOREIGN KEY (bible_study_id) REFERENCES bible_studies(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  message TEXT NOT NULL,
  bible_study_id BIGINT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_notify_user FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_notify_study FOREIGN KEY (bible_study_id) REFERENCES bible_studies(id) ON DELETE CASCADE
);

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 11. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_group ON members(group_id);

CREATE INDEX idx_groups_leader ON groups(leader_id);

CREATE INDEX idx_attendance_group ON attendance(group_id);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(date);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);

CREATE INDEX idx_prayer_requests_member ON prayer_requests(member_id);
CREATE INDEX idx_prayer_requests_status ON prayer_requests(status);

CREATE INDEX idx_bible_studies_created ON bible_studies(created_at DESC);

CREATE INDEX idx_comments_study ON comments(bible_study_id);
CREATE INDEX idx_comments_member ON comments(member_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- 12. VERIFY SETUP
-- ============================================
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check RLS is disabled (should all show FALSE)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
-- Next steps:
-- 1. Restart your React app: npm run dev
-- 2. Go to: http://localhost:5173/login
-- 3. Sign up and create your profile
-- 4. Run this to make yourself admin:
--    UPDATE members SET role = 'admin' WHERE email = 'your@email.com';
-- 5. Refresh the app and enjoy! 🎉
-- ============================================
