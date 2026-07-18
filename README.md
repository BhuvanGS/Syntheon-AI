# Syntheonhub

An AI-powered project management platform that turns meeting conversations into actionable tickets, sprints, and milestones — automatically.

## What Syntheon Hub Does

1. **Bot joins your Google Meet** via Skribby, transcribes the conversation
2. **Webhook fires** → Groq AI extracts tickets from the transcript
3. **Tickets appear** in your project board with priorities, labels, and estimates
4. **AI infers dependencies** between tickets automatically
5. **Generate sprints & milestones** from your ticket backlog with AI
6. **Track velocity, burndown, and cycle time** across sprints

## Features

### Meeting → Tickets

- **Skribby integration** — Bot joins Google Meet, records, transcribes
- **AI ticket extraction** — Groq parses transcripts into structured tickets
- **Auto-refresh** — Meeting view polls every 5s + SSE for real-time updates
- **Meeting summaries** — AI-generated summaries on demand
- **Google Calendar** — Create meetings with Google Meet links directly

### Ticket System (Jira/Linear parity)

- **Kanban + List views** with drag-and-drop
- **Priorities** — Urgent, High, Medium, Low, None (colored dots)
- **Types** — Bug, Task, Feature, Spike
- **Estimates** — T-shirt sizing: Quick, Standard, Deep, Epic
- **Labels** — Org-scoped, custom colors, CRUD management
- **Bulk operations** — Multi-select status/priority/assignee updates (Cmd+B)
- **Command palette** — Global search + `/filter`, `/create` commands (Cmd+K)
- **Filter dialog** — Two-pane filter with live ticket preview
- **Time tracking** — Time estimate, time spent, remaining
- **Due dates** with calendar picker
- **Comments & activity log** on every ticket
- **Attachments** via S3 presigned uploads

### Dependencies

- **Hard & soft dependencies** with automatic escalation (soft → hard after 3 ignores)
- **Status gating** — Hard blockers prevent status transitions; soft blockers warn
- **Cascading regressions** — Reopening a parent auto-reopens done dependents
- **Dependency graph** — SVG visualization with zoom/pan, BFS layered layout
- **AI dependency inference** — Groq suggests dependencies on ticket import

### Sprints & Milestones

- **Sprint creation** — Manual or AI-generated from project context
- **Sprint pulse** — AI-powered health analysis
- **Milestones** — Group sprints with progress tracking
- **Burndown charts** — Track remaining work over time
- **Velocity tracking** — Historical sprint velocity
- **Cycle time** — Ticket lifecycle analytics

### Projects

- **Project workspace** with tickets, meetings, sprints, milestones, dependencies, and members tabs
- **Member roles** — Lead, Member, Viewer with RBAC
- **Project health** — AI-generated health suggestions
- **Ticket grouping** — AI suggests ticket groups for sprint planning

### Authentication & Organizations

- **Clerk** — Email/password, Google OAuth, GitHub OAuth
- **Organizations** — Personal orgs for public domain users (auto-created via webhook)
- **Onboarding** — Public domain users get auto workspace; private domain users create/join orgs
- **Join codes** — Invite users via shareable codes
- **Trial system** — Free trial with usage limits (coming soon)

### Integrations

- **Google Calendar** — Create meetings with Meet links, view calendar events
- **GitHub** — OAuth integration for code operations

## Tech Stack

### Frontend

- **Next.js 16.1.6** — App Router, Turbopack
- **React 19.2.4**
- **TypeScript 5.7.3**
- **TailwindCSS 4.2.0** + Radix UI primitives
- **Lucide React** — Icons
- **Recharts** — Charts (burndown, velocity, cycle time)
- **TipTap** — Rich text editor for comments
- **Motion + GSAP** — Animations
- **Three.js / OGL** — Landing page graphics

### Backend

- **AWS DynamoDB** — Primary database (via ElectroDB ORM)
- **AWS S3** — File attachments
- **AWS Lambda + CloudFront** — Hosting via SST
- **Clerk** — Authentication, organizations, user management
- **Groq** — AI inference (ticket extraction, sprint generation, dependency inference, summaries, health)
- **Skribby** — Meeting bot, transcription
- **Deepgram** — Speech-to-text (legacy)

### Infrastructure

- **SST 4.17.0** — Infrastructure as code
- **Pulumi** — Underlying IaC engine
- **AWS** — Lambda, CloudFront, DynamoDB, S3, SQS
- **ElectroDB** — DynamoDB entity modeling

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- AWS account (for deployment)
- Clerk account
- Groq API key
- Skribby API key

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

   Key variables (see `.env.local` for full list):

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
│   ├── (dashboard)/            # Authenticated routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── project/            # Project workspace
│   │   └── settings/           # User settings
│   ├── api/                    # API routes
│   │   ├── bot/                # Skribby bot (create, continue, webhook)
│   │   ├── meetings/           # Meeting CRUD + tickets + summaries
│   │   ├── projects/           # Project CRUD + sprints + milestones + dependencies
│   │   ├── tickets/            # Ticket CRUD + dependencies + comments + activities
│   │   ├── labels/             # Label CRUD
│   │   ├── organizations/      # Org management + join codes
│   │   ├── oauth/              # Google + GitHub OAuth callbacks
│   │   ├── webhooks/           # Clerk webhook handler
│   │   └── events/             # SSE endpoint for real-time updates
│   ├── onboarding/             # Post-signup org creation flow
│   ├── sign-in/                # Clerk sign-in
│   └── sign-up/                # Clerk sign-up
├── components/                 # React components
│   ├── ui/                     # Radix-based UI primitives
│   ├── ticket-*.tsx            # Ticket components (badges, filter, bulk, editor, etc.)
│   ├── ticket-dependency-*.tsx # Dependency panel + graph
│   ├── projects-workspace.tsx  # Project workspace with tabs
│   ├── tickets-board.tsx       # Kanban + List board
│   ├── ticket-detail.tsx       # Meeting ticket detail view
│   ├── manual-ticket-dialog.tsx
│   ├── dynamic-island-search.tsx # Cmd+K global search
│   ├── sidebar.tsx
│   └── settings/               # Settings tabs
├── db/                         # Database layer
│   ├── entities.ts             # ElectroDB entity definitions
│   └── client.ts               # DynamoDB client config
├── infra/                      # SST infrastructure
│   ├── web.ts                  # Next.js site construct + env vars
│   ├── database.ts             # DynamoDB table definitions
│   ├── secrets.ts              # SST secret definitions
│   └── storage.ts              # S3 bucket definitions
├── lib/                        # Business logic
│   ├── db.ts                   # All DB operations (tickets, meetings, projects, etc.)
│   ├── groq.ts                 # Groq AI (extraction, sprints, dependencies, summaries)
│   ├── skribby.ts              # Skribby bot API client
│   ├── rate-limit.ts           # In-memory rate limiting
│   ├── rbac.ts                 # Role-based access control
│   ├── org-utils.ts            # Org name generation, public domain detection
│   ├── clerk-webhook.ts        # Clerk user.created handler
│   ├── crypto.ts               # Token encryption
│   ├── s3.ts                   # S3 client
│   └── command-events.ts       # Global event emitter for UI commands
├── hooks/                      # Custom React hooks
├── public/                     # Static assets
├── styles/                     # Global CSS
├── syntheon-extension/         # Chrome extension (legacy)
├── scripts/                    # Utility scripts (local table creation)
├── proxy.ts                    # Middleware for route protection
├── sst.config.ts               # SST app config
└── package.json
```

## API Rate Limiting

- **General API**: 60 requests/minute per user
- **AI endpoints**: 10 requests/minute per user (sprint generation, dependency mapping, health, pulse, summaries)
- **Webhooks**: 100 requests/minute per IP

## Data Flow

```
Google Meet → Skribby bot joins → Transcribes → Webhook fires
    ↓
/api/bot/webhook → Fetches transcript from Skribby
    ↓
Groq AI extracts tickets → Saves to DynamoDB
    ↓
SSE event → Frontend auto-refreshes → Tickets appear in meeting view
    ↓
User imports tickets to project → AI infers dependencies
    ↓
User generates sprints from backlog → AI groups tickets
    ↓
Sprint board tracks velocity, burndown, cycle time
```

## Keyboard Shortcuts

- **Cmd/Ctrl + K** — Global search + commands (`/filter`, `/create`)
- **Cmd/Ctrl + B** — Toggle bulk selection mode

## Environment Variables

| Variable                            | Description                               | Required   |
| ----------------------------------- | ----------------------------------------- | ---------- |
| `GROQ_API_KEY`                      | Groq API key (free or dev tier)           | Yes        |
| `GROQ_API_KEY_T2`                   | Groq API key tier 2 (for heavy inference) | Yes        |
| `SKRIBBY_API_KEY`                   | Skribby bot API key                       | Yes        |
| `SKRIBBY_WEBHOOK_SECRET`            | Skribby webhook HMAC secret               | Yes        |
| `WEBHOOK_ACCESS_TOKEN`              | Token for webhook URL auth                | Yes        |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                     | Yes        |
| `CLERK_SECRET_KEY`                  | Clerk secret key                          | Yes        |
| `CLERK_WEBHOOK_SECRET`              | Clerk webhook signing secret              | Yes        |
| `GOOGLE_OAUTH_CLIENT_ID`            | Google OAuth client ID                    | Yes        |
| `GOOGLE_OAUTH_CLIENT_SECRET`        | Google OAuth client secret                | Yes        |
| `GITHUB_OAUTH_CLIENT_ID`            | GitHub OAuth client ID                    | Optional   |
| `GITHUB_OAUTH_CLIENT_SECRET`        | GitHub OAuth client secret                | Optional   |
| `TOKEN_ENCRYPTION_KEY`              | 32-byte hex key for token encryption      | Yes        |
| `NGROK_URL`                         | Ngrok URL for local webhook testing       | Local only |
| `NEXT_PUBLIC_APP_URL`               | App URL (set by SST)                      | Auto       |
| `DYNAMODB_ENDPOINT`                 | Local DynamoDB endpoint                   | Local only |

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
