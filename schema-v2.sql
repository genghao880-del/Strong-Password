-- Drop existing tables if they exist (for fresh migration)
DROP TABLE IF EXISTS passwords;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create passwords table with user_id foreign key
CREATE TABLE passwords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  website TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user lookups
CREATE INDEX idx_passwords_user_id ON passwords(user_id);
