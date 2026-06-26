import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  tickets as ticketsTable,
  meetings as meetingsTable,
  projects as projectsTable,
  projectMembers as projectMembersTable,
} from '@/db/schema';
import { and, eq, or, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const q = `%${query.toLowerCase()}%`;

    // Search tickets
    const ticketResults = await db
      .select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        status: ticketsTable.status,
      })
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.orgId, orgId),
          or(
            sql`lower(${ticketsTable.title}) like ${q}`,
            sql`lower(${ticketsTable.description}) like ${q}`
          )
        )
      )
      .limit(5);

    // Search meetings
    const meetingResults = await db
      .select({
        id: meetingsTable.id,
        projectName: meetingsTable.projectName,
        platform: meetingsTable.platform,
      })
      .from(meetingsTable)
      .where(
        and(eq(meetingsTable.orgId, orgId), sql`lower(${meetingsTable.projectName}) like ${q}`)
      )
      .limit(3);

    // Search projects (only projects user is member of)
    const projectResults = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
      })
      .from(projectsTable)
      .innerJoin(
        projectMembersTable,
        and(
          eq(projectMembersTable.projectId, projectsTable.id),
          eq(projectMembersTable.userId, userId)
        )
      )
      .where(and(eq(projectsTable.orgId, orgId), sql`lower(${projectsTable.name}) like ${q}`))
      .limit(3);

    const results = [
      ...ticketResults.map((t) => ({
        id: t.id,
        type: 'ticket' as const,
        title: t.title,
        subtitle: t.status?.replace('_', ' '),
      })),
      ...meetingResults.map((m) => ({
        id: m.id,
        type: 'meeting' as const,
        title: m.projectName,
        subtitle: m.platform,
      })),
      ...projectResults.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        subtitle: 'Project',
      })),
    ];

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'no-cache', // Search results should not be cached
        },
      }
    );
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
