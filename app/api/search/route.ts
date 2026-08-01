import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TicketsEntity, MeetingsEntity, ProjectsEntity, ProjectMembersEntity } from '@/db/entities';
import { requireAuth, isOrgAdmin, getAccessibleProjectIds } from '@/lib/rbac';

/** Cap partition reads so Lambda memory stays bounded. */
const SEARCH_SCAN_LIMIT = 80;
const SEARCH_RESULT_LIMIT = 8;

const TICKET_ATTRS = ['id', 'title', 'description', 'status', 'projectId', 'orgId'] as const;
const MEETING_ATTRS = [
  'id',
  'projectName',
  'summary',
  'date',
  'projectId',
  'orgId',
  'userId',
] as const;
const PROJECT_ATTRS = ['id', 'name', 'orgId'] as const;

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) {
      // Fall back: allow user-scoped search without org (rare)
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.json({ tickets: [], meetings: [], projects: [] });
    }

    const { userId, orgId } = ctx;
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!q || q.length < 1) {
      return NextResponse.json({ tickets: [], meetings: [], projects: [] });
    }

    const accessible = await getAccessibleProjectIds(ctx);
    const allowedProjectIds = accessible === 'all' ? null : new Set(accessible);

    const [ticketsRes, meetingsRes, projectsRes] = await Promise.all([
      TicketsEntity.query.byOrg({ orgId }).go({
        limit: SEARCH_SCAN_LIMIT,
        attributes: [...TICKET_ATTRS],
        order: 'desc',
      }),
      MeetingsEntity.query.byOrg({ orgId }).go({
        limit: SEARCH_SCAN_LIMIT,
        attributes: [...MEETING_ATTRS],
        order: 'desc',
      }),
      isOrgAdmin(ctx)
        ? ProjectsEntity.query.byOrg({ orgId }).go({
            limit: SEARCH_SCAN_LIMIT,
            attributes: [...PROJECT_ATTRS],
          })
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const tickets = (ticketsRes.data ?? [])
      .filter((t: any) => {
        if (allowedProjectIds) {
          if (t.projectId && !allowedProjectIds.has(t.projectId)) return false;
          if (!t.projectId) return false;
        }
        return t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
      })
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        type: 'ticket',
        status: t.status,
      }));

    const meetings = (meetingsRes.data ?? [])
      .filter((m: any) => {
        if (allowedProjectIds) {
          if (m.projectId && !allowedProjectIds.has(m.projectId)) return false;
          if (!m.projectId && m.userId !== userId) return false;
        }
        return m.projectName?.toLowerCase().includes(q) || m.summary?.toLowerCase().includes(q);
      })
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((m: any) => ({
        id: m.id,
        title: m.projectName,
        type: 'meeting',
        date: m.date,
      }));

    let projectRows = projectsRes.data ?? [];
    if (!isOrgAdmin(ctx)) {
      const memberRes = await ProjectMembersEntity.query.byOrgUser({ orgId }).go({
        limit: SEARCH_SCAN_LIMIT,
      });
      const memberProjectIds = (memberRes.data ?? [])
        .filter((m: any) => m.userId === userId)
        .map((m: any) => m.projectId)
        .slice(0, SEARCH_SCAN_LIMIT);

      const fetched = await Promise.all(
        memberProjectIds.map((pid: string) =>
          ProjectsEntity.get({ id: pid }).go({ attributes: [...PROJECT_ATTRS] })
        )
      );
      projectRows = fetched.map((r) => r.data).filter(Boolean);
    }

    const projects = projectRows
      .filter((p: any) => p.name?.toLowerCase().includes(q))
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((p: any) => ({
        id: p.id,
        title: p.name,
        type: 'project',
      }));

    return NextResponse.json({ tickets, meetings, projects });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
