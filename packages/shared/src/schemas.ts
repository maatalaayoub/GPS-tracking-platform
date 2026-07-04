import { z } from 'zod';

import { DEVICE_STATUSES, GPS_PROTOCOLS, USER_ROLES } from './constants';

/**
 * A single decoded GPS position sample.
 *
 * `raw` keeps the full decoded payload from the device so nothing is lost
 * before the wire protocol is finalized.
 */
export const positionSchema = z.object({
  deviceId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().nullable().optional(),
  speed: z.number().nonnegative().nullable().optional(),
  heading: z.number().min(0).max(360).nullable().optional(),
  accuracy: z.number().nonnegative().nullable().optional(),
  satellites: z.number().int().nonnegative().nullable().optional(),
  valid: z.boolean().default(true),
  protocol: z.enum(GPS_PROTOCOLS).nullable().optional(),
  raw: z.record(z.unknown()).nullable().optional(),
  deviceTime: z.coerce.date().nullable().optional(),
  serverTime: z.coerce.date().optional(),
});
export type Position = z.infer<typeof positionSchema>;

/**
 * Payload used when a device reports a new position (before it hits the DB).
 * Identified by `uniqueId` (e.g. IMEI) rather than the internal UUID.
 */
export const positionIngestSchema = positionSchema
  .omit({ deviceId: true, serverTime: true })
  .extend({
    uniqueId: z.string().min(1),
  });
export type PositionIngest = z.infer<typeof positionIngestSchema>;

/**
 * A tracked GPS device.
 */
export const deviceSchema = z.object({
  id: z.string().uuid(),
  uniqueId: z.string().min(1),
  name: z.string().min(1),
  protocol: z.enum(GPS_PROTOCOLS).nullable().optional(),
  status: z.enum(DEVICE_STATUSES).default('active'),
  ownerId: z.string().uuid().nullable().optional(),
  lastSeenAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Device = z.infer<typeof deviceSchema>;

export const deviceCreateSchema = deviceSchema
  .omit({ id: true, createdAt: true, updatedAt: true, lastSeenAt: true })
  .extend({
    status: z.enum(DEVICE_STATUSES).default('active'),
  });
export type DeviceCreate = z.infer<typeof deviceCreateSchema>;

/**
 * A platform user (linked to Supabase auth by matching `id`).
 */
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable().optional(),
  role: z.enum(USER_ROLES).default('viewer'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;
