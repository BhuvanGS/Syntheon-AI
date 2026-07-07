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

    const { createDynamoTables } = await import('./infra/database');
    const { createUploadsBucket } = await import('./infra/storage');
    const { createSecrets } = await import('./infra/secrets');
    const { createSite } = await import('./infra/web');

    const dynamoTables = createDynamoTables();
    const uploads = createUploadsBucket();
    const secrets = createSecrets();

    const site = createSite({
      appUrl:
        $app.stage === 'production'
          ? 'https://app.syntheonhub.com'
          : 'https://d2e5q6e4vnqp7s.cloudfront.net',
      uploads,
      dynamoTables,
      secrets,
    });

    return {
      site: site.url,
      uploadsBucket: uploads.name,
    };
  },
});
