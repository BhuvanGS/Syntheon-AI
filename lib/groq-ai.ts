// lib/groq-ai.ts
// Separate Groq client for Tier 2+ AI features (project health, sprint suggestions, etc.)
// Uses GROQ_T2_KEY for isolated rate limits and cost tracking.
// Falls back to GROQ_API_KEY if GROQ_T2_KEY is not set.
import Groq from 'groq-sdk';

const aiKey = process.env.GROQ_T2_KEY || process.env.GROQ_API_KEY!;

export const groqAI = new Groq({ apiKey: aiKey });

export const AI_MODEL = 'llama-3.3-70b-versatile';

/**
 * Suggest project health status based on project metrics.
 * Returns one of: 'on_track', 'at_risk', 'off_track', 'paused'
 */
export async function suggestProjectHealth(metrics: {
  totalTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  blockedTickets: number;
  overdueTickets: number;
  hasDependencies: boolean;
  daysSinceUpdate: number;
}): Promise<{
  status: 'on_track' | 'at_risk' | 'off_track' | 'paused';
  reason: string;
}> {
  const response = await groqAI.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a project health analyzer. Given project metrics, suggest a health status.
Statuses: on_track (green), at_risk (yellow), off_track (red), paused (gray).
Consider: completion rate, blocked tickets, overdue tickets, inactivity.
Return ONLY valid JSON: {"status": "on_track|at_risk|off_track|paused", "reason": "one sentence explanation"}`,
      },
      {
        role: 'user',
        content: `Project metrics:
- Total tickets: ${metrics.totalTickets}
- Completed: ${metrics.completedTickets}
- In progress: ${metrics.inProgressTickets}
- Blocked: ${metrics.blockedTickets}
- Overdue: ${metrics.overdueTickets}
- Has dependencies: ${metrics.hasDependencies}
- Days since last update: ${metrics.daysSinceUpdate}

Return JSON with status and reason.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 200,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content?.trim() ?? '';
  try {
    const parsed = JSON.parse(raw);
    const validStatuses = ['on_track', 'at_risk', 'off_track', 'paused'];
    const status = validStatuses.includes(parsed.status) ? parsed.status : 'on_track';
    return {
      status: status as 'on_track' | 'at_risk' | 'off_track' | 'paused',
      reason: parsed.reason ?? '',
    };
  } catch {
    return { status: 'on_track', reason: 'Unable to determine project health' };
  }
}

/**
 * Generate a sprint pulse — a short status summary of the sprint.
 */
export async function sprintPulse(metrics: {
  sprintName: string;
  sprintGoal: string;
  startDate: string;
  endDate: string;
  totalTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  blockedTickets: number;
  backlogTickets: number;
  daysRemaining: number;
  daysElapsed: number;
}): Promise<string> {
  const response = await groqAI.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an agile sprint analyzer. Given sprint metrics, write a concise 2-3 sentence status update.
Consider: completion rate, blocked tickets, days remaining vs elapsed, and whether the sprint goal is on track.
Be direct and actionable. Do not use markdown formatting.`,
      },
      {
        role: 'user',
        content: `Sprint: "${metrics.sprintName}"
Goal: ${metrics.sprintGoal || 'Not set'}
Duration: ${metrics.startDate} to ${metrics.endDate}
Days elapsed: ${metrics.daysElapsed} / Days remaining: ${metrics.daysRemaining}
Tickets — Total: ${metrics.totalTickets}, Completed: ${metrics.completedTickets}, In progress: ${metrics.inProgressTickets}, Blocked: ${metrics.blockedTickets}, Backlog: ${metrics.backlogTickets}

Write a 2-3 sentence sprint pulse summary.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 150,
  });

  return response.choices[0].message.content?.trim() ?? 'Unable to generate sprint pulse.';
}

export interface TicketGroupSuggestion {
  name: string;
  ticketIds: string[];
  reason: string;
}

/**
 * Suggest ticket groupings (epics) based on ticket titles and descriptions.
 * The AI analyzes tickets and proposes logical groups.
 */
export async function suggestTicketGroupings(
  tickets: { id: string; title: string; description: string }[]
): Promise<TicketGroupSuggestion[]> {
  if (tickets.length < 3) return [];

  const meaningful = tickets.filter((t) => {
    const trimmed = t.title.trim();
    if (trimmed.length < 3) return false;
    if (/^\d+\.?$/.test(trimmed)) return false;
    return true;
  });
  if (meaningful.length < 3) return [];

  const response = await groqAI.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an agile project planner. Given a list of tickets, suggest logical groupings (epics).
Group related tickets together based on their titles and descriptions.
Each group should have a clear, descriptive name and contain 2-8 tickets.
Only group tickets that are genuinely related — don't force groupings.
Return ONLY valid JSON:
{
  "groups": [
    {
      "name": "Short descriptive epic name",
      "ticketIds": ["id1", "id2"],
      "reason": "One sentence explaining why these belong together"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Suggest ticket groupings for these tickets:\n\n${JSON.stringify(
          meaningful.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description?.slice(0, 200) ?? '',
          })),
          null,
          2
        )}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content?.trim() ?? '';
  try {
    const parsed = JSON.parse(raw);
    const groups = Array.isArray(parsed?.groups) ? parsed.groups : [];
    const validIds = new Set(meaningful.map((t) => t.id));

    return groups
      .filter((g: any) => g?.name && Array.isArray(g?.ticketIds) && g.ticketIds.length >= 2)
      .map((g: any) => ({
        name: String(g.name).slice(0, 100),
        ticketIds: g.ticketIds.filter((id: string) => validIds.has(id)),
        reason: typeof g.reason === 'string' ? g.reason : '',
      }))
      .filter((g: TicketGroupSuggestion) => g.ticketIds.length >= 2);
  } catch {
    console.error('[Groq AI] Failed to parse ticket grouping response');
    return [];
  }
}
