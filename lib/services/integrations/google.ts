import { IntegrationsEntity } from '@/db/entities';
import { encrypt, decrypt } from '@/lib/crypto';
import { randomUUID } from 'crypto';

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
    const res = await IntegrationsEntity.get({ userId }).go();

    if (!res.data?.googleToken) {
      return { token: null, error: 'Google Calendar not connected' };
    }

    let accessToken: string;
    try {
      accessToken = decrypt(res.data.googleToken);
    } catch {
      return { token: null, error: 'Failed to decrypt stored Google token' };
    }

    // Try a lightweight Calendar API call to check if the token is still valid
    const testResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList/primary',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (testResponse.ok) {
      return { token: accessToken };
    }

    // Token is invalid — try to refresh
    if (!res.data.googleRefreshToken) {
      return {
        token: null,
        error: 'Google session expired. Please reconnect your Google Calendar in Settings.',
      };
    }

    let refreshToken: string;
    try {
      refreshToken = decrypt(res.data.googleRefreshToken);
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

    await IntegrationsEntity.update({ userId })
      .set({
        googleToken: encrypt(newAccessToken),
        updatedAt: new Date().toISOString(),
      })
      .go();

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
  const existing = await IntegrationsEntity.get({ userId: params.userId }).go();

  const encryptedToken = encrypt(params.googleToken);
  const encryptedRefresh = params.googleRefreshToken
    ? encrypt(params.googleRefreshToken)
    : (existing.data?.googleRefreshToken ?? null);

  if (existing.data) {
    await IntegrationsEntity.update({ userId: params.userId })
      .set({
        googleToken: encryptedToken,
        googleRefreshToken: encryptedRefresh,
        orgId: params.orgId ?? null,
        updatedAt: new Date().toISOString(),
      })
      .go();
  } else {
    await IntegrationsEntity.create({
      id: randomUUID(),
      userId: params.userId,
      orgId: params.orgId ?? null,
      googleToken: encryptedToken,
      googleRefreshToken: encryptedRefresh,
    }).go();
  }
}

export async function deleteGoogleIntegration(userId: string) {
  await IntegrationsEntity.update({ userId })
    .set({
      googleToken: null,
      googleRefreshToken: null,
      updatedAt: new Date().toISOString(),
    })
    .go();
}
