/// <reference path="../.sst/platform/config.d.ts" />

const TABLE_NAMES = [
  'syntheon-users',
  'syntheon-api-keys',
  'syntheon-meetings',
  'syntheon-specs',
  'syntheon-tickets',
  'syntheon-projects',
  'syntheon-ticket-dependencies',
  'syntheon-ticket-attachments',
  'syntheon-ticket-comments',
  'syntheon-ticket-activities',
  'syntheon-integrations',
  'syntheon-project-members',
  'syntheon-org-metadata',
  'syntheon-org-invites',
  'syntheon-org-access-requests',
  'syntheon-notifications',
  'syntheon-labels',
  'syntheon-sprints',
  'syntheon-milestones',
  'syntheon-deletion-requests',
  'syntheon-consent-records',
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
    });
    const envVar = `DYNAMO_TABLE_${name
      .replace(/syntheon-/g, '')
      .replace(/-/g, '_')
      .toUpperCase()}`;
    tables[name] = { resource, envVar };
  }

  return tables;
}
