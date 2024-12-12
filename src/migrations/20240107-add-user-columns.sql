-- Add columns to users table
BEGIN;

-- Add first_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
    END IF;
END $$;

-- Add last_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
    END IF;
END $$;

-- Add role column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';
    END IF;
END $$;

-- Add is_verified column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add failed_login_attempts column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='failed_login_attempts'
    ) THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add account_locked column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='account_locked'
    ) THEN
        ALTER TABLE users ADD COLUMN account_locked BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add lock_expires_at column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='lock_expires_at'
    ) THEN
        ALTER TABLE users ADD COLUMN lock_expires_at TIMESTAMP;
    END IF;
END $$;

-- Add last_login_at column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='last_login_at'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
    END IF;
END $$;

-- Add verification_token column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='verification_token'
    ) THEN
        ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
    END IF;
END $$;

-- Add verification_token_expiry column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='verification_token_expiry'
    ) THEN
        ALTER TABLE users ADD COLUMN verification_token_expiry TIMESTAMP;
    END IF;
END $$;

-- Add password_reset_token column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='password_reset_token'
    ) THEN
        ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
    END IF;
END $$;

-- Add password_reset_expiry column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='password_reset_expiry'
    ) THEN
        ALTER TABLE users ADD COLUMN password_reset_expiry TIMESTAMP;
    END IF;
END $$;

COMMIT;
