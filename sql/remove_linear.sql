-- Remove Linear columns from integrations table
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_api_key') THEN
        ALTER TABLE integrations DROP COLUMN linear_api_key;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_access_token') THEN
        ALTER TABLE integrations DROP COLUMN linear_access_token;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_token') THEN
        ALTER TABLE integrations DROP COLUMN linear_token;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_team_name') THEN
        ALTER TABLE integrations DROP COLUMN linear_team_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_team_id') THEN
        ALTER TABLE integrations DROP COLUMN linear_team_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_user_id') THEN
        ALTER TABLE integrations DROP COLUMN linear_user_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_user_name') THEN
        ALTER TABLE integrations DROP COLUMN linear_user_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_initial_state_id') THEN
        ALTER TABLE integrations DROP COLUMN linear_initial_state_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_pr_state_id') THEN
        ALTER TABLE integrations DROP COLUMN linear_pr_state_id;
    END IF;
END $$;
