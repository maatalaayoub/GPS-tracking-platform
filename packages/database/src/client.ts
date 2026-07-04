import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';

import * as schema from './schema';

export type Schema = typeof schema;
export type Database = NodePgDatabase<Schema>;

/**
 * Create a Drizzle database instance backed by a node-postgres pool.
 *
 * Point `DATABASE_URL` at your Supabase connection string (use the pooled
 * connection string for serverless environments).
 */
export function createDatabase(
  connectionString: string | undefined = process.env.DATABASE_URL,
  config: Omit<PoolConfig, 'connectionString'> = {},
): { db: Database; pool: Pool } {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({ connectionString, ...config });
  const db = drizzle(pool, { schema });

  return { db, pool };
}
