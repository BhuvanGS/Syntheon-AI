/// <reference path="../.sst/platform/config.d.ts" />

import type { Secrets } from './secrets';
import type { DynamoTableMap } from './database';

export function createSite(args: {
  appUrl: string;
  uploads: sst.aws.Bucket;
  dynamoTables: DynamoTableMap;
  secrets: Secrets;
}): sst.aws.Nextjs {
  const { appUrl, uploads, dynamoTables, secrets: s } = args;

  const tableResources = Object.values(dynamoTables).map((t) => t.resource);
  const tableEnvVars: Record<string, any> = {};
  for (const [logicalName, { resource, envVar }] of Object.entries(dynamoTables)) {
    tableEnvVars[envVar] = resource.name;
  }

  const isProduction = appUrl.includes('syntheonhub.com');

  const site = new sst.aws.Nextjs('Site', {
    path: '.',
    domain: isProduction
      ? {
          name: 'syntheonhub.com',
          aliases: ['www.syntheonhub.com', 'app.syntheonhub.com'],
          cert: 'arn:aws:acm:us-east-1:565139240803:certificate/29b1d926-63c1-4337-96fb-e58585208fc6',
        }
      : undefined,
    link: [
      uploads,
      ...tableResources,
      s.groqApiKey,
      s.skribbyApiKey,
      s.clerkSecretKey,
      s.clerkWebhookSecret,
      s.deepgramApiKey,
      s.skribbyWebhookSecret,
      s.webhookAccessToken,
      s.googleOauthClientSecret,
      s.googleOauthClientId,
      s.tokenEncryptionKey,
      s.privacyDeletionSecret,
    ],
    environment: {
      ...tableEnvVars,
      UPLOADS_BUCKET_NAME: uploads.name,
      NEXT_PUBLIC_APP_URL: appUrl,
      GROQ_API_KEY: s.groqApiKey.value,
      SKRIBBY_API_KEY: s.skribbyApiKey.value,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      CLERK_SECRET_KEY: s.clerkSecretKey.value,
      CLERK_WEBHOOK_SECRET: s.clerkWebhookSecret.value,
      DEEPGRAM_API_KEY: s.deepgramApiKey.value,
      SKRIBBY_WEBHOOK_SECRET: s.skribbyWebhookSecret.value,
      WEBHOOK_ACCESS_TOKEN: s.webhookAccessToken.value,
      GOOGLE_OAUTH_CLIENT_ID: s.googleOauthClientId.value,
      GOOGLE_OAUTH_CLIENT_SECRET: s.googleOauthClientSecret.value,
      GOOGLE_OAUTH_REDIRECT_URI: isProduction
        ? 'https://app.syntheonhub.com/api/oauth/google/callback'
        : `${appUrl}/api/oauth/google/callback`,
      TOKEN_ENCRYPTION_KEY: s.tokenEncryptionKey.value,
      PRIVACY_DELETION_SECRET: s.privacyDeletionSecret.value,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL!,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL!,
      NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID!,
      CLERK_TELEMETRY_DISABLED: process.env.CLERK_TELEMETRY_DISABLED!,
      BETA_MODE: process.env.BETA_MODE ?? (isProduction ? 'true' : 'false'),
      BETA_START_AT: process.env.BETA_START_AT ?? (isProduction ? '2026-07-06T12:20:00.000Z' : ''),
      BETA_DURATION_DAYS: process.env.BETA_DURATION_DAYS ?? '15',
      BETA_ADMIN_EMAILS: process.env.BETA_ADMIN_EMAILS ?? '',
      // Closes the app host (app.syntheonhub.com); marketing site stays open.
      // Local/non-prod defaults to open unless explicitly forced.
      FORCE_BETA_CLOSED: process.env.FORCE_BETA_CLOSED ?? (isProduction ? 'true' : 'false'),
      NEXT_PUBLIC_BETA_MODE:
        process.env.NEXT_PUBLIC_BETA_MODE ??
        process.env.BETA_MODE ??
        (isProduction ? 'true' : 'false'),
      NEXT_PUBLIC_BETA_START_AT:
        process.env.NEXT_PUBLIC_BETA_START_AT ??
        process.env.BETA_START_AT ??
        (isProduction ? '2026-07-06T12:20:00.000Z' : ''),
      NEXT_PUBLIC_BETA_DURATION_DAYS:
        process.env.NEXT_PUBLIC_BETA_DURATION_DAYS ?? process.env.BETA_DURATION_DAYS ?? '15',
      NEXT_PUBLIC_FORCE_BETA_CLOSED:
        process.env.NEXT_PUBLIC_FORCE_BETA_CLOSED ??
        process.env.FORCE_BETA_CLOSED ??
        (isProduction ? 'true' : 'false'),
    },
  });

  return site;
}
