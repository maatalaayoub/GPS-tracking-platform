/**
 * Shared constants that mirror the database enums so front-end and
 * back-end code can reference them without importing @gps/database.
 */

export const DEVICE_STATUSES = ['active', 'inactive', 'maintenance'] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export const USER_ROLES = ['admin', 'manager', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * GPS wire protocols the platform may support. `generic` is the default
 * placeholder used before a device-specific parser is chosen.
 */
export const GPS_PROTOCOLS = ['generic', 'gt06', 'teltonika', 'nmea'] as const;
export type GpsProtocol = (typeof GPS_PROTOCOLS)[number];
