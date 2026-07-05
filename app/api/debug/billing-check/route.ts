import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const session = await auth();

  if (!session.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { has, userId, orgId } = session;

  const checks: Record<string, boolean> = {};

  const planKeys = [
    'user_free',
    'user_pro',
    'user_max',
    'org:org_free',
    'org:org_pro',
    'org:org_max',
  ];

  for (const key of planKeys) {
    try {
      checks[`plan:${key}`] = has?.({ plan: key }) ?? false;
    } catch {
      checks[`plan:${key}`] = false;
    }
  }

  const featureKeys = [
    'basic_meetings',
    'extended_meetings',
    'analytics',
    'dependencies',
    'sprint_stones',
    'roadmap',
    'api_access',
    'sso',
    'audit_logs',
  ];

  for (const key of featureKeys) {
    try {
      checks[`feature:${key}`] = has?.({ feature: key }) ?? false;
    } catch {
      checks[`feature:${key}`] = false;
    }
  }

  return NextResponse.json({
    userId,
    orgId,
    checks,
  });
}
