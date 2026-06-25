import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getIntegrationStatus, getGoogleTokenForUser } from '@/lib/services/integrations';

export async function GET() {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getIntegrationStatus(userId, orgId);
    // Google Calendar is always user-scoped (personal calendar), not org-shared
    const googleConnected = Boolean(await getGoogleTokenForUser(userId));
    return NextResponse.json({ ...status, googleConnected });
  } catch (error) {
    console.error('Integrations status error:', error);
    return NextResponse.json({ error: 'Failed to fetch integration status' }, { status: 500 });
  }
}
