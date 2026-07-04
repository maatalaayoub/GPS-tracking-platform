import type { PositionIngest } from '@gps/shared';

/**
 * Result of decoding one TCP chunk: any positions extracted, plus any
 * bytes that couldn't be fully parsed and should be retained for the
 * next chunk (for stream/framing based protocols).
 */
export interface DecodeResult {
  positions: PositionIngest[];
  remainder: Buffer;
}

/**
 * A GPS wire protocol implementation. `decode` is stateless from the
 * decoder's perspective — framing state lives in the caller's buffer.
 */
export interface ProtocolDecoder {
  readonly name: string;
  decode(chunk: Buffer): DecodeResult;
}
