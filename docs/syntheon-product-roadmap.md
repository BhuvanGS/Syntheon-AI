# Syntheon Product Roadmap: From Meeting AI to Full-Stack Delivery OS

**Generated:** 26 Jun 2026  
**Purpose:** Map every feature needed to turn Syntheon into a full-fledged project management platform. This document is intended for implementation by a coding agent. No code is contained here — only requirements, acceptance criteria, and implementation guidance.

---

## 1. Current Syntheon Snapshot

### What Already Exists

| Domain                  | Existing Capability                                       | Notes                                                                          |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Auth & Orgs**         | Clerk-based auth, organization creation/selection         | `app/onboarding/page.tsx`, `app/(dashboard)/` layout                           |
| **Meetings**            | Bot joins via Skribby, records, transcribes               | `app/api/bot/create/route.ts`, `lib/skribby.ts`                                |
| **Transcripts**         | Stored per meeting, fetchable via webhook                 | `app/api/bot/webhook/route.ts`                                                 |
| **Ticket Extraction**   | Groq extracts tickets from transcript, saves to project   | `lib/groq.ts`, `lib/db.ts`                                                     |
| **Projects**            | Project creation, workspace, Kanban, list, Gantt views    | `components/projects-workspace.tsx`, `app/(dashboard)/project/page.tsx`        |
| **Tickets**             | CRUD, status, assignee, due dates, priority, dependencies | `components/tickets-board.tsx`, `app/api/tickets/[id]/route.ts`                |
| **Dependencies**        | Hard/soft dependencies, escalation, graph view            | `components/ticket-dependency-graph.tsx`, `lib/db.ts`                          |
| **Calendar**            | Meeting calendar, Gantt view, Google Calendar OAuth       | `components/meeting-calendar.tsx`, `app/(dashboard)/settings/page.tsx`         |
| **Search**              | Dynamic Island search component                           | `components/dynamic-island-search.tsx`                                         |
| **Notifications**       | Notification bell API, event-based creation               | `components/notification-bell.tsx`, `app/api/notifications/route.ts`           |
| **Comments / Activity** | Ticket comments and activity log panels                   | `components/ticket-comments-panel.tsx`, `components/ticket-activity-panel.tsx` |
| **Integrations**        | GitHub, Google Calendar                                   | `app/api/integrations/`, `lib/services/integrations/`                          |
| **Storage**             | Supabase storage for uploads                              | `app/api/upload/`, `lib/supabase.ts`                                           |
| **Database**            | Drizzle ORM, Supabase postgres                            | `db/schema.ts`, `db/index.ts`, `lib/db.ts`                                     |

### What Is Missing (The Full-Stack Gap)

Syntheon is currently a **meeting-to-ticket extraction engine** with a project board. To become a full delivery OS, it needs:

1. **Proactive intelligence layer** — stale detection, risk alerts, digests
2. **Cross-meeting continuity** — ticket history across meetings
3. **Auto-blocker detection** — speech → dependency/status
4. **Stakeholder communication** — audience-aware updates
5. **Planning & capacity** — sprints, workload, capacity planning
6. **Workflow automation** — rules, triggers, webhooks
7. **Reporting & analytics** — velocity, burndown, project health
8. **Collaboration** — mentions, reactions, notifications, inbox
9. **Quality & polish** — onboarding, empty states, performance
10. **Enterprise readiness** — audit logs, roles, SSO, data retention

---

## 2. Product Vision

> **Syntheon is the only project manager that attends your meetings and keeps the roadmap current for you.**

### Core Loops

1. **Capture Loop:** Meeting → transcript → extracted tickets → project board
2. **Update Loop:** Speech → status change → activity log → notification
3. **Insight Loop:** Ticket movement + meeting mentions → digest → stakeholder update
4. **Planning Loop:** Due dates + dependencies + capacity → schedule → risk alerts

### Differentiation

- **Closed-loop automation:** Conversation → ticket → status → insight
- **Native meeting intelligence:** Not an integration, but the core engine
- **Opinionated delivery model:** Not a blank canvas; built for shipping

---

## 3. Feature Map by Phase

### Phase 0: Harden Existing Foundation (Now — 1 week)

Make the current features reliable and market-ready.

| ID  | Feature                       | Why Now                                             |
| --- | ----------------------------- | --------------------------------------------------- |
| 0.1 | Notification inbox & delivery | Notifications are created but not reliably surfaced |
| 0.2 | Global search completion      | Dynamic Island exists but needs real functionality  |
| 0.3 | Comments & activity polish    | Panels exist, but need threading and mentions       |
| 0.4 | Onboarding & empty states     | New users need guidance to first value              |
| 0.5 | Bug bash & performance        | Ticket extraction, status updates, UI latency       |

### Phase 1: Meeting Intelligence Differentiation (Weeks 2–3)

Build features that no competitor can copy because they require meeting-native context.

| ID  | Feature                              | Why It Wins                                     |
| --- | ------------------------------------ | ----------------------------------------------- |
| 1.1 | Cross-meeting ticket continuity      | Show every meeting where a ticket was discussed |
| 1.2 | Meeting prep auto-brief              | Before a meeting, surface open items and risks  |
| 1.3 | Stale ticket detection               | Proactive flags based on "last discussed" date  |
| 1.4 | Auto-blocker detection from speech   | Transcript → dependency / blocked status        |
| 1.5 | AI meeting summary & follow-up email | Send a summary after every meeting              |

### Phase 2: Delivery Intelligence (Weeks 4–6)

Turn the project board into a decision-making tool.

| ID  | Feature                       | Why It Wins                                                |
| --- | ----------------------------- | ---------------------------------------------------------- |
| 2.1 | AI daily/weekly digest        | Natural-language status for any audience                   |
| 2.2 | Project health score          | Risk score based on stale tickets, dependencies, due dates |
| 2.3 | Risk alerts & escalations     | Notify when projects are at risk of slipping               |
| 2.4 | Velocity & throughput reports | Track team delivery speed over time                        |
| 2.5 | Sprint / cycle planning       | Time-boxed work with capacity and burndown                 |

### Phase 3: Team & Workflow Automation (Weeks 7–9)

Make the system work for the whole org, not just PMs.

| ID  | Feature                            | Why It Wins                                            |
| --- | ---------------------------------- | ------------------------------------------------------ |
| 3.1 | Workflow automation rules          | If-this-then-that for tickets, meetings, notifications |
| 3.2 | Custom ticket statuses per project | Beyond the default backlog/in-progress/done            |
| 3.3 | Team workload & capacity view      | See who is overloaded and who has capacity             |
| 3.4 | Time tracking & estimates          | Log time, compare estimates vs actuals                 |
| 3.5 | Webhooks & API key management      | Allow external systems to react to Syntheon events     |

### Phase 4: Enterprise & Scale (Weeks 10–12)

Unlock larger teams and revenue.

| ID  | Feature                    | Why It Wins                    |
| --- | -------------------------- | ------------------------------ |
| 4.1 | Roles & permissions (RBAC) | Admin, manager, member, viewer |
| 4.2 | Audit logs                 | Who changed what and when      |
| 4.3 | Data export & retention    | Backup, compliance, GDPR       |
| 4.4 | SAML/SSO beyond Clerk      | Enterprise auth                |
| 4.5 | Billing & plans            | Self-serve paid tiers          |

---

## 4. Detailed Feature Specifications

### Phase 0: Harden Existing Foundation

#### 0.1 — Notification Inbox & Delivery

**User story:** As a user, I see a notification inbox with unread/read states, and I receive notifications via in-app, email, or Slack when important events happen.

**Current state:** `notifications` table exists, `createNotification` is called in several places, and `notification-bell.tsx` exists but may not be fully wired.

**Requirements:**

- Add `notifications` table columns: `type`, `title`, `body`, `read_at`, `metadata`, `channel` (in_app/email/slack)
- Create `/api/notifications` endpoints: GET list, PATCH mark-read, DELETE dismiss
- Add real-time notification badge update (SSE or polling)
- Add email notification worker (can be simple async function or background queue)
- Add Slack notification integration (optional, webhook-based)

**Acceptance criteria:**

- [ ] User receives in-app notification when a ticket is assigned to them
- [ ] User receives in-app notification when a ticket they own changes status
- [ ] User can mark all notifications as read
- [ ] Unread count appears on the bell icon
- [ ] Notification inbox opens from the bell

**Technical notes:**

- Use existing SSE provider (`components/sse-provider.tsx`) if appropriate
- Reuse existing notification creation in `lib/db.ts`
- Email can use a simple SMTP or Resend integration

---

#### 0.2 — Global Search Completion

**User story:** As a user, I press `Cmd+K` and search across meetings, tickets, projects, and comments, and jump directly to any result.

**Current state:** `components/dynamic-island-search.tsx` exists. Likely needs backend wiring.

**Requirements:**

- Create `/api/search` endpoint accepting `q` query
- Return unified results: projects, meetings, tickets, comments
- Support keyboard navigation (arrow keys, enter)
- Group results by type with icons
- Debounce input (300ms)
- Show empty state when no results

**Acceptance criteria:**

- [ ] Pressing Cmd+K opens search
- [ ] Typing searches across projects, meetings, tickets
- [ ] Clicking a result navigates to the correct page
- [ ] Recent searches are cached locally
- [ ] Search works in <300ms for typical queries

**Technical notes:**

- Use existing `dynamic-island-search.tsx` component
- Add full-text search via PostgreSQL `tsvector` or simple `ILIKE` across multiple tables
- Implement in `lib/db.ts` as `searchGlobal(query)`

---

#### 0.3 — Comments & Activity Polish

**User story:** As a user, I comment on tickets with @mentions, see a threaded activity log, and reply to comments.

**Current state:** `components/ticket-comments-panel.tsx` and `ticket-activity-panel.tsx` exist.

**Requirements:**

- Add `@mention` support in comments (autocomplete users)
- Thread replies to comments
- Show comment + activity in a unified timeline
- Notify mentioned users
- Support file attachments on comments

**Acceptance criteria:**

- [ ] User can type `@` and see a list of org members
- [ ] Mentioned user receives notification
- [ ] Replies are nested under parent comment
- [ ] Activity log shows status changes, assignments, due date changes
- [ ] Comments can include attachments

**Technical notes:**

- Reuse `mention-editor.tsx` or `tiptap-editor.tsx` for rich text
- Add `ticket_comments` table if not already present (check `db/schema.ts`)
- Add `ticket_activities` table for system events

---

#### 0.4 — Onboarding & Empty States

**User story:** As a new user, I understand what Syntheon does and create my first project/meeting within 5 minutes.

**Current state:** `app/onboarding/page.tsx` exists. Likely minimal.

**Requirements:**

- Onboarding flow: welcome → create org → create project → connect calendar → schedule/record first meeting
- Empty states for projects, tickets, meetings, dependencies with clear CTAs
- Tooltips / product tours for first-time users
- Quick-start templates (e.g., "Sprint planning", "Bug triage", "Product review")

**Acceptance criteria:**

- [ ] New user sees onboarding wizard on first login
- [ ] Empty project shows a "Record your first meeting" CTA
- [ ] Empty ticket board shows template options
- [ ] User can skip onboarding and return later
- [ ] Onboarding completion is tracked

**Technical notes:**

- Use `localStorage` or user metadata for onboarding completion
- Add `OnboardingChecklist` component

---

#### 0.5 — Bug Bash & Performance

**User story:** As a user, the app feels fast and reliable.

**Requirements:**

- Audit all API routes for N+1 queries
- Add loading skeletons to slow views
- Optimize `projects-workspace.tsx` and `tickets-board.tsx` re-renders
- Add error boundaries and fallback UI
- Fix any remaining Google OAuth / Skribby webhook edge cases

**Acceptance criteria:**

- [ ] Page load times <2s for dashboard and project views
- [ ] No API route takes >500ms without a reason
- [ ] Error boundaries catch crashes and show friendly messages
- [ ] Webhook is idempotent and handles retries

---

### Phase 1: Meeting Intelligence Differentiation

#### 1.1 — Cross-Meeting Ticket Continuity

**User story:** As a user, I open a ticket and see every meeting where it was discussed, with timestamps and snippets from the transcript.

**Why it wins:** No meeting assistant or PM tool links tickets to multiple meeting conversations.

**Requirements:**

- Add `meeting_ticket_mentions` join table: `ticket_id`, `meeting_id`, `transcript_snippet`, `speaker`, `timestamp`, `confidence`
- When Groq extracts tickets, also extract _mentions_ of existing tickets in the transcript
- On ticket detail page, show "Discussed in" section with meeting links
- On meeting detail page, show "Tickets mentioned" section

**Acceptance criteria:**

- [ ] A ticket created in Meeting A appears with "Created in Meeting A"
- [ ] If the same ticket is mentioned in Meeting B, it shows "Discussed in Meeting B"
- [ ] Each mention shows a transcript snippet (±2 lines)
- [ ] User can click to jump to the meeting detail
- [ ] Cross-meeting mentions are searchable

**Technical notes:**

- Add new extraction prompt in `lib/groq.ts` to detect existing ticket mentions
- Store transcript snippets as text, not full references
- Use fuzzy matching or ticket IDs from speech (e.g., "ticket SYNT-42")

---

#### 1.2 — Meeting Prep Auto-Brief

**User story:** Before a scheduled meeting, Syntheon emails/opens a brief with open tickets, stale items, and risks for the project.

**Why it wins:** Replaces the manual "let me check the board before standup" ritual.

**Requirements:**

- Add `meeting_briefs` table: `meeting_id`, `content`, `generated_at`, `sent_at`
- Cron or webhook trigger: when bot is about to join a meeting, generate brief
- Brief includes:
  - Open tickets in the project
  - Tickets stale >7 days
  - Hard-blocked tickets
  - Tickets due this week
  - Tickets with cross-meeting continuity (discussed before, still open)

**Acceptance criteria:**

- [ ] Brief generated automatically for scheduled meetings
- [ ] User can view brief in meeting detail page
- [ ] Brief is sent via email 15 minutes before meeting
- [ ] Brief includes at least 3 sections: open, stale, blocked

**Technical notes:**

- Use Groq to generate natural-language brief from structured data
- Use existing Google Calendar integration to know upcoming meetings
- Add `/api/meetings/[id]/brief` route

---

#### 1.3 — Stale Ticket Detection

**User story:** As a PM, I see a list of stale tickets and their last meeting mention, so I can follow up.

**Why it wins:** Uses the unique meeting timeline data no one else has.

**Requirements:**

- Add `stale_ticket_reports` table or use a computed view
- Define stale rules:
  - No status change in 7 days
  - No meeting mention in 7 days
  - Due within 3 days and no recent activity
- Show stale ticket badge in project workspace
- Add "Stale tickets" filter/view
- Send weekly stale ticket digest

**Acceptance criteria:**

- [ ] Stale tickets are auto-flagged
- [ ] Last meeting mention date is shown
- [ ] User can filter board by stale
- [ ] Stale digest is sent weekly
- [ ] Staleness is configurable per project

**Technical notes:**

- Add `last_meeting_mention_at` to tickets table or use join
- Add cron job for weekly stale digest

---

#### 1.4 — Auto-Blocker Detection from Speech

**User story:** When someone says "we're blocked on the API" in a meeting, the related ticket is marked Blocked and a dependency is suggested.

**Why it wins:** Closes the loop between conversation and project state.

**Requirements:**

- Add new Groq extraction: `detectBlockers(transcript, tickets)` → array of `{ ticket_id, blocker_text, dependency_type, confidence }`
- When a blocker is detected with high confidence:
  - Mark ticket status as `blocked` if project uses that status
  - OR create a soft dependency on a placeholder "External blocker" ticket
  - Notify ticket owner
- Show detected blockers in meeting detail for review
- Allow user to confirm/reject each detected blocker

**Acceptance criteria:**

- [ ] Bot detects blocker language in transcript
- [ ] Suggested blockers appear in meeting detail
- [ ] User can approve or reject each suggestion
- [ ] Approved blocker updates ticket status or creates dependency
- [ ] Owner receives notification

**Technical notes:**

- Use human-in-the-loop initially; auto-apply only above 0.9 confidence
- Add `detected_blockers` table to store pending suggestions
- Reuse existing dependency system in `lib/db.ts`

---

#### 1.5 — AI Meeting Summary & Follow-Up Email

**User story:** After a meeting, Syntheon sends a summary with decisions, action items, and open questions to attendees.

**Why it wins:** Replaces manual note sharing and ensures accountability.

**Requirements:**

- Generate summary from transcript using Groq
- Extract: decisions, action items, open questions, key discussion points
- Send email to all attendees with summary
- Post to Slack if integration enabled
- Store summary in meeting detail page

**Acceptance criteria:**

- [ ] Summary generated within 2 minutes of meeting end
- [ ] Email sent to attendees
- [ ] Summary includes decisions, action items, open questions
- [ ] User can regenerate summary
- [ ] Summary is visible in meeting detail

**Technical notes:**

- Add `meeting_summaries` table
- Use existing email/SMTP or Resend integration
- Add `/api/meetings/[id]/summary` route

---

### Phase 2: Delivery Intelligence

#### 2.1 — AI Daily/Weekly Digest

**User story:** As a team lead, I receive a morning/weekly email with what moved, what stalled, and what is at risk.

**Why it wins:** Solves the #1 business pain point: manual reporting.

**Requirements:**

- Add `digests` table: `type` (daily/weekly), `recipient_id`, `content`, `sent_at`
- Digest content:
  - Completed tickets since last digest
  - New tickets created
  - Stale tickets
  - Blocked tickets
  - Upcoming due dates
  - Cross-meeting mentions
- Support different audiences: team member, manager, executive
- Allow scheduling (daily at 9am, weekly on Monday)

**Acceptance criteria:**

- [ ] User can subscribe to daily/weekly digest
- [ ] Digest is generated automatically
- [ ] Digest contains natural-language summary
- [ ] Different roles see different levels of detail
- [ ] Digest can be viewed in-app and via email

**Technical notes:**

- Add cron job or scheduled edge function
- Use Groq for natural-language generation
- Add `/api/digests` route

---

#### 2.2 — Project Health Score

**User story:** As a PM, I see a 0-100 health score for each project based on objective signals.

**Why it wins:** Gives executives a single metric they can trust.

**Requirements:**

- Compute health score from:
  - On-time completion rate
  - Stale ticket ratio
  - Blocked ticket ratio
  - Dependency cycle count
  - Missed due dates
  - Meeting mention velocity
- Show score on project card and project detail
- Trend over time (sparkline)

**Acceptance criteria:**

- [ ] Each project has a visible health score
- [ ] Score updates daily
- [ ] Hovering shows breakdown of factors
- [ ] Score history is stored for trend chart
- [ ] Projects below threshold trigger alert

**Technical notes:**

- Add `project_health_scores` table
- Run daily job to compute score
- Formula: weighted average of normalized signals

---

#### 2.3 — Risk Alerts & Escalations

**User story:** As a PM, I get alerted when a project is at risk of missing its timeline.

**Why it wins:** Moves from reactive to proactive management.

**Requirements:**

- Detect risk signals:
  - Multiple stale tickets
  - Due date approaching with no status change
  - Hard dependency unresolved
  - Velocity dropping week over week
- Risk levels: low, medium, high, critical
- Send notification to project owner/manager
- Suggest mitigation actions

**Acceptance criteria:**

- [ ] Risk alert generated when threshold crossed
- [ ] Alert includes specific tickets and reasons
- [ ] User can dismiss or snooze alert
- [ ] Critical risks escalate to admin/owner
- [ ] Risk dashboard shows all active risks

**Technical notes:**

- Add `risk_alerts` table
- Reuse notification system
- Add `/api/projects/[id]/risks` route

---

#### 2.4 — Velocity & Throughput Reports

**User story:** As a team lead, I see how many tickets the team completes per week and per sprint.

**Why it wins:** Standard agile reporting that teams expect.

**Requirements:**

- Track tickets completed per week/project
- Show burndown chart for date ranges
- Show cumulative flow diagram
- Compare velocity across periods
- Export to CSV

**Acceptance criteria:**

- [ ] Velocity chart on project dashboard
- [ ] Burndown chart for sprint/cycle
- [ ] Cumulative flow diagram
- [ ] Date range selector
- [ ] Export to CSV

**Technical notes:**

- Use existing chart components (`components/ui/chart.tsx`)
- Compute from ticket status history

---

#### 2.5 — Sprint / Cycle Planning

**User story:** As a team, I plan a 2-week sprint by selecting tickets and seeing capacity.

**Why it wins:** Standard agile practice that Syntheon currently lacks.

**Requirements:**

- Add `sprints` or `cycles` table: `project_id`, `name`, `start_date`, `end_date`, `goal`
- Add tickets to sprint with drag-and-drop or bulk action
- Show sprint board filtered by sprint
- Burndown chart per sprint
- Sprint velocity computed automatically

**Acceptance criteria:**

- [ ] User can create a sprint with dates and goal
- [ ] Tickets can be assigned to sprint
- [ ] Board can filter by sprint
- [ ] Burndown chart updates daily
- [ ] Sprint retrospective shows completed vs planned

**Technical notes:**

- Add `sprint_id` to tickets table
- Add sprint views to project workspace

---

### Phase 3: Team & Workflow Automation

#### 3.1 — Workflow Automation Rules

**User story:** As an admin, I create rules like: "When a ticket moves to Done, notify Slack and update GitHub PR status."

**Why it wins:** Competes with Asana/ClickUp automation.

**Requirements:**

- Add `automation_rules` table: `project_id`, `trigger`, `conditions`, `actions`, `enabled`
- Triggers: ticket created, status changed, due date approaching, stale detected, blocker detected
- Actions: send notification, update field, create ticket, call webhook, send Slack message
- Simple rule builder UI
- Audit log of rule executions

**Acceptance criteria:**

- [ ] User can create an automation rule
- [ ] Rule triggers on matching event
- [ ] Actions execute reliably
- [ ] Rules can be disabled
- [ ] Execution history is visible

**Technical notes:**

- Implement event bus pattern (`lib/event-bus.ts` may exist)
- Add rule engine in `lib/automation.ts`
- Add `/api/automation/rules` route

---

#### 3.2 — Custom Ticket Statuses Per Project

**User story:** As a project admin, I define my own workflow states: Backlog → Todo → In Review → QA → Done.

**Why it wins:** Teams need their own workflow, not a one-size-fits-all board.

**Requirements:**

- Add `ticket_statuses` table: `project_id`, `name`, `color`, `order`, `category`
- Default statuses remain for new projects
- Allow reordering and CRUD
- Update board columns to reflect custom statuses

**Acceptance criteria:**

- [ ] Admin can add/edit/delete statuses per project
- [ ] Board columns match custom statuses
- [ ] Existing tickets keep their status mapping
- [ ] Default workflow available as template

**Technical notes:**

- Refactor ticket status from enum to project-scoped table
- Migration required for existing tickets

---

#### 3.3 — Team Workload & Capacity View

**User story:** As a manager, I see how many tickets each team member has across projects.

**Why it wins:** Prevents burnout and helps allocation.

**Requirements:**

- Show workload by assignee:
  - Open tickets count
  - Estimated effort sum
  - Due this week
  - Overdue count
- Capacity field per user (hours/day or points/sprint)
- Visual indicator when overloaded

**Acceptance criteria:**

- [ ] Workload view accessible from dashboard
- [ ] Shows per-user ticket counts and effort
- [ ] Overload threshold is configurable
- [ ] Clicking user shows their assigned tickets
- [ ] Data updates in real time

**Technical notes:**

- Add `capacity` field to user profile
- Aggregate from tickets table

---

#### 3.4 — Time Tracking & Estimates

**User story:** As a developer, I log time spent on a ticket and compare it to the original estimate.

**Why it wins:** Standard project management expectation, especially for agencies.

**Requirements:**

- Add `time_entries` table: `ticket_id`, `user_id`, `minutes`, `description`, `logged_at`
- Add `estimate_minutes` to tickets
- Show total logged time on ticket
- Show variance: estimate vs actual
- Project-level time reports

**Acceptance criteria:**

- [ ] User can log time on a ticket
- [ ] User can set estimate on ticket creation/edit
- [ ] Ticket shows logged/estimated time
- [ ] Project report shows time by user and ticket
- [ ] Time can be exported

**Technical notes:**

- Add time entry modal/panel
- Add time reports to project workspace

---

#### 3.5 — Webhooks & API Key Management

**User story:** As a developer, I connect Syntheon events to my own systems.

**Why it wins:** Enables enterprise integrations and ecosystem.

**Requirements:**

- Add `webhooks` table: `project_id`, `url`, `events`, `secret`, `active`
- Add `api_keys` table for programmatic access
- Events: ticket.created, ticket.updated, meeting.finished, etc.
- Webhook delivery with retries
- Delivery logs

**Acceptance criteria:**

- [ ] User can create a webhook with URL and event selection
- [ ] Webhook fires on matching events
- [ ] Failed deliveries retry with exponential backoff
- [ ] API keys can be generated and revoked
- [ ] Webhook delivery logs are viewable

**Technical notes:**

- Use HMAC signature for webhook security
- Add `/api/webhooks` and `/api/api-keys` routes

---

### Phase 4: Enterprise & Scale

#### 4.1 — Roles & Permissions (RBAC)

**User story:** As an org admin, I assign roles with specific permissions.

**Why it wins:** Required for team adoption beyond small groups.

**Requirements:**

- Roles: org admin, project admin, manager, member, viewer
- Permissions: create project, delete ticket, manage members, view reports, manage billing
- Project-level member roles
- Invite flow with role assignment

**Acceptance criteria:**

- [ ] Admin can invite users with a role
- [ ] Role determines visible UI and allowed actions
- [ ] Viewer can see but not edit
- [ ] Project admin can manage their project

**Technical notes:**

- Extend Clerk org roles
- Add `project_members` role column
- Enforce permissions in API routes

---

#### 4.2 — Audit Logs

**User story:** As an admin, I see every significant change in the org.

**Why it wins:** Compliance and trust.

**Requirements:**

- Add `audit_logs` table: `actor_id`, `action`, `entity_type`, `entity_id`, `changes`, `created_at`
- Log: ticket changes, project changes, member invites, role changes, settings changes
- Filterable by user, action, entity
- Export to CSV

**Acceptance criteria:**

- [ ] All ticket updates create audit entries
- [ ] Admin can view audit log
- [ ] Audit log is filterable
- [ ] Export works
- [ ] Audit logs are retained for configurable duration

**Technical notes:**

- Add `logAuditEvent` helper
- Use middleware or explicit calls in API routes

---

#### 4.3 — Data Export & Retention

**User story:** As an admin, I export all my data or configure retention.

**Why it wins:** GDPR, compliance, customer trust.

**Requirements:**

- Export org data as JSON/ZIP
- Export project data as CSV
- Configure data retention for meetings/transcripts
- Soft-delete with recovery window

**Acceptance criteria:**

- [ ] Admin can export all org data
- [ ] User can export project data
- [ ] Retention settings available in settings
- [ ] Deleted data is recoverable for 30 days

**Technical notes:**

- Add `/api/export` route
- Use Supabase storage for export files

---

#### 4.4 — SAML/SSO Beyond Clerk

**User story:** As an enterprise customer, I use my own identity provider.

**Why it wins:** Enterprise sales requirement.

**Requirements:**

- Support SAML 2.0 and OIDC
- Admin-configured SSO in settings
- Just-in-time provisioning
- Force SSO for org

**Acceptance criteria:**

- [ ] Admin can configure SAML provider
- [ ] Users can log in via SSO
- [ ] SSO enforcement toggle
- [ ] SCIM provisioning (optional)

**Technical notes:**

- Clerk may support enterprise SSO; evaluate Clerk vs. WorkOS

---

#### 4.5 — Billing & Plans

**User story:** As a founder, I monetize Syntheon with self-serve plans.

**Why it wins:** Required for business viability.

**Requirements:**

- Plans: Free, Pro, Team, Enterprise
- Limits: meetings/month, users, storage, AI minutes
- Stripe integration
- Usage tracking
- Upgrade/downgrade flow

**Acceptance criteria:**

- [ ] User can upgrade to paid plan
- [ ] Usage limits enforced
- [ ] Billing portal accessible
- [ ] Invoices generated
- [ ] Usage dashboard visible

**Technical notes:**

- Add Stripe integration
- Add `subscriptions` table
- Add usage counters

---

## 5. Implementation Priorities

### Recommended Order (High Impact, Low Effort First)

1. **0.1 Notification inbox** — Foundation for everything else
2. **1.1 Cross-meeting ticket continuity** — Unique differentiator, uses existing data
3. **1.3 Stale ticket detection** — High impact, simple rules
4. **2.1 AI daily/weekly digest** — Marketing story, leverages existing data
5. **1.4 Auto-blocker detection** — Closes the conversation-to-status loop
6. **0.2 Global search** — Table stakes for usability
7. **1.2 Meeting prep brief** — Natural extension of existing meeting flow
8. **2.2 Project health score** — Executive-visible metric
9. **3.2 Custom statuses** — Required for team adoption
10. **3.1 Workflow automation** — Ecosystem lock-in

### Must-Have for Product-Market Fit

- Notification inbox (0.1)
- Cross-meeting continuity (1.1)
- Stale ticket detection (1.3)
- AI digest (2.1)
- Auto-blocker detection (1.4)
- Global search (0.2)

### Nice-to-Have for Differentiation

- Meeting prep brief (1.2)
- Project health score (2.2)
- Velocity reports (2.4)
- Sprint planning (2.5)
- Custom statuses (3.2)

### Enterprise Gate

- RBAC (4.1)
- Audit logs (4.2)
- SSO (4.4)
- Billing (4.5)

---

## 6. Technical Architecture Notes

### Database Additions Needed

- `meeting_ticket_mentions` — cross-meeting continuity
- `meeting_summaries` — AI summaries
- `meeting_briefs` — prep briefs
- `detected_blockers` — pending blocker suggestions
- `stale_ticket_reports` — stale tracking
- `digests` — digest reports
- `project_health_scores` — health scores
- `risk_alerts` — risk alerts
- `sprints` — sprint planning
- `ticket_statuses` — custom statuses
- `time_entries` — time tracking
- `automation_rules` + `automation_executions` — workflow automation
- `webhooks` + `webhook_deliveries` — webhooks
- `api_keys` — API access
- `audit_logs` — audit
- `subscriptions` + `usage` — billing

### Background Jobs / Cron

- Daily digest generation
- Weekly stale digest
- Project health score computation
- Risk alert evaluation
- Webhook retries

### External Services

- **Email:** Resend or SendGrid
- **Slack:** Slack OAuth + webhook API
- **Stripe:** Billing
- **WorkOS:** Enterprise SSO (if not Clerk)
- **Groq:** All LLM extractions

### Files to Touch / Create

- `lib/db.ts` — new queries
- `lib/groq.ts` — new extraction prompts
- `db/schema.ts` — new tables
- `app/api/` — new routes
- `components/` — new UI components
- `lib/automation.ts` — rule engine
- `lib/billing.ts` — Stripe wrapper
- `lib/audit.ts` — audit logger

---

## 7. Success Metrics

### Product Health

- **Time to first value:** New user creates project + sees first extracted ticket within 1 hour
- **Weekly active users (WAU):** % of org members who open the app weekly
- **Meeting coverage:** % of project meetings recorded by Syntheon bot
- **Ticket auto-creation rate:** % of tickets created from meetings vs manually

### Engagement

- **Board update frequency:** Tickets moved/updated per week
- **Digest open rate:** % of digests opened
- **Cross-meeting views:** % of tickets viewed with "Discussed in" section
- **Stale ticket resolution:** % of stale tickets resolved within 7 days of flag

### Business

- **Free-to-paid conversion:** % of free orgs upgrading
- **Net revenue retention:** Revenue growth from existing customers
- **Enterprise pipeline:** Number of SSO/audit-log inquiries

---

## 8. Open Questions for Product Decisions

1. **Scope:** Should Syntheon target software teams first, or all project-driven teams?
2. **Status model:** Keep simple 3-state default or allow full custom workflows early?
3. **Auto-approval:** How aggressive should auto-blocker/status changes be by default?
4. **Pricing:** Usage-based (AI minutes, meetings) or per-seat?
5. **Deployment:** Continue cloud-only, or add self-hosted/air-gapped for enterprise?
6. **Integrations:** Prioritize Slack, Linear, or more dev tools?

---

**End of report.**
