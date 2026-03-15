import { NextResponse } from 'next/server';
import { loadDB } from '@/lib/db';

export async function GET() {
  try {
    const db = loadDB();
    return NextResponse.json(db.specs);
  } catch (error) {
    console.error('Failed to fetch specs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specs' },
      { status: 500 }
    );
  }
}