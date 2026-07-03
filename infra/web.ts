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
        }
      : undefined,
    link: [
      uploads,
      ...tableResources,
      s.groqApiKey,
      s.groqApiKeyT2,
      s.skribbyApiKey,
      s.clerkSecretKey,
      s.clerkWebhookSecret,
      s.deepgramApiKey,
      s.githubToken,
      s.skribbyWebhookSecret,
      s.webhookAccessToken,
      s.githubOauthClientId,
      s.githubOauthClientSecret,
      s.googleOauthClientSecret,
      s.tokenEncryptionKey,
    ],
    environment: {
      ...tableEnvVars,
      UPLOADS_BUCKET_NAME: uploads.name,
      NEXT_PUBLIC_APP_URL: appUrl,
      GROQ_API_KEY: s.groqApiKey.value,
      GROQ_API_KEY_T2: s.groqApiKeyT2.value,
      SKRIBBY_API_KEY: s.skribbyApiKey.value,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      CLERK_SECRET_KEY: s.clerkSecretKey.value,
      CLERK_WEBHOOK_SECRET: s.clerkWebhookSecret.value,
      DEEPGRAM_API_KEY: s.deepgramApiKey.value,
      GITHUB_TOKEN: s.githubToken.value,
      GITHUB_OWNER: process.env.GITHUB_OWNER!,
      GITHUB_REPO: process.env.GITHUB_REPO!,
      SKRIBBY_WEBHOOK_SECRET: s.skribbyWebhookSecret.value,
      WEBHOOK_ACCESS_TOKEN: s.webhookAccessToken.value,
      GITHUB_OAUTH_CLIENT_ID: s.githubOauthClientId.value,
      GITHUB_OAUTH_CLIENT_SECRET: s.githubOauthClientSecret.value,
      GITHUB_OAUTH_REDIRECT_URI: `${appUrl}/api/oauth/github/callback`,
      GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      GOOGLE_OAUTH_CLIENT_SECRET: s.googleOauthClientSecret.value,
      GOOGLE_OAUTH_REDIRECT_URI: `${appUrl}/api/oauth/google/callback`,
      TOKEN_ENCRYPTION_KEY: s.tokenEncryptionKey.value,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL!,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL!,
      NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID!,
      CLERK_TELEMETRY_DISABLED: process.env.CLERK_TELEMETRY_DISABLED!,
    },
  });

  return site;
}
