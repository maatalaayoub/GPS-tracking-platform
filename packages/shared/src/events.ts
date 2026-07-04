import type { Device, Position } from './schemas';

/**
 * Socket.IO event names shared between the server broadcast layer
 * and the dashboard client, so refactors stay in sync.
 */
export const SOCKET_EVENTS = {
  positionUpdate: 'position:update',
  deviceStatus: 'device:status',
} as const;

/**
 * Payload types keyed by event name — used by both emit and on() sides.
 */
export interface ServerToClientEvents {
  [SOCKET_EVENTS.positionUpdate]: (position: Position) => void;
  [SOCKET_EVENTS.deviceStatus]: (device: Device) => void;
}

export type ClientToServerEvents = Record<string, never>;
