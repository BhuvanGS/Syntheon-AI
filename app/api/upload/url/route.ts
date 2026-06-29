import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { S3_BUCKET } from '@/lib/s3';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) return NextResponse.json({ error: 'path is required' }, { status: 400 });
    if (!path.startsWith(`${userId}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const region = process.env.AWS_REGION || 'ap-south-1';
    const fileUrl = `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${path}`;

    return NextResponse.json({ data: { publicUrl: fileUrl } });
  } catch (err) {
    console.error('GET /upload/url error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
