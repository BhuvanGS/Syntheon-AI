// db/index.ts — Drizzle ORM client for Supabase PostgreSQL
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Connection pool configuration
// IMPORTANT: Use Supabase Transaction Pooler (pooler.supabase.com:6543) for best performance
// With pooler: max can be higher since pooler handles connection management
const client = postgres(connectionString, {
  max: 10, // 10 concurrent connections (pooler handles this efficiently)
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Required for Supabase transaction pooler (pgbouncer)
});

export const db = drizzle(client, { schema });
