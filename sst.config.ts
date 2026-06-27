/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'syntheon-ai',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    const { config } = await import('dotenv');
    config({ path: '.env.local' });

    const vpc = new sst.aws.Vpc('Vpc');

    const appUrl =
      $app.stage === 'production'
        ? 'https://www.syntheonhq.dev'
        : 'https://d108zk3a0mfnct.cloudfront.net';

    const database = new sst.aws.Aurora('Database', {
      engine: 'postgres',
      vpc,
      database: 'syntheon',
      dataApi: true,
      scaling: { min: '0.5 ACU', max: '4 ACU' },
    });

    const uploads = new sst.aws.Bucket('Uploads');

    const supabaseServiceRoleKey = new sst.Secret(
      'SupabaseServiceRoleKey',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const groqApiKey = new sst.Secret('GroqApiKey', process.env.GROQ_API_KEY);
    const skribbyApiKey = new sst.Secret('SkribbyApiKey', process.env.SKRIBBY_API_KEY);
    const clerkSecretKey = new sst.Secret('ClerkSecretKey', process.env.CLERK_SECRET_KEY);
    const clerkWebhookSecret = new sst.Secret(
      'ClerkWebhookSecret',
      process.env.CLERK_WEBHOOK_SECRET
    );
    const deepgramApiKey = new sst.Secret('DeepgramApiKey', process.env.DEEPGRAM_API_KEY);
    const githubToken = new sst.Secret('GithubToken', process.env.GITHUB_TOKEN);
    const skribbyWebhookSecret = new sst.Secret(
      'SkribbyWebhookSecret',
      process.env.SKRIBBY_WEBHOOK_SECRET
    );
    const webhookAccessToken = new sst.Secret(
      'WebhookAccessToken',
      process.env.WEBHOOK_ACCESS_TOKEN
    );
    const githubOauthClientId = new sst.Secret(
      'GithubOauthClientId',
      process.env.GITHUB_OAUTH_CLIENT_ID
    );
    const githubOauthClientSecret = new sst.Secret(
      'GithubOauthClientSecret',
      process.env.GITHUB_OAUTH_CLIENT_SECRET
    );
    const googleOauthClientSecret = new sst.Secret(
      'GoogleOauthClientSecret',
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    const tokenEncryptionKey = new sst.Secret(
      'TokenEncryptionKey',
      process.env.TOKEN_ENCRYPTION_KEY
    );

    const site = new sst.aws.Nextjs('Site', {
      path: '.',
      link: [
        database,
        uploads,
        supabaseServiceRoleKey,
        groqApiKey,
        skribbyApiKey,
        clerkSecretKey,
        clerkWebhookSecret,
        deepgramApiKey,
        githubToken,
        skribbyWebhookSecret,
        webhookAccessToken,
        githubOauthClientId,
        githubOauthClientSecret,
        googleOauthClientSecret,
        tokenEncryptionKey,
      ],
      environment: {
        DATABASE_SECRET_ARN: database.secretArn,
        DATABASE_CLUSTER_ARN: database.clusterArn,
        DATABASE_NAME: database.database,
        NEXT_PUBLIC_APP_URL: appUrl,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey.value,
        GROQ_API_KEY: groqApiKey.value,
        SKRIBBY_API_KEY: skribbyApiKey.value,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
        CLERK_SECRET_KEY: clerkSecretKey.value,
        CLERK_WEBHOOK_SECRET: clerkWebhookSecret.value,
        DEEPGRAM_API_KEY: deepgramApiKey.value,
        GITHUB_TOKEN: githubToken.value,
        GITHUB_OWNER: process.env.GITHUB_OWNER!,
        GITHUB_REPO: process.env.GITHUB_REPO!,
        SKRIBBY_WEBHOOK_SECRET: skribbyWebhookSecret.value,
        WEBHOOK_ACCESS_TOKEN: webhookAccessToken.value,
        GITHUB_OAUTH_CLIENT_ID: githubOauthClientId.value,
        GITHUB_OAUTH_CLIENT_SECRET: githubOauthClientSecret.value,
        GITHUB_OAUTH_REDIRECT_URI: `${appUrl}/api/oauth/github/callback`,
        GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID!,
        GOOGLE_OAUTH_CLIENT_SECRET: googleOauthClientSecret.value,
        GOOGLE_OAUTH_REDIRECT_URI: `${appUrl}/api/oauth/google/callback`,
        TOKEN_ENCRYPTION_KEY: tokenEncryptionKey.value,
        NGROK_URL: process.env.NGROK_URL!,
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL!,
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL!,
        NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID!,
        CLERK_TELEMETRY_DISABLED: process.env.CLERK_TELEMETRY_DISABLED!,
      },
    });

    return {
      site: site.url,
      databaseId: database.id,
      databaseClusterArn: database.clusterArn,
      databaseSecretArn: database.secretArn,
      uploadsBucket: uploads.name,
    };
  },
});
