import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TicketsEntity, MeetingsEntity, ProjectsEntity, ProjectMembersEntity } from '@/db/entities';

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!q || q.length < 1) {
      return NextResponse.json({ tickets: [], meetings: [], projects: [] });
    }

    const [ticketsRes, meetingsRes, projectsRes] = await Promise.all([
      orgId
        ? TicketsEntity.query.byOrg({ orgId }).go()
        : TicketsEntity.query.byUser({ userId }).go(),
      orgId
        ? MeetingsEntity.query.byOrg({ orgId }).go()
        : MeetingsEntity.query.byUser({ userId }).go(),
      orgId
        ? ProjectsEntity.query.byOrg({ orgId }).go()
        : ProjectsEntity.query.byUser({ userId }).go(),
    ]);

    const tickets = (ticketsRes.data ?? [])
      .filter(
        (t: any) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        type: 'ticket',
        status: t.status,
      }));

    const meetings = (meetingsRes.data ?? [])
      .filter(
        (m: any) => m.projectName?.toLowerCase().includes(q) || m.summary?.toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map((m: any) => ({
        id: m.id,
        title: m.projectName,
        type: 'meeting',
        date: m.date,
      }));

    // For projects, also check member projects
    let projectRows = projectsRes.data ?? [];
    if (orgId) {
      const memberRes = await ProjectMembersEntity.query.byOrgUser({ orgId }).go();
      const memberProjectIds = (memberRes.data ?? [])
        .filter((m: any) => m.userId === userId)
        .map((m: any) => m.projectId);

      for (const pid of memberProjectIds) {
        const pRes = await ProjectsEntity.get({ id: pid }).go();
        if (pRes.data && !projectRows.find((p: any) => p.id === pid)) {
          projectRows.push(pRes.data);
        }
      }
    }

    const projects = projectRows
      .filter((p: any) => p.name?.toLowerCase().includes(q))
      .slice(0, 10)
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
