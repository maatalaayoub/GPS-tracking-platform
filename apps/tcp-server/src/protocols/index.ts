import type { GpsProtocol } from '@gps/shared';

import { genericProtocol } from './generic.js';
import type { ProtocolDecoder } from './types.js';

/**
 * Registry of available protocol decoders. Additional protocols
 * (gt06, teltonika, nmea) can be plugged in here without touching
 * the TCP listener.
 */
const registry: Partial<Record<GpsProtocol, ProtocolDecoder>> = {
  generic: genericProtocol,
};

export function getDecoder(protocol: GpsProtocol): ProtocolDecoder {
  const decoder = registry[protocol];
  if (!decoder) {
    throw new Error(`No decoder registered for protocol "${protocol}"`);
  }
  return decoder;
}

export type { ProtocolDecoder, DecodeResult } from './types.js';
