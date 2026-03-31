import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteLinearIntegration } from '@/lib/services/integrations';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteLinearIntegration(userId);

    return NextResponse.json({ success: true, message: 'Linear disconnected' });
  } catch (error) {
    console.error('Failed to disconnect Linear:', error);
    return NextResponse.json({ error: 'Failed to disconnect Linear' }, { status: 500 });
  }
}
