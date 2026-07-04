import { positionIngestSchema } from '@gps/shared';

import type { DecodeResult, ProtocolDecoder } from './types.js';

/**
 * Generic newline-delimited JSON protocol.
 *
 * Wire format: one JSON object per line, matching `positionIngestSchema`,
 * e.g. `{"uniqueId":"IMEI123","latitude":48.8566,"longitude":2.3522,"speed":42}`.
 *
 * This is the default placeholder until a real device protocol is chosen.
 */
export const genericProtocol: ProtocolDecoder = {
  name: 'generic',

  decode(chunk: Buffer): DecodeResult {
    const positions = [];
    let start = 0;
    let idx = chunk.indexOf(0x0a); // '\n'

    while (idx !== -1) {
      const line = chunk.subarray(start, idx).toString('utf8').trim();
      start = idx + 1;
      idx = chunk.indexOf(0x0a, start);

      if (!line) continue;

      try {
        const parsed = positionIngestSchema.safeParse(JSON.parse(line));
        if (parsed.success) {
          positions.push({ ...parsed.data, protocol: 'generic' as const });
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            '[generic] invalid position payload:',
            parsed.error.message,
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[generic] JSON parse error:', (err as Error).message);
      }
    }

    return { positions, remainder: chunk.subarray(start) };
  },
};
