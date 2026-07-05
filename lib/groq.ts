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
const groqT2 = new Groq({ apiKey: process.env.GROQ_API_KEY_T2 || process.env.GROQ_API_KEY! });

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
  status: string;
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
  status: string;
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

The transcript is formatted as "SpeakerName: their text". Use speaker context to determine assignees and status.

TITLE: Start with verb (Implement/Fix/Add/Update/Set Up/Write/Build/Configure/Complete), include component, <80 chars

DESCRIPTION:
- For done tasks: 1 sentence summarizing what was completed
- For active/new tasks: 2-3 sentences with WHAT (specific changes), WHY (reason), and key acceptance criteria
Keep descriptions concise — avoid verbose padding.

ASSIGNEE: Extract from speaker context. If "Sarah: I'll handle the API" → assignee: "Sarah". If someone says "John, can you take the frontend?" → assignee: "John". Use the speaker's name as it appears in the transcript. Set null only if no one claims ownership.

DUE_DATE: Today is ${new Date().toISOString().split('T')[0]}. Convert relative dates to absolute "YYYY-MM-DD" based on today's date (e.g., if today is 2026-07-02 and someone says "by Friday" → "2026-07-04"). Use null if not mentioned.

STATUS RULES:
- done: speaker says they completed/finished/merged/shipped/deployed/pushed it. ALWAYS create tickets for completed work — these track what got done this sprint.
- in_progress: speaker says they're actively working on it, started it, or will handle it with a near-term deadline (e.g., "I'll handle X by Friday" = in_progress, not backlog)
- blocked: the speaker's OWN task is waiting on something/someone else (e.g., "I'm blocked on X", "I'm waiting on Y", "can't start until Z is done")
- backlog: no progress mentioned and no near-term commitment (default)
IMPORTANT: If "I'm blocked on X" — X is a dependency, NOT blocked. X should be backlog or in_progress. Only the speaker's task gets "blocked" status. If Mike says "I'm blocked on the schema, waiting on John" — Mike's task = blocked, schema task = backlog/in_progress.

COMPLETENESS: Extract EVERY actionable task mentioned. Include:
- Completed work (status: done) — track what was accomplished
- In-progress work (status: in_progress)
- Blocked work (status: blocked)
- Planned work (status: backlog)
- Infrastructure/DevOps tasks (CI/CD, Docker, monitoring, backups)
- Documentation tasks (guides, specs, changelogs)
- Business tasks (strategy, analysis, partnerships)
- Design tasks (wireframes, icons, brand guidelines)
Do NOT skip tasks just because they're done or seem minor. Every distinct piece of work = one ticket.

GRANULARITY: Separate tickets for distinct tasks. Break large features into multiple tickets. If someone mentions 3 things they completed, that's 3 done tickets.

FORBIDDEN: "Discuss", "Consider", "Look into", meeting summaries, vague phrases, hypotheticals ("wouldn't it be nice if...")

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
    max_tokens: 8000,
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
Today is ${new Date().toISOString().split('T')[0]}.
Given a transcript and a list of task titles, identify which tasks have explicit deadlines and output them as ISO dates (YYYY-MM-DD).
If a deadline is relative (e.g., "by Friday", "next week"), calculate the actual calendar date based on today's date.
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

export interface SprintSuggestion {
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  ticket_indices: number[];
}

export async function generateSprints(
  tickets: { title: string; status: string; assignee: string | null; due_date: string | null }[]
): Promise<SprintSuggestion[]> {
  const today = new Date().toISOString().split('T')[0];

  const ticketList = tickets.map((t, i) => ({
    index: i,
    title: t.title,
    status: t.status,
    assignee: t.assignee,
    due_date: t.due_date,
  }));

  const response = await groqT2.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a sprint planning assistant. Group meeting tickets into logical sprints.

Today is ${today}. Sprint cycles are typically 1-2 weeks.

RULES:
- Group related tickets together (e.g., backend tasks in one sprint, frontend in another, or by theme)
- Each sprint needs a name (max 4 words), a goal (1 sentence), start_date and end_date (YYYY-MM-DD)
- Sprints should be sequential, not overlapping
- Done tickets should be assigned to a "completed" sprint or the first sprint
- Blocked tickets go in the sprint where their blocker is expected to be resolved
- Every ticket must be assigned to exactly one sprint
- Create 2-4 sprints depending on ticket count and themes
- First sprint starts today

Return ONLY valid JSON: {"sprints": [{"name": "...", "goal": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "ticket_indices": [0, 1, 2]}]}`,
      },
      {
        role: 'user',
        content: `Tickets to group:\n${JSON.stringify(ticketList, null, 2)}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content ?? '';
  const clean = extractJson(raw);

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed.sprints)) throw new Error('sprints must be an array');
    return parsed.sprints.map((s: any) => ({
      name: String(s.name ?? ''),
      goal: String(s.goal ?? ''),
      start_date: String(s.start_date ?? today),
      end_date: String(s.end_date ?? today),
      ticket_indices: Array.isArray(s.ticket_indices)
        ? s.ticket_indices.map((i: any) => Number(i))
        : [],
    }));
  } catch {
    return [];
  }
}
