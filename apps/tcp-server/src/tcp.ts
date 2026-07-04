import { createServer, type Server, type Socket } from 'node:net';

import { env } from './env.js';
import { ingestPosition } from './ingest.js';
import { getDecoder } from './protocols/index.js';

/**
 * Start the raw TCP listener that accepts GPS device connections.
 *
 * Each connection maintains its own buffer of unparsed bytes. On each
 * chunk the configured decoder extracts any complete positions and
 * returns leftover bytes for the next chunk.
 */
export function startTcpListener(): Server {
  const decoder = getDecoder('generic');

  const server = createServer((socket: Socket) => {
    const peer = `${socket.remoteAddress}:${socket.remotePort}`;
    // eslint-disable-next-line no-console
    console.log(`[tcp] device connected: ${peer}`);

    let buffer: Buffer = Buffer.alloc(0);

    socket.on('data', async (chunk) => {
      buffer = Buffer.concat([buffer, chunk]) as Buffer;
      const { positions, remainder } = decoder.decode(buffer);
      buffer = remainder;

      for (const position of positions) {
        try {
          await ingestPosition(position);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            `[tcp] ingest failed for ${position.uniqueId}:`,
            (err as Error).message,
          );
        }
      }
    });

    socket.on('close', () => {
      // eslint-disable-next-line no-console
      console.log(`[tcp] device disconnected: ${peer}`);
    });

    socket.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error(`[tcp] socket error (${peer}):`, err.message);
    });
  });

  server.listen(env.TCP_LISTEN_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `[tcp] listening on :${env.TCP_LISTEN_PORT} (protocol=${decoder.name})`,
    );
  });

  return server;
}
