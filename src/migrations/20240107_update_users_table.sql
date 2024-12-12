-- Update users table to use snake_case column names
BEGIN;

-- Rename columns
ALTER TABLE users
RENAME COLUMN "firstName" TO first_name;

ALTER TABLE users
RENAME COLUMN "lastName" TO last_name;

ALTER TABLE users
RENAME COLUMN "isVerified" TO is_verified;

ALTER TABLE users
RENAME COLUMN "failedLoginAttempts" TO failed_login_attempts;

ALTER TABLE users
RENAME COLUMN "accountLocked" TO account_locked;

ALTER TABLE users
RENAME COLUMN "lockExpiresAt" TO lock_expires_at;

ALTER TABLE users
RENAME COLUMN "lastLoginAt" TO last_login_at;

ALTER TABLE users
RENAME COLUMN "verificationToken" TO verification_token;

ALTER TABLE users
RENAME COLUMN "verificationTokenExpiry" TO verification_token_expiry;

ALTER TABLE users
RENAME COLUMN "passwordResetToken" TO password_reset_token;

ALTER TABLE users
RENAME COLUMN "passwordResetExpiry" TO password_reset_expiry;

-- Add any missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
    END IF;
END $$;

COMMIT;
