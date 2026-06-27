# Syntheon — Launch Guide, AWS Architecture & CI/CD

> For: Dax / Theo / Engineering  
> Goal: Document how to launch Syntheon on AWS, optimize costs, and wire GitHub Actions CI/CD. No code generation — this is the plan.

---

## 1. What Syntheon is today

Syntheon is a Next.js 16 + React 19 app that turns meetings into software specs and tickets.

### Core components

| Layer        | Technology                                   | Purpose                                          |
| ------------ | -------------------------------------------- | ------------------------------------------------ |
| Frontend     | Next.js App Router (server components + RSC) | Dashboard, landing pages, auth UI                |
| Auth         | Clerk                                        | Users, sessions, orgs                            |
| Database     | PostgreSQL (Supabase today, RDS target)      | Users, meetings, tickets, projects, integrations |
| ORM          | Drizzle ORM                                  | Schema + queries in `db/` and `lib/db.ts`        |
| AI           | Groq SDK                                     | Spec extraction from transcripts                 |
| Meeting bot  | Skribby SDK                                  | Bot joins meetings, sends webhooks               |
| Storage      | S3 (via SST)                                 | File uploads                                     |
| Integrations | GitHub API, Google OAuth                     | Repo access, calendar sync                       |
| Real-time    | In-memory event bus (`lib/event-bus.ts`)     | SSE updates to dashboard                         |

### API routes

| Route                                    | What it does                       |
| ---------------------------------------- | ---------------------------------- |
| `/api/meetings`                          | CRUD + status for meetings         |
| `/api/projects`                          | CRUD for projects                  |
| `/api/tickets`                           | CRUD + stale detection for tickets |
| `/api/tickets/[id]/dependencies/[depId]` | Dependency management              |
| `/api/upload`                            | File upload to S3                  |
| `/api/transcribe`                        | Deepgram transcription             |
| `/api/check-key` / `/api/generate-key`   | API key management                 |
| `/api/users`                             | User lookups                       |
| `/api/notifications`                     | Notification list                  |
| `/api/events`                            | SSE stream                         |
| `/api/search`                            | Global search                      |

### Database schema

Tables: `users`, `api_keys`, `meetings`, `specs`, `tickets`, `ticket_dependencies`, `ticket_attachments`, `ticket_comments`, `ticket_activities`, `projects`, `project_members`, `integrations`, `notifications`.

---

## 2. Launch options

### Option A: Local development (Supabase)

This is the current working state.

```bash
# 1. Install
pnpm install

# 2. Fill .env.local (keys in AWS.txt / 1Password)
cp .env.local.example .env.local

# 3. Run
pnpm dev
```

Database: `postgresql://...pooler.supabase.com:6543/postgres` (transaction pooler).  
The `db/index.ts` already detects Supabase and disables prepared statements.

### Option B: AWS production (SST)

This is the target we already scaffolded.

```bash
# 1. Ensure AWS credentials are configured
aws sts get-caller-identity

# 2. Deploy
npx sst deploy
# or with a stage
npx sst deploy --stage production
```

SST creates:

- `sst.aws.Vpc` — VPC + public/private subnets
- `sst.aws.Postgres` — RDS PostgreSQL `db.t4g.micro`, 20 GB
- `sst.aws.Bucket` — Public S3 bucket for uploads
- `sst.aws.Nextjs` — OpenNext site on CloudFront + Lambda

#### Current `sst.config.ts` (simplified)

```ts
const vpc = new sst.aws.Vpc('Vpc', { nat: 'ec2', bastion: true });
const database = new sst.aws.Postgres('Database', {
  vpc,
  database: 'syntheon',
  storage: '20 GB',
  instance: 't4g.micro',
});
const uploads = new sst.aws.Bucket('Uploads', { public: true });
const site = new sst.aws.Nextjs('Site', {
  path: '.',
  vpc,
  environment: {
    /* ... */
  },
});
```

#### Why `vpc` is passed to the Next.js site

The Lambda functions need to reach RDS inside the private subnets. Passing `vpc` puts the OpenNext server functions in the same VPC. NAT is required for outbound internet (Groq, Clerk, Skribby, GitHub APIs).

#### Migration path (already tested)

1. `npx sst deploy` — deploy empty RDS.
2. SSH through the bastion host or use `sst tunnel`.
3. `pg_dump` from Supabase, `pg_restore` to RDS.
4. Verify with a `SELECT count(*) FROM tickets;`.

---

## 3. AWS cost optimization (Lambda-first)

The first deploy we ran cost roughly **$3/month** because of the NAT/bastion EC2 instance. RDS is free-tier eligible for 12 months. After free tier, base cost is ~**$17/month**.

Below is how to keep costs low while moving to a Lambda-first architecture.

### 3.1 Keep what is free or nearly free

| Service          | Free tier                          | Notes                         |
| ---------------- | ---------------------------------- | ----------------------------- |
| Lambda           | 1M requests + 400k GB-sec/month    | More than enough for dev      |
| S3               | 5 GB standard                      | Uploads + assets fit easily   |
| CloudFront       | 10M requests + 1 TB data transfer  | Plenty for launch             |
| DynamoDB (cache) | 25 GB + read/write                 | Used by OpenNext for cache    |
| SQS              | 1M requests                        | Used by OpenNext revalidation |
| RDS              | 750 hrs db.t4g.micro for 12 months | Free now, paid later          |

### 3.2 EC2 NAT/bastion — the main avoidable cost

The current VPC uses `nat: "ec2"`, which creates a t4g.nano instance acting as NAT + bastion. This is **always on** (~$3/month).

**Alternatives, from cheap to cheaper:**

1. **Managed NAT Gateway** (`nat: "managed"`) — easier, but ~$32/month. Not recommended for bootstrapping.
2. **Keep EC2 NAT + bastion** — cheapest managed option, but still always-on.
3. **Remove NAT entirely for non-VPC Lambdas** — only works if we split API routes from the Next.js site.
4. **AWS VPC Lattice / PrivateLink** — overkill for this stage.

### 3.3 Recommended: split the architecture into Lambda + serverless

Instead of putting the entire Next.js site inside the VPC, split the app:

```
┌─────────────────────────────────────────────────────────────┐
│  CloudFront + OpenNext (Next.js frontend + SSR)             │
│  Lambda@Edge for static, Regional Lambda for dynamic pages  │
│  No VPC needed here — talks to public APIs and backend      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP
┌─────────────────────────────────────────────────────────────┐
│  API Gateway (HTTP)                                         │
│  └── Lambda functions for data operations (in VPC)          │
│      └── Reach RDS via private subnets + VPC endpoints      │
└─────────────────────────────────────────────────────────────┘
```

This lets the frontend Lambda run without VPC, while the data API Lambdas run in the VPC but only for short database calls. You can also use **Aurora Serverless v2** (scales to zero) instead of RDS to remove the always-on DB cost.

### 3.4 Aurora Serverless v2 instead of RDS

SST does not natively support Aurora Serverless, but Pulumi does. Trade-offs:

- **Pros:** scales to zero, pay per use, no always-on instance.
- **Cons:** cold start of a few seconds, slightly more complex config.
- **Best for:** dev/staging or low-traffic production.

For a Lambda-first, cost-sensitive launch, Aurora Serverless v2 is the better long-term target than RDS.

### 3.5 VPC endpoints for AWS services

If the API Lambdas stay in the VPC, add VPC endpoints for S3, SQS, DynamoDB, and Secrets Manager so traffic does not go through NAT.

```ts
new aws.ec2.VpcEndpoint('S3Endpoint', { vpcId, serviceName: 'com.amazonaws.ap-south-1.s3' });
new aws.ec2.VpcEndpoint('SQSEndpoint', {
  vpcId,
  serviceName: 'com.amazonaws.ap-south-1.sqs',
  vpcEndpointType: 'Interface',
});
new aws.ec2.VpcEndpoint('DynamoDBEndpoint', {
  vpcId,
  serviceName: 'com.amazonaws.ap-south-1.dynamodb',
});
```

This reduces NAT data-processing charges.

### 3.6 Summary of cost optimization

| Optimization                                        | Savings                 | Effort |
| --------------------------------------------------- | ----------------------- | ------ |
| Remove bastion host after migration                 | ~$3/mo                  | Low    |
| Split frontend/API, remove VPC from frontend Lambda | NAT traffic, complexity | Medium |
| Aurora Serverless v2 instead of RDS                 | ~$14/mo                 | Medium |
| VPC endpoints                                       | Data transfer           | Low    |
| CloudFront caching                                  | Lambda invocations      | Low    |

---

## 4. CI/CD with GitHub Actions

Currently there is no `.github/workflows` directory.

### 4.1 Recommended workflow files

#### `.github/workflows/pr.yml` — lint, type-check, test

```yaml
name: PR
on: pull_request
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm run test
      - run: pnpm run build
```

#### `.github/workflows/deploy-staging.yml` — deploy to AWS on push to `main`

```yaml
name: Deploy Staging
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      - run: npx sst deploy --stage staging
```

#### `.github/workflows/deploy-production.yml` — manual or tag-based

```yaml
name: Deploy Production
on:
  push:
    tags: ['v*.*.*']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      - run: npx sst deploy --stage production
```

### 4.2 Secrets required in GitHub

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DATABASE_URL` (or let SST create it)
- `CLERK_SECRET_KEY`
- `GROQ_API_KEY`
- `SKRIBBY_API_KEY`
- `DEEPGRAM_API_KEY`
- `GITHUB_TOKEN`
- `GITHUB_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `TOKEN_ENCRYPTION_KEY`

Alternatively, use `sst secret` for secrets and commit only non-secret env vars to the repo. This is the recommended path for production.

```bash
npx sst secret set CLERK_SECRET_KEY <value> --stage production
npx sst secret set GROQ_API_KEY <value> --stage production
# ... etc
```

### 4.3 CI/CD best practices

1. **Never commit `.env.local` or `AWS.txt`.** Both are already in `.gitignore`.
2. **Use stages.** `staging` for `main`, `production` for tags.
3. **Run tests before deploy.** `vitest` is already configured.
4. **Cache pnpm** in GitHub Actions.
5. **Add `sst diff` in PR checks** to show what infrastructure will change.

---

## 5. Lambda-first architecture recommendations

The user explicitly said: **“we have to use lambdas mostly.”** The current SST Next.js setup already uses Lambda for server-side rendering, but the user likely wants a more explicit API Lambda layer.

### 5.1 Keep Next.js on Lambda for SSR

- OpenNext already does this.
- Static pages hit CloudFront.
- Dynamic pages/API routes hit the regional Lambda.

### 5.2 Move long-running work to standalone Lambda functions

Synchronous Next.js API routes have a 30-second Lambda limit. Long-running tasks should be:

- **Async Lambda invocations** for transcription, spec extraction, code generation.
- **SQS queues** for fan-out.
- **Step Functions** if multi-step workflows are needed.

Example future split:

| Current API route   | Future pattern                |
| ------------------- | ----------------------------- |
| `/api/transcribe`   | Async Lambda + S3 + SQS       |
| `/api/ship/execute` | Async Lambda + Step Functions |
| `/api/bot/webhook`  | API Gateway → Lambda → SQS    |
| `/api/tickets`      | API Gateway → Lambda → RDS    |

### 5.3 Use `sst.aws.Function` for worker Lambdas

```ts
const queue = new sst.aws.Queue('TranscribeQueue');
const worker = new sst.aws.Function('TranscribeWorker', {
  handler: 'workers/transcribe.handler',
  vpc,
  link: [queue, database],
});
queue.subscribe(worker);
```

### 5.4 Why this matters for cost

- API Gateway + Lambda invocations are cheaper than always-on EC2.
- Async Lambda can use ARM/Graviton for 20% savings.
- SQS decoupling prevents retries from burning request budget.

---

## 6. Immediate next steps

If we want to go live again, here is the order:

1. **Decide on database:** RDS free tier vs Aurora Serverless v2.
2. **Decide on VPC/NAT:** keep EC2 NAT or go split-architecture.
3. **Set production secrets via `sst secret`** or GitHub Actions secrets.
4. **Add `.github/workflows/pr.yml`** and deploy workflows.
5. **Deploy a `staging` stage** first.
6. **Migrate data** from Supabase to the new DB (we already have the runbook).
7. **Update external webhook URLs** (Skribby, Clerk, GitHub OAuth) to the production domain.
8. **Add custom domain** via Route 53 + SST.
9. **Remove bastion** after migration is verified.
10. **Monitor costs** with AWS Budgets.

---

## 7. Files to keep in mind

| File                      | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `sst.config.ts`           | AWS infrastructure definition               |
| `db/index.ts`             | Postgres client with Supabase/RDS detection |
| `db/schema.ts`            | Drizzle schema                              |
| `lib/db.ts`               | Data access layer                           |
| `app/api/**/route.ts`     | API routes                                  |
| `.env.local`              | Local secrets (gitignored)                  |
| `AWS.txt`                 | Production secrets (gitignored)             |
| `.github/workflows/*.yml` | CI/CD (not yet created)                     |

---

## 8. Key decisions for Dax / Theo

1. **Do we want to keep Supabase for the MVP, or migrate fully to AWS now?**
2. **Is cost optimization the priority, or is time-to-market?**
3. **Do we want to split the API into standalone Lambda functions, or keep everything in Next.js?**
4. **Custom domain now, or CloudFront default domain for staging?**
5. **Aurora Serverless v2 (scales to zero) or RDS t4g.micro (simpler)?**

Once these are answered, the actual code changes are small and fast.

---

_Document generated for planning. No code changes were made._
