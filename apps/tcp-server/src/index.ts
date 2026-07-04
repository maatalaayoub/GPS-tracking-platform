import { createServer } from 'node:http';

import express from 'express';

import { dbPromise, getDb } from './db.js';
import { env } from './env.js';
import { attachSocketServer } from './sockets.js';
import { startTcpListener } from './tcp.js';

async function main(): Promise<void> {
  // Resolve DB connection (with IPv4 pre-resolution) before accepting requests
  console.log('[bootstrap] connecting to database…');
  const { pool } = await dbPromise;
  console.log('[bootstrap] database pool ready');

  const app = express();
  app.use(express.json());

  app.get('/health', async (_req, res) => {
    try {
      const db = await getDb();
      await db.execute('select 1' as unknown as import('drizzle-orm').SQL);
      res.json({ status: 'ok', ts: new Date().toISOString() });
    } catch (err) {
      res.status(503).json({ status: 'error', error: (err as Error).message });
    }
  });

  const http = createServer(app);
  attachSocketServer(http);

  http.listen(env.TCP_SERVER_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[http] API + Socket.IO listening on :${env.TCP_SERVER_PORT}`);
  });

  const tcp = startTcpListener();

  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[bootstrap] ${signal} received, shutting down…`);
    http.close();
    tcp.close();
    pool.end().catch(() => undefined);
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[bootstrap] fatal error:', err);
  process.exit(1);
});
