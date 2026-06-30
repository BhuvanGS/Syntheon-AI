import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET } from '@/lib/s3';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    const filename = searchParams.get('filename') || 'download';

    if (!path) return NextResponse.json({ error: 'path is required' }, { status: 400 });
    if (!path.startsWith(`${userId}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = await s3Client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: path }));

    if (!response.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const body = await response.Body.transformToByteArray();

    const safeFilename = filename
      .replace(/[^\x00-\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const headers = new Headers();
    headers.set('Content-Type', response.ContentType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Content-Length', String(body.byteLength));

    return new NextResponse(Buffer.from(body), { headers });
  } catch (err) {
    console.error('GET /download error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
