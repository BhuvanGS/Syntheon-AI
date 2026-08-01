import { MeetingsEntity, SpecsEntity } from '@/db/entities';
import { broadcastToOrg } from '@/lib/event-bus';
import type { Meeting, SpecBlock } from './types';
import { entityToMeeting, entityToMeetingSummary, entityToSpec } from './mappers';

// ─── Meetings ───────────────────────────────────────────────────
export async function saveMeeting(meeting: Meeting): Promise<void> {
  await MeetingsEntity.create({
    id: meeting.id,
    userId: meeting.user_id ?? undefined,
    orgId: meeting.org_id ?? undefined,
    projectId: meeting.projectId ?? undefined,
    projectName: meeting.projectName,
    meetingId: meeting.meetingId,
    meetingUrl: meeting.meeting_url ?? undefined,
    platform: meeting.platform,
    transcript: meeting.transcript ?? '',
    specsDetected: meeting.specsDetected,
    status: meeting.status,
    botId: meeting.botId ?? undefined,
    branchName: meeting.branchName ?? undefined,
    deployUrl: meeting.deployUrl ?? undefined,
    filePath: meeting.filePath ?? '',
    date: meeting.date,
  }).go();
}

export async function getMeetings(userId: string): Promise<Meeting[]> {
  const res = await MeetingsEntity.query.byUser({ userId }).go({
    attributes: [
      'id',
      'userId',
      'orgId',
      'projectId',
      'projectName',
      'meetingId',
      'meetingUrl',
      'platform',
      'specsDetected',
      'status',
      'botId',
      'branchName',
      'deployUrl',
      'date',
      'createdAt',
      'updatedAt',
    ],
  });
  return (res.data ?? [])
    .map(entityToMeetingSummary)
    .sort((a: Meeting, b: Meeting) => b.date.localeCompare(a.date));
}

export async function getMeetingById(id: string): Promise<Meeting | undefined> {
  const res = await MeetingsEntity.get({ id }).go();
  return res.data ? entityToMeeting(res.data) : undefined;
}

export async function getMeetingByBotId(botId: string): Promise<Meeting | undefined> {
  const res = await MeetingsEntity.query.byBot({ botId }).go();
  return res.data?.[0] ? entityToMeeting(res.data[0]) : undefined;
}

export async function updateMeetingStatus(id: string, status: Meeting['status']): Promise<void> {
  await MeetingsEntity.update({ id }).set({ status, updatedAt: new Date().toISOString() }).go();
  const meeting = await getMeetingById(id);
  if (meeting?.org_id) {
    broadcastToOrg(meeting.org_id, {
      type: 'meeting_status_changed',
      payload: { meetingId: id, status },
    });
  }
}

export async function updateMeetingSpecs(
  id: string,
  transcript: string,
  specsDetected: number
): Promise<void> {
  await MeetingsEntity.update({ id })
    .set({ transcript, specsDetected, status: 'completed', updatedAt: new Date().toISOString() })
    .go();
}

export async function updateMeetingBranch(id: string, branchName: string): Promise<void> {
  await MeetingsEntity.update({ id }).set({ branchName, updatedAt: new Date().toISOString() }).go();
}

export async function updateMeetingDeployUrl(id: string, deployUrl: string): Promise<void> {
  await MeetingsEntity.update({ id }).set({ deployUrl, updatedAt: new Date().toISOString() }).go();
}

export async function updateMeetingName(id: string, projectName: string): Promise<void> {
  await MeetingsEntity.update({ id })
    .set({ projectName, updatedAt: new Date().toISOString() })
    .go();
}

export async function updateMeetingSummary(id: string, summary: string): Promise<void> {
  await MeetingsEntity.update({ id }).set({ summary, updatedAt: new Date().toISOString() }).go();
}

export async function deleteMeeting(id: string): Promise<void> {
  await MeetingsEntity.delete({ id }).go();
}

export async function getActiveMeetingByUrl(meetingUrl: string, userId: string) {
  try {
    const res = await MeetingsEntity.query.byUser({ userId }).go();
    const found = (res.data ?? []).find(
      (m: any) => m.meetingUrl === meetingUrl && m.status === 'processing'
    );
    return found ?? null;
  } catch (error) {
    console.error('Error fetching active meeting:', error);
    return null;
  }
}

export async function getRecentMeetingByUrl(meetingUrl: string, userId: string) {
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
  try {
    const res = await MeetingsEntity.query.byUser({ userId }).go();
    const found = (res.data ?? []).find(
      (m: any) => m.meetingUrl === meetingUrl && m.date >= fiveSecondsAgo
    );
    return found ?? null;
  } catch (error) {
    console.error('Error checking recent meeting:', error);
    return null;
  }
}

// ─── Specs ──────────────────────────────────────────────────────
export async function saveSpecs(specsList: SpecBlock[]): Promise<void> {
  if (specsList.length === 0) return;
  for (const s of specsList) {
    await SpecsEntity.create({
      id: s.id,
      userId: s.user_id ?? undefined,
      meetingId: s.meeting_id,
      projectId: s.projectId ?? undefined,
      title: s.title,
      type: s.type,
      confidence: s.confidence,
      note: s.note ?? undefined,
      timestamp: s.timestamp,
    }).go();
  }
}

export async function getSpecsByMeetingId(meetingId: string): Promise<SpecBlock[]> {
  const res = await SpecsEntity.query.byMeeting({ meetingId }).go();
  return (res.data ?? []).map(entityToSpec);
}

export async function getSpecsByProjectId(projectId: string): Promise<SpecBlock[]> {
  const res = await SpecsEntity.query.byProject({ projectId }).go();
  return (res.data ?? []).map(entityToSpec);
}

export async function getAllSpecs(userId: string): Promise<SpecBlock[]> {
  const res = await SpecsEntity.query.byUser({ userId }).go();
  return (res.data ?? [])
    .map(entityToSpec)
    .sort((a: SpecBlock, b: SpecBlock) => b.timestamp.localeCompare(a.timestamp));
}

export async function updateSpecNote(specId: string, note: string): Promise<void> {
  await SpecsEntity.update({ id: specId }).set({ note, updatedAt: new Date().toISOString() }).go();
}

export async function deleteSpecsByMeetingId(meetingId: string): Promise<void> {
  const res = await SpecsEntity.query.byMeeting({ meetingId }).go();
  for (const spec of res.data ?? []) {
    await SpecsEntity.delete({ id: spec.id }).go();
  }
}

const MEETING_LIST_ATTRIBUTES = [
  'id',
  'userId',
  'orgId',
  'projectId',
  'projectName',
  'meetingId',
  'meetingUrl',
  'platform',
  'specsDetected',
  'status',
  'botId',
  'branchName',
  'deployUrl',
  'date',
  'createdAt',
  'updatedAt',
] as const;

export async function getMeetingsPaginated(
  orgId: string,
  options: { projectId?: string | null; limit?: number; offset?: number } = {}
): Promise<{ meetings: Meeting[]; total: number }> {
  const { projectId, limit = 50, offset = 0 } = options;
  const fetchLimit = Math.min(offset + limit, 500);

  const res = projectId
    ? await MeetingsEntity.query.byProject({ projectId }).go({
        limit: fetchLimit,
        order: 'desc',
        attributes: [...MEETING_LIST_ATTRIBUTES],
      })
    : await MeetingsEntity.query.byOrg({ orgId }).go({
        limit: fetchLimit,
        order: 'desc',
        attributes: [...MEETING_LIST_ATTRIBUTES],
      });

  let meetings = (res.data ?? []).map(entityToMeetingSummary);
  if (orgId) meetings = meetings.filter((m: Meeting) => m.org_id === orgId);
  meetings.sort((a: Meeting, b: Meeting) => b.date.localeCompare(a.date));
  const page = meetings.slice(offset, offset + limit);
  const total = res.cursor ? offset + page.length + 1 : meetings.length;
  return { meetings: page, total };
}

/** Count org meetings on/after `sinceIso` without loading transcripts. Stops early at `cap`. */
export async function countMeetingsSince(
  orgId: string,
  sinceIso: string,
  cap = 100
): Promise<number> {
  let count = 0;
  let cursor: string | null | undefined = undefined;
  do {
    const res: { data?: any[]; cursor?: string | null } = await MeetingsEntity.query
      .byOrg({ orgId })
      .gte({ date: sinceIso })
      .go({
        limit: Math.min(50, cap - count + 1),
        cursor: cursor ?? undefined,
        attributes: ['id', 'date'],
        order: 'asc',
      });
    count += (res.data ?? []).length;
    cursor = res.cursor;
  } while (cursor && count <= cap);
  return count;
}

export async function saveMeetingForOrg(meeting: Meeting & { org_id: string }): Promise<void> {
  await MeetingsEntity.create({
    id: meeting.id,
    userId: meeting.user_id ?? undefined,
    orgId: meeting.org_id,
    projectId: meeting.projectId ?? undefined,
    projectName: meeting.projectName,
    meetingId: meeting.meetingId,
    meetingUrl: meeting.meeting_url ?? undefined,
    platform: meeting.platform,
    transcript: meeting.transcript ?? '',
    specsDetected: meeting.specsDetected,
    status: meeting.status,
    botId: meeting.botId ?? undefined,
    branchName: meeting.branchName ?? undefined,
    deployUrl: meeting.deployUrl ?? undefined,
    filePath: meeting.filePath ?? '',
    date: meeting.date,
  }).go();
}
