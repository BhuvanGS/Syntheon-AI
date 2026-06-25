import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGoogleTokenForUser } from '@/lib/services/integrations/read';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { title, description, startTime, endTime, projectId } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startTime, endTime' },
        { status: 400 }
      );
    }

    // Always use the user's own Google token — never org-scoped.
    // Each user connects their own Google Calendar and creates events there.
    const accessToken = await getGoogleTokenForUser(session.userId);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar not connected. Please connect your Google account in Settings.' },
        { status: 403 }
      );
    }

    // Create Google Calendar event with Google Meet
    const eventResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title,
          description: description || '',
          start: {
            dateTime: startTime,
            timeZone: 'UTC',
          },
          end: {
            dateTime: endTime,
            timeZone: 'UTC',
          },
          conferenceData: {
            createRequest: {
              requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      }
    );

    const eventData = await eventResponse.json();

    if (!eventResponse.ok) {
      console.error('Google Calendar API error:', eventData);
      return NextResponse.json(
        { error: eventData.error?.message || 'Failed to create Google Calendar event' },
        { status: 500 }
      );
    }

    const meetUrl = eventData.conferenceData?.entryPoints?.[0]?.uri || null;
    const eventId = eventData.id;

    if (!meetUrl) {
      return NextResponse.json(
        { error: 'Event created but no Meet link was generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      meetUrl,
      eventId,
      htmlLink: eventData.htmlLink,
    });
  } catch (error) {
    console.error('Create Google Meet error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
