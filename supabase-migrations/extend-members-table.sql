-- Extend members table with additional fields
-- This safely adds new columns to the existing table without losing data

-- Add email field
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add gender field
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add age field
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add address field
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add baptism_status field (boolean)
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS baptism_status BOOLEAN DEFAULT false;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN members.email IS 'Member email address';
COMMENT ON COLUMN members.gender IS 'Member gender (Male/Female)';
COMMENT ON COLUMN members.age IS 'Member age in years';
COMMENT ON COLUMN members.address IS 'Member residential address';
COMMENT ON COLUMN members.baptism_status IS 'Whether member has been baptized';
