import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET } from '@/lib/s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const maxBodyLength = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const ticketId = formData.get('ticketId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ticketId) return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    const headerBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const hex = Array.from(headerBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

    const BLOCKED_MAGIC: Record<string, string> = {
      '3c21444f4354': 'html',
      '3c68746d6c': 'html',
      '3c736372697': 'script',
      '23212f62696e': 'shell',
      '3c3f706870': 'php',
    };
    for (const [magic, label] of Object.entries(BLOCKED_MAGIC)) {
      if (hex.startsWith(magic)) {
        return NextResponse.json({ error: `${label} files are not allowed` }, { status: 400 });
      }
    }

    const ALLOWED_MAGIC_PREFIXES = [
      'ffd8ff', '89504e47', '47494638', '52494646', '25504446',
      '494433', '1a45dfa3', '000000', '66747970', 'fffb', '4f676753',
    ];

    const ALLOWED_TEXT_TYPES = ['text/plain', 'text/csv', 'text/markdown'];
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    const ALLOWED_BINARY_TYPES = [
      'application/pdf', 'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/ogg', 'audio/wav',
    ];

    const claimedType = file.type.toLowerCase();
    const isMagicSafe = ALLOWED_MAGIC_PREFIXES.some((m) => hex.startsWith(m));
    const isMimeSafe =
      ALLOWED_TEXT_TYPES.includes(claimedType) ||
      ALLOWED_IMAGE_TYPES.includes(claimedType) ||
      ALLOWED_BINARY_TYPES.some((t) => claimedType === t);

    if (!isMagicSafe && !ALLOWED_TEXT_TYPES.includes(claimedType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }
    if (!isMimeSafe) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${ticketId}/${timestamp}_${sanitizedName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: filePath,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const fileUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${filePath}`;

    return NextResponse.json({
      filePath,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
      filename: file.name,
    });
  } catch (err) {
    console.error('POST /upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
