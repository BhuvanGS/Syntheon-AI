import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteGoogleIntegration } from '@/lib/services/integrations/google';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteGoogleIntegration(userId);

    return NextResponse.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error) {
    console.error('Failed to disconnect Google:', error);
    return NextResponse.json({ error: 'Failed to disconnect Google Calendar' }, { status: 500 });
  }
}
