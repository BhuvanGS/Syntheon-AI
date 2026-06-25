import { db } from '@/db/index';
import { integrations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt } from '@/lib/crypto';

export async function saveGoogleIntegration(params: {
  userId: string;
  orgId?: string | null;
  googleToken: string;
  googleRefreshToken?: string | null;
}) {
  const existing = await db
    .select({ id: integrations.id })
    .from(integrations)
    .where(eq(integrations.userId, params.userId))
    .limit(1);

  const encryptedToken = encrypt(params.googleToken);
  const encryptedRefresh = params.googleRefreshToken ? encrypt(params.googleRefreshToken) : null;

  if (existing.length > 0) {
    await db
      .update(integrations)
      .set({
        googleToken: encryptedToken,
        googleRefreshToken: encryptedRefresh,
        orgId: params.orgId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, existing[0].id));
  } else {
    await db.insert(integrations).values({
      userId: params.userId,
      orgId: params.orgId ?? null,
      googleToken: encryptedToken,
      googleRefreshToken: encryptedRefresh,
      updatedAt: new Date(),
    });
  }
}
