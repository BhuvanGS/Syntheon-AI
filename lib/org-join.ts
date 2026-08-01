import { randomBytes, randomUUID } from 'crypto';
import { clerkClient } from '@clerk/nextjs/server';
import { OrganizationAccessRequestsEntity, OrganizationMetadataEntity } from '@/db/entities';
import { FREE_ORG_SEAT_LIMIT, isOrganizationPaid } from '@/lib/org-plan';

export function generateJoinToken(): string {
  return randomBytes(16).toString('hex');
}

export function buildJoinLink(token: string, origin?: string): string {
  const base =
    origin?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    'https://app.syntheonhub.com';
  return `${base}/join?token=${encodeURIComponent(token)}`;
}

export function extractJoinToken(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  try {
    if (raw.includes('://') || raw.includes('/join')) {
      const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
      const fromQuery = url.searchParams.get('token');
      if (fromQuery?.trim()) return fromQuery.trim();
      const parts = url.pathname.split('/').filter(Boolean);
      const joinIdx = parts.indexOf('join');
      if (joinIdx >= 0 && parts[joinIdx + 1]) return parts[joinIdx + 1];
    }
  } catch {
    // fall through — treat as raw token
  }

  // Strip accidental whitespace / wrapping
  const cleaned = raw.replace(/^["'\s]+|["'\s]+$/g, '');
  if (/^[a-f0-9]{32}$/i.test(cleaned)) return cleaned;
  if (/^[a-zA-Z0-9_-]{16,64}$/.test(cleaned)) return cleaned;
  return cleaned || null;
}

export async function findOrgMetaByJoinToken(token: string) {
  const byToken = await OrganizationMetadataEntity.query
    .byJoinToken({ joinToken: token })
    .go({ limit: 1 });
  return byToken.data?.[0] ?? null;
}

/** Ensure org has a join token; creates metadata if missing. */
export async function ensureJoinToken(orgId: string): Promise<string> {
  const existing = await OrganizationMetadataEntity.get({ orgId }).go();
  if (existing.data?.joinToken) return existing.data.joinToken;

  const token = generateJoinToken();
  if (!existing.data) {
    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId,
      joinToken: token,
      allowAccessRequests: true,
    }).go();
  } else {
    await OrganizationMetadataEntity.update({ orgId })
      .set({ joinToken: token, updatedAt: new Date().toISOString() })
      .go();
  }
  return token;
}

export async function rotateJoinToken(orgId: string): Promise<string> {
  const token = generateJoinToken();
  const existing = await OrganizationMetadataEntity.get({ orgId }).go();
  if (!existing.data) {
    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId,
      joinToken: token,
      allowAccessRequests: true,
    }).go();
  } else {
    await OrganizationMetadataEntity.update({ orgId })
      .set({ joinToken: token, updatedAt: new Date().toISOString() })
      .go();
  }
  return token;
}

type RequestAccessParams = {
  orgId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  source: 'join_link' | 'manual';
};

export type RequestAccessResult =
  | { status: 'already_member'; orgId: string }
  | { status: 'pending'; orgId: string; requestId: string; alreadyPending: boolean }
  | { status: 'seat_limit'; orgId: string };

export async function requestOrgAccess(params: RequestAccessParams): Promise<RequestAccessResult> {
  const { orgId, userId, userEmail, userName, source } = params;
  const client = await clerkClient();

  try {
    const memberships = await client.users.getOrganizationMembershipList({ userId });
    if (memberships.data.some((m) => m.organization.id === orgId)) {
      return { status: 'already_member', orgId };
    }
  } catch {
    // continue
  }

  const existing = await OrganizationAccessRequestsEntity.get({ orgId, userId }).go();
  if (existing.data) {
    if (existing.data.status === 'pending') {
      return {
        status: 'pending',
        orgId,
        requestId: existing.data.id,
        alreadyPending: true,
      };
    }
    if (existing.data.status === 'approved') {
      // Stale approved without membership — recreate as pending
    } else if (existing.data.status === 'rejected') {
      // Allow re-request: update back to pending
      await OrganizationAccessRequestsEntity.update({ orgId, userId })
        .set({
          status: 'pending',
          source,
          userEmail,
          userName: userName || existing.data.userName,
          requestedAt: new Date().toISOString(),
        })
        .go();
      return {
        status: 'pending',
        orgId,
        requestId: existing.data.id,
        alreadyPending: false,
      };
    }
  }

  const isPaidOrg = await isOrganizationPaid(orgId);
  if (!isPaidOrg) {
    const members = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
    if ((members.data?.length ?? 0) >= FREE_ORG_SEAT_LIMIT) {
      return { status: 'seat_limit', orgId };
    }
  }

  const requestId = existing.data?.id ?? randomUUID();

  if (existing.data) {
    await OrganizationAccessRequestsEntity.update({ orgId, userId })
      .set({
        status: 'pending',
        source,
        userEmail,
        userName: userName || existing.data.userName,
        requestedAt: new Date().toISOString(),
      })
      .go();
  } else {
    await OrganizationAccessRequestsEntity.create({
      id: requestId,
      orgId,
      userId,
      userEmail,
      userName: userName || undefined,
      status: 'pending',
      source,
      requestedAt: new Date().toISOString(),
    }).go();
  }

  return { status: 'pending', orgId, requestId, alreadyPending: false };
}

export async function getPendingRequestForUser(userId: string) {
  const res = await OrganizationAccessRequestsEntity.query.byUser({ userId }).go();
  const pending = (res.data ?? [])
    .filter((r: { status?: string }) => r.status === 'pending')
    .sort((a: { requestedAt?: string }, b: { requestedAt?: string }) =>
      (b.requestedAt || '').localeCompare(a.requestedAt || '')
    );
  return pending[0] ?? null;
}
