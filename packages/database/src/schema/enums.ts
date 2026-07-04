import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Lifecycle state of a tracked GPS device.
 */
export const deviceStatus = pgEnum('device_status', [
  'active',
  'inactive',
  'maintenance',
]);

/**
 * Access level of a platform user.
 */
export const userRole = pgEnum('user_role', ['admin', 'manager', 'viewer']);
