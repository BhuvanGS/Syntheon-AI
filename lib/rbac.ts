import { auth } from '@clerk/nextjs/server';
import { isProjectMember, getProjectById } from '@/lib/db';

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

export async function canManageProject(ctx: AuthContext, projectId: string): Promise<boolean> {
  if (isOrgAdmin(ctx)) return true;
  const project = await getProjectById(projectId);
  if (!project || project.org_id !== ctx.orgId) return false;
  const member = await isProjectMember(projectId, ctx.userId);
  return member;
}

export async function canAdminProject(ctx: AuthContext, projectId: string): Promise<boolean> {
  if (isOrgAdmin(ctx)) return true;
  const { supabaseAdmin } = await import('@/lib/supabase');
  const { data } = await supabaseAdmin
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', ctx.userId)
    .single();
  return data?.role === 'admin';
}
