// app/api/meetings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMeetingsPaginated } from '@/lib/db';
import { requireAuth, requireProjectAccess, getAccessibleProjectIds, isOrgAdmin } from '@/lib/rbac';

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 50), 100);
    const offset = parsePositiveInt(searchParams.get('offset'), 0);

    if (projectId) {
      if (!(await requireProjectAccess(ctx, projectId))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const result = await getMeetingsPaginated(ctx.orgId, { projectId, limit, offset });

    // Non-admins without a project filter must not see other projects' meetings
    let meetings = result.meetings;
    let total = result.total;
    if (!projectId && !isOrgAdmin(ctx)) {
      const allowed = await getAccessibleProjectIds(ctx);
      const allowedSet = new Set(allowed === 'all' ? [] : allowed);
      meetings = meetings.filter(
        (m) =>
          (m.projectId && allowedSet.has(m.projectId)) || (!m.projectId && m.user_id === ctx.userId)
      );
      total = meetings.length;
    }

    return NextResponse.json(
      {
        meetings,
        total,
        limit,
        offset,
        hasMore: offset + meetings.length < total,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}
