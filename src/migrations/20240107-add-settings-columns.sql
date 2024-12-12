-- Add columns to settings table
BEGIN;

-- Add user_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='user_id'
    ) THEN
        ALTER TABLE settings ADD COLUMN user_id INTEGER NOT NULL;
    END IF;
END $$;

-- Add theme column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='theme'
    ) THEN
        ALTER TABLE settings ADD COLUMN theme VARCHAR(50) DEFAULT 'light';
    END IF;
END $$;

-- Add dashboard_layout column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='dashboard_layout'
    ) THEN
        ALTER TABLE settings ADD COLUMN dashboard_layout JSONB;
    END IF;
END $$;

-- Add notifications column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='notifications'
    ) THEN
        ALTER TABLE settings ADD COLUMN notifications JSONB DEFAULT '{"enabled": true, "refreshInterval": 300}';
    END IF;
END $$;

-- Add email_notifications column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='email_notifications'
    ) THEN
        ALTER TABLE settings ADD COLUMN email_notifications BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add push_notifications column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='push_notifications'
    ) THEN
        ALTER TABLE settings ADD COLUMN push_notifications BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add subscription_alerts column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='subscription_alerts'
    ) THEN
        ALTER TABLE settings ADD COLUMN subscription_alerts BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add security_alerts column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='security_alerts'
    ) THEN
        ALTER TABLE settings ADD COLUMN security_alerts BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add language column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='language'
    ) THEN
        ALTER TABLE settings ADD COLUMN language VARCHAR(10) DEFAULT 'en';
    END IF;
END $$;

-- Add timezone column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='settings' AND column_name='timezone'
    ) THEN
        ALTER TABLE settings ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
    END IF;
END $$;

COMMIT;
