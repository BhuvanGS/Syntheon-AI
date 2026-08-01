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

type TableName = (typeof TABLE_NAMES)[number];

/**
 * Max GSI slot each table needs (from db/entities.ts index declarations).
 * Helper for future greenfield tables / migrations — do NOT shrink GSIs on
 * existing production tables in-place (DynamoDB/SST cannot safely remove them).
 */
const TABLE_GSI_COUNT: Record<TableName, number> = {
  'sh-users': 1,
  'sh-api-keys': 2,
  'sh-meetings': 4,
  'sh-specs': 3,
  'sh-tickets': 5,
  'sh-projects': 3,
  'sh-ticket-deps': 4,
  'sh-ticket-attachments': 2,
  'sh-ticket-comments': 2,
  'sh-ticket-activities': 3,
  'sh-integrations': 1,
  'sh-project-members': 2,
  'sh-org-metadata': 1,
  'sh-org-invites': 2,
  'sh-org-access-requests': 1,
  'sh-notifications': 1,
  'sh-labels': 1,
  'sh-sprints': 2,
  'sh-milestones': 2,
  'sh-deletion-requests': 2,
  'sh-consent-records': 1,
  'sh-beta-waitlist': 2,
  'sh-sse-events': 1,
};

const ALL_GSI_FIELDS = {
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

const ALL_GLOBAL_INDEXES = {
  gsi1: { hashKey: 'gsi1pk', rangeKey: 'gsi1sk' },
  gsi2: { hashKey: 'gsi2pk', rangeKey: 'gsi2sk' },
  gsi3: { hashKey: 'gsi3pk', rangeKey: 'gsi3sk' },
  gsi4: { hashKey: 'gsi4pk', rangeKey: 'gsi4sk' },
  gsi5: { hashKey: 'gsi5pk', rangeKey: 'gsi5sk' },
} as const;

/** Derive fields + globalIndexes for a table. Trimmed mode is opt-in for new stacks only. */
export function indexesFor(tableName: TableName, opts?: { trim?: boolean }) {
  const count = opts?.trim ? TABLE_GSI_COUNT[tableName] : 5;
  const fields: Record<string, 'string'> = { pk: 'string', sk: 'string' };
  const globalIndexes: Record<string, { hashKey: string; rangeKey: string }> = {};
  for (let i = 1; i <= count; i++) {
    fields[`gsi${i}pk`] = 'string';
    fields[`gsi${i}sk`] = 'string';
    globalIndexes[`gsi${i}`] = {
      hashKey: `gsi${i}pk`,
      rangeKey: `gsi${i}sk`,
    };
  }
  return { fields, globalIndexes };
}

export type DynamoTableMap = Record<string, { resource: sst.aws.Dynamo; envVar: string }>;

export function createDynamoTables(): DynamoTableMap {
  const tables: DynamoTableMap = {};

  for (const name of TABLE_NAMES) {
    // SAFETY: keep provisioning all 5 GSIs on existing tables. Enabling trim
    // via indexesFor(name, { trim: true }) is for greenfield only — shrinking
    // live GSIs can brick deployments. See TABLE_GSI_COUNT above.
    const resource = new sst.aws.Dynamo(`Dynamo${name.replace(/-/g, '')}`, {
      fields: { ...ALL_GSI_FIELDS },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
      globalIndexes: { ...ALL_GLOBAL_INDEXES },
      ...(name === 'sh-sse-events' ? { ttl: 'expireAt' } : {}),
    });
    const envVar = name.replace(/-/g, '_').toUpperCase();
    tables[name] = { resource, envVar };
  }

  return tables;
}
