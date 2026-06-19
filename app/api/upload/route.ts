import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Body size limit for this route
export const bodyParser = {
  sizeLimit: '15mb',
};

export const maxBodyLength = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const ticketId = formData.get('ticketId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    // Validate file size (max 15MB)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    // Read first 8 bytes for magic-byte validation (cannot trust client MIME type)
    const headerBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const hex = Array.from(headerBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Blocked types regardless of claimed MIME: HTML, JS, SVG-with-script, PHP, shell
    const BLOCKED_MAGIC: Record<string, string> = {
      '3c21444f4354': 'html', // <!DOCT
      '3c68746d6c': 'html', // <html
      '3c736372697': 'script', // <scrip
      '23212f62696e': 'shell', // #!/bin
      '3c3f706870': 'php', // <?php
    };
    for (const [magic, label] of Object.entries(BLOCKED_MAGIC)) {
      if (hex.startsWith(magic)) {
        return NextResponse.json({ error: `${label} files are not allowed` }, { status: 400 });
      }
    }

    // Known safe magic bytes — at least one must match
    const ALLOWED_MAGIC_PREFIXES = [
      'ffd8ff', // JPEG
      '89504e47', // PNG
      '47494638', // GIF
      '52494646', // WEBP (RIFF)
      '25504446', // PDF
      '494433', // MP3
      '1a45dfa3', // WebM/MKV
      '000000', // MP4/MOV (ftyp box)
      '66747970', // MP4 (ftyp)
      'fffb', // MP3 no ID3
      '4f676753', // OGG
    ];

    // Text/image types without a distinctive header — allow by safe MIME only
    const ALLOWED_TEXT_TYPES = ['text/plain', 'text/csv', 'text/markdown'];
    const ALLOWED_IMAGE_TYPES = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
    ];
    const ALLOWED_BINARY_TYPES = [
      'application/pdf',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
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

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${ticketId}/${timestamp}_${sanitizedName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('ticket-attachments')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload] Storage upload error:', uploadError.message);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('ticket-attachments')
      .getPublicUrl(filePath);

    return NextResponse.json({
      filePath,
      fileUrl: urlData.publicUrl,
      fileSize: file.size,
      fileType: file.type,
      filename: file.name,
    });
  } catch (err) {
    console.error('POST /upload error:', err);

    // Check for body size limit exceeded
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (
      errorMessage.includes('exceeded') ||
      errorMessage.includes('body size') ||
      errorMessage.includes('maximum') ||
      errorMessage.includes('payload too large') ||
      errorMessage.includes('Request body') ||
      errorMessage.includes('10MB')
    ) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 413 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
