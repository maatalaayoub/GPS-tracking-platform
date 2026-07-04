import type { Server as HttpServer } from 'node:http';

import { SOCKET_EVENTS } from '@gps/shared';
import type {
  ClientToServerEvents,
  Device,
  Position,
  ServerToClientEvents,
} from '@gps/shared';
import { Server as IOServer } from 'socket.io';

import { env } from './env.js';

export type AppIOServer = IOServer<ClientToServerEvents, ServerToClientEvents>;

let io: AppIOServer | null = null;

/**
 * Attach a Socket.IO server to the shared HTTP server. Must be called
 * once during bootstrap before any broadcast helper is used.
 */
export function attachSocketServer(http: HttpServer): AppIOServer {
  io = new IOServer(http, {
    cors: { origin: env.SOCKET_CORS_ORIGIN },
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket] client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function broadcastPosition(position: Position): void {
  io?.emit(SOCKET_EVENTS.positionUpdate, position);
}

export function broadcastDeviceStatus(device: Device): void {
  io?.emit(SOCKET_EVENTS.deviceStatus, device);
}
