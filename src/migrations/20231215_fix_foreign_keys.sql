-- Migration script to fix foreign key constraints

-- Drop existing foreign key constraints if they exist
DO $$
BEGIN
    -- Drop constraints for settings table
    IF EXISTS (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'settings' AND constraint_type = 'f'
    ) THEN
        ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;
    END IF;

    -- Drop constraints for other tables similarly
    ALTER TABLE session DROP CONSTRAINT IF EXISTS session_user_id_fkey;
    ALTER TABLE profile DROP CONSTRAINT IF EXISTS profile_user_id_fkey;
    ALTER TABLE widget DROP CONSTRAINT IF EXISTS widget_user_id_fkey;
    ALTER TABLE crypto_watchlist DROP CONSTRAINT IF EXISTS crypto_watchlist_user_id_fkey;
    ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_user_id_fkey;
    ALTER TABLE api_usage DROP CONSTRAINT IF EXISTS api_usage_user_id_fkey;
    ALTER TABLE notification DROP CONSTRAINT IF EXISTS notification_user_id_fkey;
    ALTER TABLE report DROP CONSTRAINT IF EXISTS report_user_id_fkey;
END $$;

-- Recreate foreign key constraints with correct references
ALTER TABLE settings 
ADD CONSTRAINT settings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE session 
ADD CONSTRAINT session_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE profile 
ADD CONSTRAINT profile_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE widget 
ADD CONSTRAINT widget_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE crypto_watchlist 
ADD CONSTRAINT crypto_watchlist_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE activity_log 
ADD CONSTRAINT activity_log_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE api_usage 
ADD CONSTRAINT api_usage_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE notification 
ADD CONSTRAINT notification_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;

ALTER TABLE report 
ADD CONSTRAINT report_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES "user"(id) 
ON DELETE CASCADE;
