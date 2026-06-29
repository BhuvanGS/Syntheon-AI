/// <reference path="../.sst/platform/config.d.ts" />

export function createSecrets() {
  return {
    groqApiKey: new sst.Secret('GroqApiKey', process.env.GROQ_API_KEY),
    skribbyApiKey: new sst.Secret('SkribbyApiKey', process.env.SKRIBBY_API_KEY),
    clerkSecretKey: new sst.Secret('ClerkSecretKey', process.env.CLERK_SECRET_KEY),
    clerkWebhookSecret: new sst.Secret(
      'ClerkWebhookSecret',
      process.env.CLERK_WEBHOOK_SECRET
    ),
    deepgramApiKey: new sst.Secret('DeepgramApiKey', process.env.DEEPGRAM_API_KEY),
    githubToken: new sst.Secret('GithubToken', process.env.GITHUB_TOKEN),
    skribbyWebhookSecret: new sst.Secret(
      'SkribbyWebhookSecret',
      process.env.SKRIBBY_WEBHOOK_SECRET
    ),
    webhookAccessToken: new sst.Secret(
      'WebhookAccessToken',
      process.env.WEBHOOK_ACCESS_TOKEN
    ),
    githubOauthClientId: new sst.Secret(
      'GithubOauthClientId',
      process.env.GITHUB_OAUTH_CLIENT_ID
    ),
    githubOauthClientSecret: new sst.Secret(
      'GithubOauthClientSecret',
      process.env.GITHUB_OAUTH_CLIENT_SECRET
    ),
    googleOauthClientSecret: new sst.Secret(
      'GoogleOauthClientSecret',
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    ),
    tokenEncryptionKey: new sst.Secret(
      'TokenEncryptionKey',
      process.env.TOKEN_ENCRYPTION_KEY
    ),
  };
}

export type Secrets = ReturnType<typeof createSecrets>;
