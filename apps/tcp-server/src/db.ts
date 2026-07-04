import { promises as dns } from 'node:dns';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@gps/database';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { env } from './env.js';

/**
 * Parse a Postgres connection URL into pg Pool options.
 * Resolves the hostname to IPv4 (A record) first so that machines that
 * resolve AAAA before A (common on Windows with dual-stack networking)
 * don't time out trying an unreachable IPv6 address.
 */
async function buildPool(): Promise<{
  db: NodePgDatabase<typeof schema>;
  pool: Pool;
}> {
  const url = new URL(env.DATABASE_URL);
  let host = url.hostname;

  // Attempt IPv4-only resolution; fall back to hostname if unavailable
  try {
    const [ipv4] = await dns.resolve4(host);
    host = ipv4;
    // eslint-disable-next-line no-console
    console.log(`[db] resolved ${url.hostname} → ${host} (IPv4)`);
  } catch {
    // Leave host as the original hostname (DNS may work normally)
  }

  const pooler = new Pool({
    host,
    port: Number(url.port) || 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace('/', ''),
    ssl: {
      rejectUnauthorized: false,
      // Provide the real hostname as SNI so Supabase pooler can route correctly
      servername: url.hostname,
    },
  });

  const db = drizzle(pooler, { schema });
  return { db, pool: pooler };
}

// Eagerly build the pool; callers await this before using db/pool.
export const dbPromise = buildPool();

// Convenience exports for direct destructuring (resolved at runtime)
export async function getDb() {
  return (await dbPromise).db;
}

export async function getPool() {
  return (await dbPromise).pool;
}
