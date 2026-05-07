import { db } from '@/db/index';
import { integrations } from '@/db/schema';
import { eq } from 'drizzle-orm';

type LinearIntegrationPayload = {
  token: string;
  teamId: string | null;
  teamName: string | null;
  linearUserId: string | null;
  linearUserName: string | null;
};

export async function saveLinearIntegration(userId: string, payload: LinearIntegrationPayload) {
  const set = {
    linearAccessToken: payload.token,
    linearToken: payload.token,
    linearTeamId: payload.teamId,
    linearTeamName: payload.teamName,
    linearUserId: payload.linearUserId,
    linearUserName: payload.linearUserName,
    updatedAt: new Date(),
  };

  await db
    .insert(integrations)
    .values({ userId, ...set })
    .onConflictDoUpdate({
      target: integrations.userId,
      set,
    });
}

export async function deleteLinearIntegration(userId: string) {
  await db
    .update(integrations)
    .set({
      linearToken: null,
      linearTeamId: null,
      linearInitialStateId: null,
      linearPrStateId: null,
      updatedAt: new Date(),
    })
    .where(eq(integrations.userId, userId));
}
