import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '@/lib/s3';
import { getTicketById } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { filename, ticketId, fileSize, fileType } = body;

    if (!filename || !ticketId) {
      return NextResponse.json({ error: 'filename and ticketId required' }, { status: 400 });
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket || (orgId && ticket.org_id !== orgId)) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const maxSize = 15 * 1024 * 1024;
    if (fileSize > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${ticketId}/${timestamp}_${sanitizedName}`;

    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: filePath,
        ContentType: fileType,
      }),
      { expiresIn: 60 }
    );

    return NextResponse.json({
      signedUrl,
      filePath,
    });
  } catch (err) {
    console.error('POST /upload/presigned error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
