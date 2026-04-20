-- ─── Org Migration ───────────────────────────────────────────────
-- Run this in Supabase SQL editor

-- 1. Add org_id to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS org_id text;

CREATE INDEX IF NOT EXISTS projects_org_id_idx ON projects (org_id);

-- 2. Add org_id to meetings
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS org_id text;

CREATE INDEX IF NOT EXISTS meetings_org_id_idx ON meetings (org_id);

-- 3. Add org_id to tickets
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS org_id text;

CREATE INDEX IF NOT EXISTS tickets_org_id_idx ON tickets (org_id);

-- 4. Project members table (explicit project membership)
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  org_id text NOT NULL,
  user_id text NOT NULL,
  role text NOT NULL DEFAULT 'member', -- 'admin' | 'member'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members (project_id);
CREATE INDEX IF NOT EXISTS project_members_org_id_idx ON project_members (org_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members (user_id);
