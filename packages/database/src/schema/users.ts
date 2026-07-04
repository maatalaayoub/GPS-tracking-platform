import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { userRole } from './enums';

/**
 * Platform users. `id` is intended to line up with a Supabase
 * `auth.users` id so records can be linked to Supabase Auth.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  role: userRole('role').notNull().default('viewer'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
