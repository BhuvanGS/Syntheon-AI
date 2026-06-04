-- Fix missing columns in integrations table
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'github_access_token') THEN
        ALTER TABLE integrations ADD COLUMN github_access_token text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_user_id') THEN
        ALTER TABLE integrations ADD COLUMN linear_user_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_user_name') THEN
        ALTER TABLE integrations ADD COLUMN linear_user_name text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_initial_state_id') THEN
        ALTER TABLE integrations ADD COLUMN linear_initial_state_id text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integrations' AND column_name = 'linear_pr_state_id') THEN
        ALTER TABLE integrations ADD COLUMN linear_pr_state_id text;
    END IF;
END $$;
