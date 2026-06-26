-- Migration: Drop SwarmNet Tables
-- Created: 2026-06-26
-- Description: Remove all SwarmNet-related tables (agents, runs, artifacts)

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS swarmnet_artifacts CASCADE;
DROP TABLE IF EXISTS swarmnet_runs CASCADE;
DROP TABLE IF EXISTS swarmnet_agents CASCADE;
