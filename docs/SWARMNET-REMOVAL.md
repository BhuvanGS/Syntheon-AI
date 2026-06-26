# SwarmNet Feature Removal

## Date: June 26, 2026

## Summary
Removed all SwarmNet-related code and database tables from the codebase.

---

## Files Deleted

### API Routes
- `app/api/swarmnet/agents/[id]/run/route.ts`
- `app/api/swarmnet/runs/[id]/route.ts`
- `app/api/swarmnet/repos/route.ts`
- `app/api/swarmnet/simulate/route.ts`
- **Entire directory:** `app/api/swarmnet/`

### Components
- `components/swarmnet-build-panel.tsx`

---

## Files Modified

### Database Schema (`db/schema.ts`)
**Removed Tables:**
- `swarmnetAgents` - Agent definitions with domain expertise
- `swarmnetRuns` - Run execution tracking
- `swarmnetArtifacts` - Generated code artifacts

### Database Layer (`lib/db.ts`)
**Removed Imports:**
- `swarmnetAgents as agentsTable`
- `swarmnetRuns as runsTable`
- `swarmnetArtifacts as artifactsTable`

**Removed Functions:**
- `createSwarmnetRun()` - Create agent run
- `getSwarmnetRun()` - Fetch run details
- `updateSwarmnetRun()` - Update run status
- `createSwarmnetArtifact()` - Store generated code

**Removed Types:**
- `SwarmnetRun` interface

---

## Database Migration

**File:** `migrations/drop-swarmnet-tables.sql`

To apply the migration and drop the tables from your database:

```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS swarmnet_artifacts CASCADE;
DROP TABLE IF EXISTS swarmnet_runs CASCADE;
DROP TABLE IF EXISTS swarmnet_agents CASCADE;
```

Or use psql:
```bash
psql $DATABASE_URL -f migrations/drop-swarmnet-tables.sql
```

---

## Impact Analysis

### ✅ No Breaking Changes
- SwarmNet was an experimental feature not yet integrated into the main UI
- No user-facing features depend on these tables
- Tickets and projects continue working normally

### 🧹 Cleanup Benefits
- **Simpler schema** - 3 fewer tables to maintain
- **Reduced complexity** - Removed unused API routes
- **Smaller bundle** - Removed unused components
- **Clearer focus** - Core ticket/project features only

---

## Next Steps

1. **Apply database migration** (run SQL script in Supabase)
2. **Verify app builds** (`pnpm build`)
3. **Test core features** (tickets, projects, meetings)

---

## Rollback (if needed)

If you need to restore SwarmNet:

1. Revert commit: `git revert <commit-hash>`
2. Re-run migrations to restore tables
3. Restart dev server

---

## Related Commits
- Removed SwarmNet tables from schema
- Removed SwarmNet functions from lib/db.ts
- Deleted SwarmNet API routes
- Deleted SwarmNet build panel component
