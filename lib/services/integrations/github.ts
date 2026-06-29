import { IntegrationsEntity } from '@/db/entities';
import { encrypt } from '@/lib/crypto';
import { randomUUID } from 'crypto';

export async function saveGithubIntegration(params: {
  userId: string;
  orgId?: string | null;
  githubToken: string;
  githubOwner: string;
  githubRepo?: string | null;
}) {
  const existing = await IntegrationsEntity.get({ userId: params.userId }).go();
  const encryptedToken = encrypt(params.githubToken);

  if (existing.data) {
    await IntegrationsEntity.update({ userId: params.userId })
      .set({
        githubToken: encryptedToken,
        githubOwner: params.githubOwner,
        githubRepo: params.githubRepo ?? null,
        orgId: params.orgId ?? null,
        updatedAt: new Date().toISOString(),
      })
      .go();
  } else {
    await IntegrationsEntity.create({
      id: randomUUID(),
      userId: params.userId,
      orgId: params.orgId ?? null,
      githubToken: encryptedToken,
      githubOwner: params.githubOwner,
      githubRepo: params.githubRepo ?? null,
    }).go();
  }
}

export async function deleteGithubIntegration(userId: string, orgId?: string | null) {
  await IntegrationsEntity.update({ userId })
    .set({
      githubToken: null,
      githubOwner: null,
      githubRepo: null,
      updatedAt: new Date().toISOString(),
    })
    .go();
}
