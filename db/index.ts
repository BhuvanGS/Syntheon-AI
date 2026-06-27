// db/index.ts — Drizzle ORM client for Supabase or Aurora Serverless Data API
import { drizzle as drizzleDataApi } from 'drizzle-orm/aws-data-api/pg';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { RDSDataClient } from '@aws-sdk/client-rds-data';
import postgres from 'postgres';
import * as schema from './schema';

type Db = ReturnType<typeof drizzlePostgres>;

function createDb(): Db {
  const useDataApi = process.env.DATABASE_SECRET_ARN && process.env.DATABASE_CLUSTER_ARN;

  if (useDataApi) {
    const rdsDataClient = new RDSDataClient({
      region: process.env.AWS_REGION || 'ap-south-1',
    });

    return drizzleDataApi(rdsDataClient, {
      database: process.env.DATABASE_NAME!,
      secretArn: process.env.DATABASE_SECRET_ARN!,
      resourceArn: process.env.DATABASE_CLUSTER_ARN!,
      schema,
    }) as unknown as Db;
  }

  const connectionString = process.env.DATABASE_URL!;
  const isSupabasePooler = connectionString.includes('pooler.supabase.com');

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: !isSupabasePooler,
  });

  return drizzlePostgres(client, { schema });
}

export const db = createDb();
