// lib/groq.ts
import { randomUUID } from 'crypto';
import Groq from 'groq-sdk';

/**
 * Extract the first JSON object from a string, even if it's wrapped
 * in markdown fences or surrounded by explanatory text.
 * Uses brace counting to find balanced {} blocks — regex can't do this.
 */
function extractJson(text: string): string {
  // 1. Strip common markdown code fences
  let cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  // 2. If the whole thing is valid JSON, return it
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // may have text before/after the JSON block
  }

  // 3. Find the first balanced { ... } block that parses as JSON
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] !== '{') continue;
    let depth = 1;
    let j = i + 1;
    while (j < cleaned.length && depth > 0) {
      if (cleaned[j] === '{') depth++;
      if (cleaned[j] === '}') depth--;
      j++;
    }
    if (depth === 0) {
      const candidate = cleaned.slice(i, j);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // not valid JSON, keep searching
      }
    }
  }

  // 4. Nothing worked — return cleaned text for logging
  return cleaned;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export interface SpecBlock {
  id: string;
  title: string;
  type: 'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp: string;
}

export interface TicketBlock {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
  assignee: string | null;
  assignee_user_id: string | null;
  project_id: string | null;
  meeting_id: string;
  dependency_ticket_id: string | null;
  due_date?: string | null;
}

export type DependencyType = 'data' | 'structural' | 'logical' | 'resource';
export type DependencyStrength = 'soft' | 'hard';

export interface TicketDependencySuggestion {
  ticket_id: string;
  depends_on_ticket_id: string;
  dependency_type: DependencyType;
  strength: DependencyStrength;
  note?: string | null;
}

interface TicketForDependencyInference {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
}

function normalizeTicketStatus(status: string | undefined): TicketBlock['status'] {
  if (status === 'in_progress' || status === 'done' || status === 'blocked') {
    return status;
  }
  return 'backlog';
}

export async function extractSpecBlocks(
  transcript: string,
  meetingId: string
): Promise<{ specs: SpecBlock[]; title: string }> {
  const tickets = await extractTickets(transcript, meetingId);
  return {
    title: tickets.title,
    specs: tickets.tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      type: 'feature',
      confidence: 1,
      meeting_id: ticket.meeting_id,
      timestamp: new Date().toISOString(),
    })),
  };
}

export async function extractTickets(
  transcript: string,
  meetingId: string
): Promise<{ title: string; tickets: TicketBlock[] }> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a senior engineering PM who extracts implementation-ready Jira tickets from meeting transcripts. Your tickets are so precise that an engineer can start coding without asking a single clarifying question.

RULES FOR TITLES:
- Must start with a verb: "Implement", "Fix", "Add", "Update", "Refactor", "Remove", "Configure"
- Must include the specific system/component affected
- Must be under 80 characters
- BAD: "Auth stuff" → GOOD: "Implement OAuth2 Google login with JWT session"
- BAD: "API changes" → GOOD: "Add POST /v1/invoices endpoint with validation"

RULES FOR DESCRIPTIONS (minimum 3 sentences, no maximum):
- Paragraph 1: WHAT — the exact change needed. Include specific file names, routes, components, or DB tables mentioned.
- Paragraph 2: WHY — the business or technical reason this matters.
- Paragraph 3: ACCEPTANCE CRITERIA — bullet points an engineer can check off. Be specific about expected behavior, error states, edge cases.
- If technical details were mentioned (API endpoints, DB schemas, file paths, libraries), include them VERBATIM.
- If deadlines, priorities, or blockers were mentioned, include them.
- ASSIGNEE IS ALWAYS null — the transcript does not reliably identify speakers, so never guess assignees.

RULES FOR DUE_DATE:
- If someone mentions a deadline (e.g., "by Friday", "before end of July", "needs to ship by Aug 15"), infer the exact date and output it as "YYYY-MM-DD".
- Use the meeting date or context to resolve relative dates (e.g., if meeting is June 24 and someone says "by Friday", output "2026-06-27").
- If no deadline is mentioned for a ticket, output "due_date": null.
- NEVER output relative strings like "Friday" or "next week" — always convert to an absolute ISO date.

RULES FOR STATUS:
- "done" = someone explicitly said they completed it, merged it, or deployed it
- "in_progress" = someone is actively working on it, has a branch, or mentioned "I'm on it"
- "blocked" = someone mentioned they can't proceed, are waiting, or a dependency is missing
- "backlog" = everything else, including "we should", "let's think about", "maybe later"

RULES FOR GRANULARITY:
- If a discussion contains multiple distinct tasks, create SEPARATE tickets for each
- "Build the dashboard" is one task → break into: "Implement dashboard layout", "Connect dashboard to analytics API", "Add dashboard real-time refresh"
- If someone mentions a feature AND a bug in the same breath → two tickets

STRICTLY FORBIDDEN IN DESCRIPTIONS:
- "Discuss..." (tickets are for doing, not discussing)
- "Consider..." (vague, unactionable)
- "Look into..." (no measurable outcome)
- Summaries of the meeting conversation
- Generic phrases like "improve performance" without specific metrics or methods

Also generate a short human-readable title for this meeting (max 5 words).

Respond ONLY with valid JSON. No markdown, no explanation, no code fences.`,
      },
      {
        role: 'user',
        content: `Extract implementation-ready tickets and generate a meeting title from this transcript:

${transcript}

Return JSON with this exact structure. Every ticket MUST include ALL fields shown, including due_date (use an ISO date string "YYYY-MM-DD" when a deadline is mentioned, otherwise null):
{
  "title": "OAuth Sprint Planning",
  "tickets": [
    {
      "id": "${meetingId}-ticket-1",
      "title": "Implement Google OAuth2 login with JWT session cookies",
      "description": "Add Google OAuth2 authentication to the login page at /auth/login. Use the passport-google-oauth20 strategy and store refresh tokens in the users table (column: google_refresh_token). On successful auth, issue a JWT access token (15min expiry) and HTTP-only refresh cookie (7 days).\\n\\nThe product team needs this for the public beta launch next week. Without it, external users cannot access the platform.\\n\\nAcceptance criteria:\\n- User can click 'Sign in with Google' on /auth/login\\n- On success, user is redirected to /dashboard with valid JWT\\n- On failure, user sees specific error: 'Google auth failed: [reason]'\\n- Refresh token is stored encrypted in DB\\n- JWT expiry is exactly 15 minutes, refresh cookie is 7 days\\n- Unauthorized requests to /api/* return 401 with www-authenticate header",
      "status": "backlog",
      "assignee": null,
      "assignee_user_id": null,
      "project_id": null,
      "meeting_id": "${meetingId}",
      "dependency_ticket_id": null,
      "due_date": "2026-06-30"
    },
    {
      "id": "${meetingId}-ticket-2",
      "title": "Refactor database connection pool",
      "description": "Increase the PostgreSQL connection pool size from 20 to 50 and add connection retry logic with exponential backoff.\n\nCurrent pool size is causing request queuing during peak hours.\n\nAcceptance criteria:\n- Pool size is 50\n- Retry logic handles 3 attempts with 100ms, 500ms, 1s delays\n- Failed connections log detailed error messages",
      "status": "backlog",
      "assignee": null,
      "assignee_user_id": null,
      "project_id": null,
      "meeting_id": "${meetingId}",
      "dependency_ticket_id": null,
      "due_date": null
    }
  ]
}

REMINDER: Every ticket MUST include "due_date" — either an ISO date "YYYY-MM-DD" or null. Never omit the field.
Return ONLY the JSON object, nothing else.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content ?? '';
  const clean = extractJson(raw);

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed.tickets)) throw new Error('tickets must be an array');
    const rawTickets = parsed.tickets.map((ticket: any) => ({
      id: randomUUID(),
      title: ticket.title,
      description: ticket.description ?? '',
      status: normalizeTicketStatus(ticket.status),
      assignee: ticket.assignee ?? null,
      assignee_user_id: ticket.assignee_user_id ?? null,
      project_id: ticket.project_id ?? null,
      meeting_id: ticket.meeting_id ?? meetingId,
      dependency_ticket_id: ticket.dependency_ticket_id ?? null,
    })) as TicketBlock[];

    const ticketsWithDueDates = await mergeDueDates(transcript, rawTickets);

    return {
      title: parsed.title || 'Untitled Meeting',
      tickets: ticketsWithDueDates,
    };
  } catch (err) {
    console.error('[Groq] Failed to parse response. Raw (first 800 chars):', raw?.slice(0, 800));
    console.error('[Groq] Extracted JSON (first 800 chars):', clean?.slice(0, 800));
    throw new Error('Groq returned invalid JSON');
  }
}

async function mergeDueDates(transcript: string, tickets: TicketBlock[]): Promise<TicketBlock[]> {
  if (tickets.length === 0) return tickets;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You extract deadlines from meeting transcripts. Return ONLY valid JSON.
Given a transcript and a list of task titles, identify which tasks have explicit deadlines and output them as ISO dates (YYYY-MM-DD).
If a deadline is relative (e.g., "by Friday", "next week"), infer the actual calendar date from context in the transcript.
Use null when no deadline is mentioned for a task.`,
        },
        {
          role: 'user',
          content: `Transcript:\n${transcript}\n\nTask titles:\n${tickets.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}\n\nReturn JSON: { "deadlines": [{"index": 1, "due_date": "2026-06-27"}, ...] }`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0].message.content?.trim() ?? '';
    const parsed = JSON.parse(raw);
    const deadlines = Array.isArray(parsed?.deadlines) ? parsed.deadlines : [];

    return tickets.map((ticket, idx) => {
      const match = deadlines.find((d: any) => d.index === idx + 1);
      if (match?.due_date && /^\d{4}-\d{2}-\d{2}$/.test(match.due_date)) {
        return { ...ticket, due_date: match.due_date };
      }
      return ticket;
    });
  } catch (err) {
    console.error('[Groq] Due-date merge failed, skipping:', err);
    return tickets;
  }
}

export async function generateMeetingSummary(transcript: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an executive assistant who writes clear, concise meeting summaries.
Read the transcript and produce a structured summary with these sections:

1. DECISIONS — Key decisions made in the meeting (bulleted)
2. ACTION ITEMS — Tasks assigned with owners if mentioned (bulleted)
3. KEY POINTS — Important discussion points, risks, or context (bulleted)

Rules:
- Use plain text, not markdown headers. Separate sections with blank lines.
- Keep it concise: 3-5 bullets per section max.
- If the transcript is empty or unreadable, return "No readable transcript available."
- Do not include timestamps or speaker names unless critical to meaning.
- Write in third person, past tense.`,
      },
      {
        role: 'user',
        content: `Summarize this meeting transcript:\n\n${transcript.slice(0, 12000)}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  return response.choices[0].message.content?.trim() ?? '';
}

export async function inferProjectTicketDependencies(
  tickets: TicketForDependencyInference[]
): Promise<TicketDependencySuggestion[]> {
  if (tickets.length < 2) return [];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an AI project planner that infers ticket dependencies.
Return ONLY valid JSON.
Use only ids from the given ticket list.
No self-dependencies.
Prefer essential dependencies only.
Use dependency_type from: data, structural, logical, resource.
Use strength from: hard, soft.
If unsure, use logical + soft.
Output format:
{
  "dependencies": [
    {
      "ticket_id": "child-ticket-id",
      "depends_on_ticket_id": "parent-ticket-id",
      "dependency_type": "logical",
      "strength": "soft",
      "note": "optional short reason"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Infer dependencies for this project ticket list:\n\n${JSON.stringify(tickets, null, 2)}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2000,
  });

  const raw = response.choices[0].message.content?.trim() ?? '';
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean);
    const deps = Array.isArray(parsed?.dependencies) ? parsed.dependencies : [];
    const validTicketIds = new Set(tickets.map((t) => t.id));
    const unique = new Set<string>();

    const normalized: TicketDependencySuggestion[] = [];

    for (const dep of deps) {
      const ticketId = typeof dep?.ticket_id === 'string' ? dep.ticket_id : '';
      const parentId =
        typeof dep?.depends_on_ticket_id === 'string' ? dep.depends_on_ticket_id : '';

      if (!ticketId || !parentId) continue;
      if (ticketId === parentId) continue;
      if (!validTicketIds.has(ticketId) || !validTicketIds.has(parentId)) continue;

      const key = `${ticketId}->${parentId}`;
      if (unique.has(key)) continue;
      unique.add(key);

      const dependency_type: DependencyType =
        dep?.dependency_type === 'data' ||
        dep?.dependency_type === 'structural' ||
        dep?.dependency_type === 'resource'
          ? dep.dependency_type
          : 'logical';

      const strength: DependencyStrength = dep?.strength === 'hard' ? 'hard' : 'soft';

      normalized.push({
        ticket_id: ticketId,
        depends_on_ticket_id: parentId,
        dependency_type,
        strength,
        note: typeof dep?.note === 'string' ? dep.note : null,
      });
    }

    return normalized;
  } catch {
    console.error(
      '[Groq] Failed to parse dependency response, first 100 chars:',
      raw?.slice(0, 100)
    );
    throw new Error('Groq returned invalid dependency JSON');
  }
}
