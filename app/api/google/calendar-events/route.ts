import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getValidGoogleAccessToken } from '@/lib/services/integrations/google';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    const { token, error } = await getValidGoogleAccessToken(session.userId);
    if (!token) {
      return NextResponse.json({ error: error ?? 'Google not connected' }, { status: 403 });
    }

    const params = new URLSearchParams({
      maxResults: '250',
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (timeMin) params.set('timeMin', timeMin);
    if (timeMax) params.set('timeMax', timeMax);

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('Google Calendar API error:', data);
      return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 502 });
    }

    const data = await res.json();
    const events = (data.items ?? []).map((item: any) => ({
      id: item.id,
      title: item.summary || 'Untitled event',
      start: item.start?.dateTime || item.start?.date || null,
      end: item.end?.dateTime || item.end?.date || null,
      hangoutLink: item.hangoutLink || null,
      attendees: (item.attendees ?? []).map((a: any) => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus,
      })),
      location: item.location || null,
    }));

    return NextResponse.json({ events }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
