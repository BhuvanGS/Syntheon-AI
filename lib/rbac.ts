import { auth } from '@clerk/nextjs/server';
import { isProjectMember, getProjectById, getProjectsForMember } from '@/lib/db';
import { ProjectMembersEntity } from '@/db/entities';

export type OrgRole = 'org:admin' | 'org:member' | null;

export interface AuthContext {
  userId: string;
  orgId: string;
  orgRole: OrgRole;
}

export async function requireAuth(): Promise<AuthContext | null> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) return null;
  return { userId, orgId, orgRole: (orgRole as OrgRole) ?? null };
}

export function isOrgAdmin(ctx: AuthContext): boolean {
  return ctx.orgRole === 'org:admin';
}

/**
 * Org admin or project member may access project-scoped resources.
 * Also verifies the project belongs to the caller's active org.
 */
export async function requireProjectAccess(ctx: AuthContext, projectId: string): Promise<boolean> {
  return canManageProject(ctx, projectId);
}

export async function canManageProject(ctx: AuthContext, projectId: string): Promise<boolean> {
  const project = await getProjectById(projectId);
  if (!project || project.org_id !== ctx.orgId) return false;
  if (isOrgAdmin(ctx)) return true;
  return isProjectMember(projectId, ctx.userId);
}

export async function canAdminProject(ctx: AuthContext, projectId: string): Promise<boolean> {
  const project = await getProjectById(projectId);
  if (!project || project.org_id !== ctx.orgId) return false;
  if (isOrgAdmin(ctx)) return true;
  const res = await ProjectMembersEntity.get({ projectId, userId: ctx.userId }).go();
  return res.data?.role === 'admin' || res.data?.role === 'manager';
}

export async function isProjectManager(ctx: AuthContext, projectId: string): Promise<boolean> {
  return canAdminProject(ctx, projectId);
}

/** Accessible project ids for list filtering. `'all'` means org admin. */
export async function getAccessibleProjectIds(ctx: AuthContext): Promise<string[] | 'all'> {
  if (isOrgAdmin(ctx)) return 'all';
  const projects = await getProjectsForMember(ctx.orgId, ctx.userId);
  return projects.map((p) => p.id);
}

/**
 * Resource with optional projectId: require membership when projectId is set;
 * otherwise keep org-scoped ownership (caller already checked orgId).
 */
export async function canAccessProjectResource(
  ctx: AuthContext,
  projectId: string | null | undefined
): Promise<boolean> {
  if (!projectId) return true;
  return requireProjectAccess(ctx, projectId);
}
