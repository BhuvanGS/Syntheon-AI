import { db } from '@/db/index';
import { integrations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/crypto';

interface RefreshTokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = (await response.json()) as RefreshTokenResponse;

    if (!response.ok || !data.access_token) {
      console.error('Google token refresh failed:', data);
      return null;
    }

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
}

export async function getValidGoogleAccessToken(userId: string): Promise<{
  token: string | null;
  error?: string;
}> {
  try {
    const [row] = await db
      .select({
        googleToken: integrations.googleToken,
        googleRefreshToken: integrations.googleRefreshToken,
      })
      .from(integrations)
      .where(eq(integrations.userId, userId))
      .limit(1);

    if (!row?.googleToken) {
      return { token: null, error: 'Google Calendar not connected' };
    }

    let accessToken: string;
    try {
      accessToken = decrypt(row.googleToken);
    } catch {
      return { token: null, error: 'Failed to decrypt stored Google token' };
    }

    // Test if the access token is still valid
    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (tokenInfoResponse.ok) {
      return { token: accessToken };
    }

    // Access token expired — try to refresh
    if (!row.googleRefreshToken) {
      return {
        token: null,
        error: 'Google session expired. Please reconnect your Google Calendar in Settings.',
      };
    }

    let refreshToken: string;
    try {
      refreshToken = decrypt(row.googleRefreshToken);
    } catch {
      return { token: null, error: 'Failed to decrypt Google refresh token' };
    }

    const newAccessToken = await refreshGoogleAccessToken(refreshToken);
    if (!newAccessToken) {
      return {
        token: null,
        error: 'Failed to refresh Google session. Please reconnect in Settings.',
      };
    }

    // Save the new access token
    await db
      .update(integrations)
      .set({
        googleToken: encrypt(newAccessToken),
        updatedAt: new Date(),
      })
      .where(eq(integrations.userId, userId));

    return { token: newAccessToken };
  } catch (error) {
    console.error('Error getting valid Google access token:', error);
    return { token: null, error: 'Failed to get Google access token' };
  }
}

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
