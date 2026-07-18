/// <reference path="../.sst/platform/config.d.ts" />

const TABLE_NAMES = [
  'sh-users',
  'sh-api-keys',
  'sh-meetings',
  'sh-specs',
  'sh-tickets',
  'sh-projects',
  'sh-ticket-deps',
  'sh-ticket-attachments',
  'sh-ticket-comments',
  'sh-ticket-activities',
  'sh-integrations',
  'sh-project-members',
  'sh-org-metadata',
  'sh-org-invites',
  'sh-org-access-requests',
  'sh-notifications',
  'sh-labels',
  'sh-sprints',
  'sh-milestones',
  'sh-deletion-requests',
  'sh-consent-records',
  'sh-beta-waitlist',
  'sh-sse-events',
] as const;

const FIELDS = {
  pk: 'string',
  sk: 'string',
  gsi1pk: 'string',
  gsi1sk: 'string',
  gsi2pk: 'string',
  gsi2sk: 'string',
  gsi3pk: 'string',
  gsi3sk: 'string',
  gsi4pk: 'string',
  gsi4sk: 'string',
  gsi5pk: 'string',
  gsi5sk: 'string',
} as const;

const GLOBAL_INDEXES = {
  gsi1: { hashKey: 'gsi1pk', rangeKey: 'gsi1sk' },
  gsi2: { hashKey: 'gsi2pk', rangeKey: 'gsi2sk' },
  gsi3: { hashKey: 'gsi3pk', rangeKey: 'gsi3sk' },
  gsi4: { hashKey: 'gsi4pk', rangeKey: 'gsi4sk' },
  gsi5: { hashKey: 'gsi5pk', rangeKey: 'gsi5sk' },
} as const;

export type DynamoTableMap = Record<string, { resource: sst.aws.Dynamo; envVar: string }>;

export function createDynamoTables(): DynamoTableMap {
  const tables: DynamoTableMap = {};

  for (const name of TABLE_NAMES) {
    const resource = new sst.aws.Dynamo(`Dynamo${name.replace(/-/g, '')}`, {
      fields: { ...FIELDS },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
      globalIndexes: { ...GLOBAL_INDEXES },
      ...(name === 'sh-sse-events' ? { ttl: 'expireAt' } : {}),
    });
    const envVar = name.replace(/-/g, '_').toUpperCase();
    tables[name] = { resource, envVar };
  }

  return tables;
}
