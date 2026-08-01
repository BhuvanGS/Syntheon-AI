// app/api/tickets/stale/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStaleTickets } from '@/lib/db';
import { requireAuth, requireProjectAccess, getAccessibleProjectIds, isOrgAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const staleDays = parseInt(searchParams.get('staleDays') || '7', 10);

    if (projectId && !(await requireProjectAccess(ctx, projectId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let staleTickets = await getStaleTickets(ctx.orgId, projectId, staleDays);
    if (!projectId && !isOrgAdmin(ctx)) {
      const allowed = await getAccessibleProjectIds(ctx);
      const allowedSet = new Set(allowed === 'all' ? [] : allowed);
      staleTickets = staleTickets.filter((t) => t.projectId && allowedSet.has(t.projectId));
    }

    return NextResponse.json(
      { tickets: staleTickets, staleDays },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch stale tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch stale tickets' }, { status: 500 });
  }
}
