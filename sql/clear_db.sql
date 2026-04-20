-- ⚠️ FULL DB CLEAR — wipes all data, keeps table structure
-- Run in Supabase SQL Editor

TRUNCATE TABLE ticket_activities CASCADE;
TRUNCATE TABLE ticket_dependencies CASCADE;
TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE specs CASCADE;
TRUNCATE TABLE project_members CASCADE;
TRUNCATE TABLE meetings CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE api_keys CASCADE;
