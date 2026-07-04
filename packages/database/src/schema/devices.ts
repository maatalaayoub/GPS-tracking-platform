import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { deviceStatus } from './enums';
import { users } from './users';

/**
 * A physical GPS tracker. `uniqueId` holds the device identifier
 * reported by the hardware (e.g. IMEI). `protocol` is nullable because
 * the wire protocol is not yet decided.
 */
export const devices = pgTable(
  'devices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    uniqueId: text('unique_id').notNull().unique(),
    name: text('name').notNull(),
    protocol: text('protocol'),
    status: deviceStatus('status').notNull().default('active'),
    ownerId: uuid('owner_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('devices_owner_idx').on(table.ownerId)],
);

export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;
