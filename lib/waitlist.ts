import { randomUUID } from 'crypto';
import { BetaWaitlistEntity } from '@/db/entities';
import { getBetaStatus } from '@/lib/beta';

export type WaitlistStatus = 'pending' | 'approved' | 'rejected';

export interface WaitlistEntry {
  id: string;
  userId: string;
  email: string;
  name?: string;
  note?: string;
  status: WaitlistStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionReason?: string;
}

function mapWaitlistEntry(row: any): WaitlistEntry {
  return {
    id: row.id,
    userId: row.userId,
    email: row.email,
    name: row.name,
    note: row.note,
    status: row.status,
    requestedAt: row.requestedAt,
    reviewedAt: row.reviewedAt,
    reviewedBy: row.reviewedBy,
    decisionReason: row.decisionReason,
  };
}

export async function getLatestWaitlistEntryForUser(userId: string): Promise<WaitlistEntry | null> {
  const res = await BetaWaitlistEntity.query.byUser({ userId }).go({ limit: 1, order: 'desc' });
  const row = res.data?.[0];
  return row ? mapWaitlistEntry(row) : null;
}

export async function submitWaitlistRequest(input: {
  userId: string;
  email: string;
  name?: string;
  note?: string;
}): Promise<WaitlistEntry> {
  const latest = await getLatestWaitlistEntryForUser(input.userId);
  const now = new Date().toISOString();

  if (latest) {
    await BetaWaitlistEntity.update({ id: latest.id })
      .set({
        email: input.email,
        name: input.name,
        note: input.note,
        status: 'pending',
        requestedAt: now,
        reviewedAt: undefined,
        reviewedBy: undefined,
        decisionReason: undefined,
      })
      .go();

    const updated = await BetaWaitlistEntity.get({ id: latest.id }).go();
    return mapWaitlistEntry(updated.data);
  }

  const id = randomUUID();
  await BetaWaitlistEntity.create({
    id,
    userId: input.userId,
    email: input.email,
    name: input.name,
    note: input.note,
    status: 'pending',
    requestedAt: now,
  }).go();

  const created = await BetaWaitlistEntity.get({ id }).go();
  return mapWaitlistEntry(created.data);
}

export async function listWaitlistEntries(status?: WaitlistStatus): Promise<WaitlistEntry[]> {
  if (status) {
    const res = await BetaWaitlistEntity.query.byStatus({ status }).go({ order: 'desc', limit: 500 });
    return (res.data ?? []).map(mapWaitlistEntry);
  }

  const res = await BetaWaitlistEntity.scan.go({ pages: 20 });
  return (res.data ?? [])
    .map(mapWaitlistEntry)
    .sort((a: WaitlistEntry, b: WaitlistEntry) => b.requestedAt.localeCompare(a.requestedAt));
}

export async function reviewWaitlistEntry(input: {
  id: string;
  status: Exclude<WaitlistStatus, 'pending'>;
  reviewedBy: string;
  decisionReason?: string;
}): Promise<WaitlistEntry | null> {
  await BetaWaitlistEntity.update({ id: input.id })
    .set({
      status: input.status,
      reviewedBy: input.reviewedBy,
      reviewedAt: new Date().toISOString(),
      decisionReason: input.decisionReason,
    })
    .go();

  const res = await BetaWaitlistEntity.get({ id: input.id }).go();
  return res.data ? mapWaitlistEntry(res.data) : null;
}

export async function hasBetaAccess(userId: string): Promise<boolean> {
  const beta = getBetaStatus();
  if (!beta.isActive) {
    return true;
  }
  const latest = await getLatestWaitlistEntryForUser(userId);
  return latest?.status === 'approved';
}
