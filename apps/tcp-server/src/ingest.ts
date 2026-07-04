import { devices, positions } from '@gps/database';
import type { PositionIngest } from '@gps/shared';
import { sql } from 'drizzle-orm';

import { getDb } from './db.js';
import { broadcastDeviceStatus, broadcastPosition } from './sockets.js';

/**
 * Persist a decoded position and broadcast it live.
 *
 * The device is auto-created (upserted by `unique_id`) if unknown so
 * that new hardware coming online doesn't need manual DB registration.
 * `last_seen_at` is refreshed on every ingest.
 */
export async function ingestPosition(payload: PositionIngest): Promise<void> {
  const db = await getDb();
  const now = new Date();

  const [device] = await db
    .insert(devices)
    .values({
      uniqueId: payload.uniqueId,
      name: payload.uniqueId,
      protocol: payload.protocol ?? null,
      lastSeenAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: devices.uniqueId,
      set: {
        lastSeenAt: now,
        updatedAt: now,
        // Only overwrite protocol if the ingest specifies one
        protocol: sql`COALESCE(EXCLUDED.protocol, ${devices.protocol})`,
      },
    })
    .returning();

  if (!device) {
    throw new Error(`Failed to upsert device ${payload.uniqueId}`);
  }

  const [row] = await db
    .insert(positions)
    .values({
      deviceId: device.id,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude ?? null,
      speed: payload.speed ?? null,
      heading: payload.heading ?? null,
      accuracy: payload.accuracy ?? null,
      satellites: payload.satellites ?? null,
      valid: payload.valid ?? true,
      protocol: payload.protocol ?? null,
      raw: payload.raw ?? null,
      deviceTime: payload.deviceTime ?? null,
    })
    .returning();

  if (!row) {
    throw new Error('Position insert returned no row');
  }

  broadcastPosition({
    deviceId: row.deviceId,
    latitude: row.latitude,
    longitude: row.longitude,
    altitude: row.altitude,
    speed: row.speed,
    heading: row.heading,
    accuracy: row.accuracy,
    satellites: row.satellites,
    valid: row.valid,
    protocol: (row.protocol ?? null) as PositionIngest['protocol'],
    raw: (row.raw ?? null) as PositionIngest['raw'],
    deviceTime: row.deviceTime,
    serverTime: row.serverTime,
  });

  broadcastDeviceStatus({
    id: device.id,
    uniqueId: device.uniqueId,
    name: device.name,
    protocol: device.protocol as PositionIngest['protocol'],
    status: device.status,
    ownerId: device.ownerId,
    lastSeenAt: device.lastSeenAt,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt,
  });
}
