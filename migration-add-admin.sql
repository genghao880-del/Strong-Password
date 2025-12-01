-- Migration: Add admin role support to existing database
-- Run this on your existing database to add admin functionality without losing data

-- Add is_admin and created_at columns to users table if they don't exist
ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);

-- Optional: Set the first user as admin (update email accordingly)
-- UPDATE users SET is_admin = 1 WHERE email = 'your-admin-email@example.com';

-- Verify migration
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_users, SUM(is_admin) as total_admins FROM users;
