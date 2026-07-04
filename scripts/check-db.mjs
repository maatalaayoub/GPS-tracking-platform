import { config } from 'dotenv';
import { resolve } from 'node:path';
import pg from 'pg';

// Load monorepo root .env (scripts/ is one level below root)
config({ path: resolve(process.cwd(), '.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const { rows } = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  const tables = rows.map((r) => r.table_name);
  console.log('✔ Connected to Supabase!');
  console.log('  Tables found:', tables.length ? tables.join(', ') : '(none — run the SQL in schema.sql first)');
} catch (e) {
  console.error('✖ Connection failed:', e.message);
  process.exit(1);
} finally {
  await pool.end();
}
