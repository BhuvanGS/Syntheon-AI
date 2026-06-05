-- SwarmNet tables — additive, no existing tables modified
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS swarmnet_agents (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  name text NOT NULL,
  domain text NOT NULL,
  persona text NOT NULL,
  model text NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  trust_level text NOT NULL DEFAULT 'medium',
  keywords text[] NOT NULL DEFAULT '{}',
  file_patterns text[] NOT NULL DEFAULT '{}',
  capabilities text[] NOT NULL DEFAULT '{}',
  max_active_tickets int NOT NULL DEFAULT 1,
  is_custom boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swarmnet_agents_org_domain ON swarmnet_agents(org_id, domain);

CREATE TABLE IF NOT EXISTS swarmnet_runs (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  project_id text,
  ticket_id text NOT NULL,
  agent_id text NOT NULL,
  status text NOT NULL DEFAULT 'claimed',
  branch_name text,
  base_commit_sha text,
  head_commit_sha text,
  pr_number int,
  pr_url text,
  model_used text,
  prompt_tokens int DEFAULT 0,
  completion_tokens int DEFAULT 0,
  cost_usd decimal(10,6) DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_seconds int,
  files_modified text[] DEFAULT '{}',
  files_created text[] DEFAULT '{}',
  test_results jsonb,
  security_scan jsonb,
  error_message text,
  current_task text,
  steps jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swarmnet_runs_org_status ON swarmnet_runs(org_id, status);
CREATE INDEX IF NOT EXISTS swarmnet_runs_ticket ON swarmnet_runs(ticket_id);
CREATE INDEX IF NOT EXISTS swarmnet_runs_agent ON swarmnet_runs(agent_id);

-- Add current_task column for existing deployments (safe, no-op if already exists)
ALTER TABLE swarmnet_runs ADD COLUMN IF NOT EXISTS current_task text;

CREATE TABLE IF NOT EXISTS swarmnet_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id text NOT NULL REFERENCES swarmnet_runs(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  content text NOT NULL,
  is_new boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swarmnet_artifacts_run ON swarmnet_artifacts(run_id);

-- Seed default agents for existing orgs
INSERT INTO swarmnet_agents (id, org_id, name, domain, persona, model, trust_level, keywords, file_patterns, capabilities)
SELECT
  'agent:planner', org_id, 'Planner Agent', 'planner',
  'You decompose features into atomic tickets. Never write code.',
  'llama-3.3-70b-versatile', 'medium',
  ARRAY['plan','decompose','scope'], ARRAY[]::text[], ARRAY['create_ticket','set_dependencies']
FROM projects GROUP BY org_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO swarmnet_agents (id, org_id, name, domain, persona, model, trust_level, keywords, file_patterns, capabilities)
SELECT
  'agent:frontend', org_id, 'Frontend Agent', 'frontend',
  'Senior React/TS/Tailwind engineer. Read existing patterns first.',
  'llama-3.3-70b-versatile', 'medium',
  ARRAY['component','page','ui','layout','style'],
  ARRAY['*.tsx','*.css'],
  ARRAY['read_repo','commit','generate_code']
FROM projects GROUP BY org_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO swarmnet_agents (id, org_id, name, domain, persona, model, trust_level, keywords, file_patterns, capabilities)
SELECT
  'agent:backend', org_id, 'Backend Agent', 'backend',
  'Senior Next.js API engineer. Drizzle ORM. Zod validation.',
  'llama-3.3-70b-versatile', 'low',
  ARRAY['api','endpoint','route','server','auth'],
  ARRAY['app/api/**/*.ts','lib/db.ts'],
  ARRAY['read_repo','commit','generate_code']
FROM projects GROUP BY org_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO swarmnet_agents (id, org_id, name, domain, persona, model, trust_level, keywords, file_patterns, capabilities)
SELECT
  'agent:database', org_id, 'Database Agent', 'database',
  'PostgreSQL architect. Drizzle schema. Migration safety.',
  'llama-3.3-70b-versatile', 'low',
  ARRAY['table','schema','migration','column','index'],
  ARRAY['db/schema.ts','sql/*.sql'],
  ARRAY['read_repo','commit','generate_code']
FROM projects GROUP BY org_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO swarmnet_agents (id, org_id, name, domain, persona, model, trust_level, keywords, file_patterns, capabilities)
SELECT
  'agent:security', org_id, 'Security Agent', 'security',
  'Security auditor. OWASP Top 10. Report only, never fix.',
  'llama-3.3-70b-versatile', 'high',
  ARRAY['security','vulnerability','auth','xss','injection'],
  ARRAY['*'],
  ARRAY['read_repo','scan','block_merge']
FROM projects GROUP BY org_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO swarmnet_agents (id, org_id, name, domain, persona, model, trust_level, keywords, file_patterns, capabilities)
SELECT
  'agent:test', org_id, 'Test Agent', 'test',
  'QA engineer. Vitest + Playwright. Never modify source.',
  'llama-3.3-70b-versatile', 'high',
  ARRAY['test','spec','coverage','vitest','playwright'],
  ARRAY['*.test.ts','*.spec.ts'],
  ARRAY['read_repo','write_test','run_test']
FROM projects GROUP BY org_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO swarmnet_agents (id, org_id, name, domain, persona, model, trust_level, keywords, file_patterns, capabilities)
SELECT
  'agent:production', org_id, 'Production Agent', 'production',
  'DevOps. Vercel/Render deploys. Preview links. Rollback.',
  'llama-3.3-70b-versatile', 'high',
  ARRAY['deploy','preview','vercel','production','rollback'],
  ARRAY[]::text[],
  ARRAY['deploy','create_preview','rollback']
FROM projects GROUP BY org_id
ON CONFLICT (id) DO NOTHING;
