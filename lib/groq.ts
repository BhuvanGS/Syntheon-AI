// lib/groq.ts
import { randomUUID } from 'crypto';
import Groq from 'groq-sdk';

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
        content: `You are an AI that extracts structured Jira-like tickets from meeting transcripts.
Extract every actionable item discussed and return tickets with a clear title, a concise description, a status, and optional assignee info.
Use the following statuses only: backlog, in_progress, done, blocked.
If status is not obvious, use backlog.
Assignee should be null unless the transcript clearly names a person.
Also generate a short human-readable title for this meeting (max 5 words).
Respond ONLY with valid JSON. No markdown, no explanation, no code fences.`,
      },
      {
        role: 'user',
        content: `Extract tickets and generate a title from this transcript:

${transcript}

Return JSON in this exact format:
{
  "title": "Calculator App Discussion",
  "tickets": [
    {
      "id": "${meetingId}-ticket-1",
      "title": "short clear title",
      "description": "concise description of the task",
      "status": "backlog",
      "assignee": null,
      "assignee_user_id": null,
      "project_id": null,
      "meeting_id": "${meetingId}",
      "dependency_ticket_id": null
    }
  ]
}

Return ONLY the JSON object, nothing else.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const raw = response.choices[0].message.content?.trim() ?? '';
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed.tickets)) throw new Error('tickets must be an array');
    return {
      title: parsed.title || 'Untitled Meeting',
      tickets: parsed.tickets.map((ticket: any) => ({
        id: randomUUID(),
        title: ticket.title,
        description: ticket.description ?? '',
        status: normalizeTicketStatus(ticket.status),
        assignee: ticket.assignee ?? null,
        assignee_user_id: ticket.assignee_user_id ?? null,
        project_id: ticket.project_id ?? null,
        meeting_id: ticket.meeting_id ?? meetingId,
        dependency_ticket_id: ticket.dependency_ticket_id ?? null,
      })) as TicketBlock[],
    };
  } catch (err) {
    console.error('Failed to parse Groq response:', raw);
    throw new Error('Groq returned invalid JSON');
  }
}
