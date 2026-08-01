# Syntheon Hub

AI-powered project management that turns meeting conversations into tickets, then plans delivery from your project backlog.

- **Landing:** [syntheonhub.com](https://syntheonhub.com)
- **App:** [app.syntheonhub.com](https://app.syntheonhub.com)

## What Syntheon Hub Does

1. **Bot joins Google Meet, Zoom, or Microsoft Teams** via Skribby and transcribes the call
2. **Webhook fires** → Groq AI extracts structured tickets from the transcript
3. **Tickets land** on your project board (priorities, labels, estimates)
4. **AI infers dependencies** between tickets
5. **Generate sprint-stones** from the project ticket backlog (not directly from meetings)
6. **Track velocity, burndown, and cycle time** across sprints

## Features

### Meeting → Tickets

- **Skribby bot** — Joins Google Meet, Zoom, or Teams; records and transcribes
- **AI ticket extraction** — Groq parses transcripts into structured tickets
- **Auto-refresh** — Meeting view polls + SSE for real-time updates
- **Meeting summaries** — AI-generated summaries on demand
- **Google Calendar** — Create meetings with Google Meet links directly

### Ticket System

- **Kanban + List views** with drag-and-drop
- **Priorities** — Urgent, High, Medium, Low, None
- **Types** — Bug, Task, Feature, Spike
- **Estimates** — T-shirt sizing: Quick, Standard, Deep, Epic
- **Labels** — Org-scoped, custom colors, CRUD
- **Bulk operations** — Multi-select status/priority/assignee (Cmd+B)
- **Command palette** — Global search + `/filter`, `/create` (Cmd+K)
- **Time tracking**, due dates, comments, activity log
- **Attachments** via S3 presigned uploads

### Dependencies

- **Hard & soft dependencies** with automatic escalation (soft → hard after 3 ignores)
- **Status gating** — Hard blockers block transitions; soft blockers warn
- **Cascading regressions** — Reopening a parent can reopen done dependents
- **Dependency graph** — SVG visualization with zoom/pan
- **AI dependency inference** — Suggested on ticket import

### Sprint-stones & Analytics

- **Sprint-stones** — Manual or AI-generated from the project ticket backlog
- **Sprint pulse** — AI-powered health analysis
- **Milestones** — Group sprints with progress tracking
- **Burndown, velocity, cycle time** charts

### Projects

- **Project workspace** — Tickets, meetings, sprint-stones, milestones, dependencies, members
- **Member roles** — Lead, Member, Viewer with RBAC
- **Project health** — AI-generated health suggestions

### Authentication & Organizations

- **Clerk** — Email/password, Google OAuth, GitHub OAuth
- **Organizations** — Multi-tenant workspaces with org roles
- **Join links** — Shareable `/join?token=…` links; admins can rotate them
- **Access requests** — Joiners wait for admin approval when required
- **Verified domains** — Clerk email affiliation verification (admin confirms a one-time code sent to a domain inbox). Matching users get auto-join suggestions / enrollment based on mode
- **Onboarding** — Public-domain users get an auto workspace; private-domain users create or join orgs
- **Trial** — 7-day free trial per organization

### Integrations

- **Google Calendar** — Create meetings with Meet links, view calendar events
- **GitHub** — OAuth integration for code operations

## Tech Stack

| Layer       | Stack                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| App         | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI |
| Auth / orgs | Clerk                                                                   |
| Data        | DynamoDB (ElectroDB), S3                                                |
| Infra       | SST 4 on AWS (Lambda, CloudFront, SQS)                                  |
| AI          | Groq                                                                    |
| Meetings    | Skribby (Meet / Zoom / Teams)                                           |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- AWS account (for deployment)
- Clerk, Groq, and Skribby credentials

### Local Development

1. **Clone and install**

   ```bash
   git clone https://github.com/your-username/Syntheon-AI.git
   cd Syntheon-AI
   pnpm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Key variables (see `.env.local` for the full list):

   ```env
   # AI
   GROQ_API_KEY=your_groq_key
   GROQ_API_KEY_T2=your_groq_tier2_key

   # Meeting Bot
   SKRIBBY_API_KEY=your_skribby_key
   SKRIBBY_WEBHOOK_SECRET=your_webhook_secret
   WEBHOOK_ACCESS_TOKEN=your_token

   # Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

   # Google OAuth
   GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
   GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret

   # GitHub OAuth
   GITHUB_OAUTH_CLIENT_ID=your_github_client_id
   GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret

   # Encryption
   TOKEN_ENCRYPTION_KEY=your_32_byte_hex_key

   # Local dev (optional)
   NGROK_URL=https://your-ngrok-url.ngrok-free.dev
   ```

3. **Start local DynamoDB**

   ```bash
   pnpm run db:local
   ```

4. **Run the dev server**

   ```bash
   pnpm run dev:local
   ```

   For webhook testing with ngrok:

   ```bash
   pnpm run dev:ngrok
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

### Deployment

```bash
# Deploy to AWS via SST
AWS_PROFILE=your_profile npx sst deploy

# Deploy to production stage
AWS_PROFILE=your_profile npx sst deploy --stage production

# Remove deployment
AWS_PROFILE=your_profile npx sst remove
```

## Project Structure

```
Syntheon-AI/
├── app/                        # Next.js App Router
│   ├── (dashboard)/            # Authenticated routes (dashboard, project, settings)
│   ├── api/                    # API routes
│   │   ├── bot/                # Skribby bot (create, continue, webhook)
│   │   ├── meetings/           # Meeting CRUD + tickets + summaries
│   │   ├── projects/           # Projects, sprint-stones, milestones, dependencies
│   │   ├── tickets/            # Ticket CRUD + dependencies + comments
│   │   ├── labels/             # Label CRUD
│   │   ├── organizations/      # Orgs, join, access requests, rotate-join-link
│   │   ├── oauth/              # Google + GitHub OAuth callbacks
│   │   ├── webhooks/           # Clerk (+ billing) webhooks
│   │   └── events/             # SSE for real-time updates
│   ├── join/                   # Org join link landing (`/join?token=…`)
│   ├── onboarding/             # Post-signup org creation / join flow
│   ├── docs/                   # Product docs (marketing site)
│   ├── sign-in/ · sign-up/     # Clerk auth
│   └── page.tsx                # Landing (syntheonhub.com)
├── components/                 # React components
│   ├── settings/               # Orgs, domains, billing, integrations, preferences
│   ├── tickets-board.tsx       # Kanban + List
│   ├── projects-workspace.tsx  # Project tabs
│   └── …
├── db/                         # ElectroDB entities + DynamoDB client
├── infra/                      # SST constructs (web, database, secrets, storage)
├── lib/                        # Business logic
│   ├── db.ts                   # Data access
│   ├── groq.ts                 # AI (extraction, sprints, dependencies, …)
│   ├── skribby.ts              # Meeting bot client
│   ├── org-join.ts             # Join tokens / links / access requests
│   ├── rbac.ts                 # Role-based access control
│   └── clerk-webhook.ts        # Clerk user.created handler
├── middleware.ts               # Auth, beta gate, host routing
├── sst.config.ts
└── package.json
```

## Data Flow

```
Meet / Zoom / Teams → Skribby bot joins → Transcribes → Webhook fires
    ↓
/api/bot/webhook → Fetches transcript → Groq extracts tickets → DynamoDB
    ↓
SSE → Frontend refreshes → Tickets in meeting view
    ↓
User imports tickets to project → AI infers dependencies
    ↓
Generate sprint-stones from project backlog → AI groups tickets
    ↓
Sprint board tracks velocity, burndown, cycle time
```

## API Rate Limiting

- **General API**: 60 requests/minute per user
- **AI endpoints**: 10 requests/minute per user (sprint generation, dependency mapping, health, pulse, summaries)
- **Webhooks**: 100 requests/minute per IP

## Keyboard Shortcuts

- **Cmd/Ctrl + K** — Global search + commands (`/filter`, `/create`)
- **Cmd/Ctrl + B** — Toggle bulk selection mode

## Environment Variables

| Variable                            | Description                                | Required   |
| ----------------------------------- | ------------------------------------------ | ---------- |
| `GROQ_API_KEY`                      | Groq API key (free or dev tier)            | Yes        |
| `GROQ_API_KEY_T2`                   | Groq API key tier 2 (for heavy inference)  | Yes        |
| `SKRIBBY_API_KEY`                   | Skribby bot API key                        | Yes        |
| `SKRIBBY_WEBHOOK_SECRET`            | Skribby webhook HMAC secret                | Yes        |
| `WEBHOOK_ACCESS_TOKEN`              | Token for webhook URL auth                 | Yes        |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                      | Yes        |
| `CLERK_SECRET_KEY`                  | Clerk secret key                           | Yes        |
| `CLERK_WEBHOOK_SECRET`              | Clerk webhook signing secret               | Yes        |
| `GOOGLE_OAUTH_CLIENT_ID`            | Google OAuth client ID                     | Yes        |
| `GOOGLE_OAUTH_CLIENT_SECRET`        | Google OAuth client secret                 | Yes        |
| `GITHUB_OAUTH_CLIENT_ID`            | GitHub OAuth client ID                     | Optional   |
| `GITHUB_OAUTH_CLIENT_SECRET`        | GitHub OAuth client secret                 | Optional   |
| `TOKEN_ENCRYPTION_KEY`              | 32-byte hex key for token encryption       | Yes        |
| `NGROK_URL`                         | Ngrok URL for local webhook testing        | Local only |
| `NEXT_PUBLIC_APP_URL`               | App URL (set by SST; defaults to app host) | Auto       |
| `DYNAMODB_ENDPOINT`                 | Local DynamoDB endpoint                    | Local only |

## License

MIT — See [LICENSE](LICENSE) for details.

## Acknowledgments

- [Skribby](https://platform.skribby.io) — Meeting bot & transcription
- [Groq](https://groq.com) — AI inference
- [Clerk](https://clerk.com) — Authentication & organizations
- [AWS](https://aws.amazon.com) — Hosting via SST
- [Radix UI](https://radix-ui.com) — Accessible components
- [TailwindCSS](https://tailwindcss.com) — Styling
- [ElectroDB](https://github.com/nordfjord/electrodb) — DynamoDB modeling
