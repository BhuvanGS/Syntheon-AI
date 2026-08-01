/// <reference path="../.sst/platform/config.d.ts" />

export function createSecrets() {
  return {
    groqApiKey: new sst.Secret('GroqApiKey', process.env.GROQ_API_KEY),
    skribbyApiKey: new sst.Secret('SkribbyApiKey', process.env.SKRIBBY_API_KEY),
    clerkSecretKey: new sst.Secret('ClerkSecretKey', process.env.CLERK_SECRET_KEY),
    clerkWebhookSecret: new sst.Secret('ClerkWebhookSecret', process.env.CLERK_WEBHOOK_SECRET),
    deepgramApiKey: new sst.Secret('DeepgramApiKey', process.env.DEEPGRAM_API_KEY),
    skribbyWebhookSecret: new sst.Secret(
      'SkribbyWebhookSecret',
      process.env.SKRIBBY_WEBHOOK_SECRET
    ),
    webhookAccessToken: new sst.Secret('WebhookAccessToken', process.env.WEBHOOK_ACCESS_TOKEN),
    googleOauthClientSecret: new sst.Secret(
      'GoogleOauthClientSecret',
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    ),
    googleOauthClientId: new sst.Secret('GoogleOauthClientId', process.env.GOOGLE_OAUTH_CLIENT_ID),
    tokenEncryptionKey: new sst.Secret('TokenEncryptionKey', process.env.TOKEN_ENCRYPTION_KEY),
    privacyDeletionSecret: new sst.Secret(
      'PrivacyDeletionSecret',
      process.env.PRIVACY_DELETION_SECRET
    ),
  };
}

export type Secrets = ReturnType<typeof createSecrets>;
