import type { NextRequest } from 'next/server';

export function getAppBaseUrl(req: NextRequest): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const url = new URL(req.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    url.protocol = 'http:';
  }

  return url.origin;
}

export function getDashboardRedirectUrl(req: NextRequest): URL {
  return new URL('/dashboard', getAppBaseUrl(req));
}
