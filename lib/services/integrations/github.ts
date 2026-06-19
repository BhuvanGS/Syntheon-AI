import { db } from '@/db/index';
import { integrations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { encrypt } from '@/lib/crypto';

export async function saveGithubIntegration(params: {
  userId: string;
  orgId?: string | null;
  githubToken: string;
  githubOwner: string;
  githubRepo?: string | null;
}) {
  // Manual upsert — avoids depending on DB unique-constraint for onConflictDoUpdate
  const existing = await db
    .select({ id: integrations.id })
    .from(integrations)
    .where(eq(integrations.userId, params.userId))
    .limit(1);

  const encryptedToken = encrypt(params.githubToken);

  if (existing.length > 0) {
    await db
      .update(integrations)
      .set({
        githubToken: encryptedToken,
        githubOwner: params.githubOwner,
        githubRepo: params.githubRepo ?? null,
        orgId: params.orgId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, existing[0].id));
  } else {
    await db.insert(integrations).values({
      userId: params.userId,
      orgId: params.orgId ?? null,
      githubToken: encryptedToken,
      githubOwner: params.githubOwner,
      githubRepo: params.githubRepo ?? null,
      updatedAt: new Date(),
    });
  }
}

export async function deleteGithubIntegration(userId: string, orgId?: string | null) {
  if (orgId) {
    await db
      .update(integrations)
      .set({
        githubToken: null,
        githubOwner: null,
        githubRepo: null,
        updatedAt: new Date(),
      })
      .where(and(eq(integrations.userId, userId), eq(integrations.orgId, orgId)));
  } else {
    await db
      .update(integrations)
      .set({
        githubToken: null,
        githubOwner: null,
        githubRepo: null,
        updatedAt: new Date(),
      })
      .where(eq(integrations.userId, userId));
  }
}
