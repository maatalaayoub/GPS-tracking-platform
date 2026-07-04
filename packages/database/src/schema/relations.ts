import { relations } from 'drizzle-orm';

import { devices } from './devices';
import { positions } from './positions';
import { users } from './users';

export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  owner: one(users, {
    fields: [devices.ownerId],
    references: [users.id],
  }),
  positions: many(positions),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  device: one(devices, {
    fields: [positions.deviceId],
    references: [devices.id],
  }),
}));
