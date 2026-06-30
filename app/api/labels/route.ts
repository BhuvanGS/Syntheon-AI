import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getLabelsByOrg, createLabel } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const { orgId } = await auth();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const labels = await getLabelsByOrg(orgId);
    return NextResponse.json({ labels }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch labels:', error);
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const color = typeof body?.color === 'string' ? body.color : '#6b7280';

    if (!name) {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    const id = randomUUID();
    const label = await createLabel(id, orgId, name, color);
    return NextResponse.json({ label }, { status: 201 });
  } catch (error) {
    console.error('Failed to create label:', error);
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
  }
}
