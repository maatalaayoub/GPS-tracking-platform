import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { devices } from './devices';

/**
 * A single GPS fix / telemetry sample reported by a device.
 *
 * Protocol-agnostic: decoded fields are stored in typed columns while the
 * full decoded payload is retained in `raw` so nothing is lost before the
 * device protocol is finalized.
 */
export const positions = pgTable(
  'positions',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    deviceId: uuid('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    altitude: doublePrecision('altitude'),
    speed: doublePrecision('speed'),
    heading: doublePrecision('heading'),
    accuracy: doublePrecision('accuracy'),
    satellites: integer('satellites'),
    valid: boolean('valid').notNull().default(true),
    protocol: text('protocol'),
    raw: jsonb('raw'),
    deviceTime: timestamp('device_time', { withTimezone: true }),
    serverTime: timestamp('server_time', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('positions_device_time_idx').on(table.deviceId, table.deviceTime),
  ],
);

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;
