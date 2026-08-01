import { NextRequest, NextResponse } from 'next/server';
import { sprintPulse } from '@/lib/groq-ai';
import { getSprintsByProject } from '@/lib/db';
import { aiRateLimit } from '@/lib/rate-limit';
import { requireAuth, requireProjectAccess } from '@/lib/rbac';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sprintId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limited = await aiRateLimit(req, ctx.userId);
    if (limited) return limited;

    const { id: projectId, sprintId } = await params;
    if (!(await requireProjectAccess(ctx, projectId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();

    const {
      sprintName,
      sprintGoal,
      startDate,
      endDate,
      totalTickets,
      completedTickets,
      inProgressTickets,
      blockedTickets,
      backlogTickets,
      daysRemaining,
      daysElapsed,
    } = body;

    if (!sprintName || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing sprint data' }, { status: 400 });
    }

    const pulse = await sprintPulse({
      sprintName,
      sprintGoal: sprintGoal || '',
      startDate,
      endDate,
      totalTickets: totalTickets ?? 0,
      completedTickets: completedTickets ?? 0,
      inProgressTickets: inProgressTickets ?? 0,
      blockedTickets: blockedTickets ?? 0,
      backlogTickets: backlogTickets ?? 0,
      daysRemaining: daysRemaining ?? 0,
      daysElapsed: daysElapsed ?? 0,
    });

    return NextResponse.json({ pulse });
  } catch (error) {
    console.error('Failed to generate sprint pulse:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
