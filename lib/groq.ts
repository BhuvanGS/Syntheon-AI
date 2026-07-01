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

function isMeaningfulTicketTitle(title: string): boolean {
  const trimmed = title.trim();
  if (trimmed.length < 3) return false;
  if (/^\d+\.?$/.test(trimmed)) return false;
  if (/^(test|foo|bar|baz|asdf|qwerty|lorem|ipsum)$/i.test(trimmed)) return false;
  const wordCount = trimmed.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount === 1 && trimmed.length < 5) return false;
  return true;
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
  // Truncate very long transcripts to save tokens and API costs
  const MAX_TRANSCRIPT_LENGTH = 10000;
  const truncatedTranscript =
    transcript.length > MAX_TRANSCRIPT_LENGTH
      ? transcript.slice(0, MAX_TRANSCRIPT_LENGTH) + '\n\n[Transcript truncated for length]'
      : transcript;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Extract implementation-ready tickets from meeting transcripts.

TITLE: Start with verb (Implement/Fix/Add/Update), include component, <80 chars

DESCRIPTION (3+ sentences):
1. WHAT: Exact change with specific file names, routes, tables mentioned
2. WHY: Business/technical reason
3. ACCEPTANCE: Bullet points with behavior, errors, edge cases
Include technical details verbatim. ASSIGNEE always null.

DUE_DATE: Convert relative dates to "YYYY-MM-DD" (e.g., "by Friday" → "2026-06-27") or null if not mentioned.

STATUS: done (completed/merged), in_progress (actively working), blocked (waiting/dependency), backlog (default)

GRANULARITY: Separate tickets for distinct tasks. Break large features into multiple tickets.

FORBIDDEN: "Discuss", "Consider", "Look into", meeting summaries, vague phrases

Generate short meeting title (max 5 words). Return ONLY valid JSON, no markdown.`,
      },
      {
        role: 'user',
        content: `Transcript:

${truncatedTranscript}

Return JSON: {"title": "Meeting Title", "tickets": [{"id": "${meetingId}-ticket-1", "title": "...", "description": "...", "status": "backlog", "assignee": null, "assignee_user_id": null, "project_id": null, "meeting_id": "${meetingId}", "dependency_ticket_id": null, "due_date": "YYYY-MM-DD or null"}]}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content ?? '';
  const clean = extractJson(raw);

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed.tickets)) throw new Error('tickets must be an array');
    const rawTickets = parsed.tickets
      .map((ticket: any) => ({
        id: randomUUID(),
        title: ticket.title,
        description: ticket.description ?? '',
        status: normalizeTicketStatus(ticket.status),
        assignee: ticket.assignee ?? null,
        assignee_user_id: ticket.assignee_user_id ?? null,
        project_id: ticket.project_id ?? null,
        meeting_id: ticket.meeting_id ?? meetingId,
        dependency_ticket_id: ticket.dependency_ticket_id ?? null,
      }))
      .filter((ticket: TicketBlock) => isMeaningfulTicketTitle(ticket.title)) as TicketBlock[];

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

  const meaningfulTickets = tickets.filter((t) => isMeaningfulTicketTitle(t.title));
  if (meaningfulTickets.length < 2) return [];

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
        content: `Infer dependencies for this project ticket list:\n\n${JSON.stringify(meaningfulTickets, null, 2)}`,
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
    const validTicketIds = new Set(meaningfulTickets.map((t) => t.id));
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
