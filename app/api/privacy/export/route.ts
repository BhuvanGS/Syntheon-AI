import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConsentRecordsEntity, MeetingsEntity, TicketsEntity, UsersEntity } from '@/db/entities';
import { getDeletionRequestsByUser } from '@/lib/privacy-deletion';

export async function POST() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;

  try {
    const [
      profileRes,
      meetingsRes,
      createdTicketsRes,
      assignedTicketsRes,
      consentRes,
      deletionRequests,
    ] = await Promise.all([
      UsersEntity.get({ id: userId }).go(),
      MeetingsEntity.query.byUser({ userId }).go(),
      TicketsEntity.query.byUser({ userId }).go(),
      TicketsEntity.query.byAssignee({ assigneeUserId: userId }).go(),
      ConsentRecordsEntity.query.byUser({ userId }).go(),
      getDeletionRequestsByUser(userId),
    ]);

    const ticketMap = new Map<string, unknown>();
    for (const ticket of [...(createdTicketsRes.data ?? []), ...(assignedTicketsRes.data ?? [])]) {
      if (ticket?.id) {
        ticketMap.set(ticket.id, ticket);
      }
    }

    const exportedAt = new Date().toISOString();
    const dateStamp = exportedAt.slice(0, 10);

    const payload = {
      exportedAt,
      profile: profileRes.data ?? null,
      meetings: meetingsRes.data ?? [],
      tickets: Array.from(ticketMap.values()),
      consentRecords: consentRes.data ?? [],
      deletionRequests,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="syntheon-data-export-${dateStamp}.json"`,
      },
    });
  } catch (error) {
    console.error('[privacy/export] Failed to build export:', error);
    return NextResponse.json({ error: 'Failed to export personal data' }, { status: 500 });
  }
}
