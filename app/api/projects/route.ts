// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  getProjectsByOrg,
  getProjectsForMember,
  getProjectByMeetingId,
  saveProjectForOrg,
  addProjectMember,
} from '@/lib/db';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';
import { ensureUser } from '@/lib/ensureUser';
import { currentUser } from '@clerk/nextjs/server';
import { broadcastToOrg } from '@/lib/event-bus';

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId, orgId } = ctx;

    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    if (meetingId) {
      const project = await getProjectByMeetingId(meetingId);
      if (!project || project.org_id !== orgId) {
        return NextResponse.json(null);
      }
      if (!isOrgAdmin(ctx)) {
        const memberProjects = await getProjectsForMember(orgId, userId);
        const hasAccess = memberProjects.some((entry) => entry.id === project.id);
        return NextResponse.json(hasAccess ? project : null);
      }
      return NextResponse.json(project ?? null);
    }

    const projects = isOrgAdmin(ctx)
      ? await getProjectsByOrg(orgId)
      : await getProjectsForMember(orgId, userId);
    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isOrgAdmin(ctx)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { userId, orgId } = ctx;

    // Ensure user exists in local DB before FK-referenced inserts
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? '';
      await ensureUser(userId, email);
    }

    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const context = String(body?.context ?? '').trim();
    const deployUrl = String(body?.deployUrl ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const projectId = `project-${randomUUID()}`;
    const repoLabel = `syntheon/${
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'project'
    }`;

    await saveProjectForOrg({
      id: projectId,
      user_id: userId,
      org_id: orgId,
      name,
      repo: repoLabel,
      deployUrl: deployUrl || undefined,
      branchBase: body?.branchBase || 'main',
      meetings: [],
      ticketIds: [],
      files: [],
      context,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Creator is auto-added as project admin
    await addProjectMember(projectId, orgId, userId, 'admin');

    broadcastToOrg(orgId, { type: 'project_created', payload: { projectId, name } });

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        name,
        repo: repoLabel,
        deployUrl: deployUrl || null,
        branchBase: body?.branchBase || 'main',
        meetings: [],
        ticketIds: [],
        files: [],
        context,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
