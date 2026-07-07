/** Position received via Socket.IO (`position:update` event). Camelcase — matches @gps/shared schema. */
export interface LivePosition {
  deviceId: string;
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  satellites?: number | null;
  valid: boolean;
  protocol?: string | null;
  raw?: Record<string, unknown> | null;
  deviceTime?: string | null;
  serverTime?: string;
}

/** Device status received via Socket.IO (`device:status` event). */
export interface LiveDevice {
  id: string;
  uniqueId: string;
  name: string;
  protocol?: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  ownerId?: string | null;
  lastSeenAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Combined real-time state per device — updated on every event. */
export interface TrackedDevice {
  device: LiveDevice;
  position: LivePosition;
  updatedAt: Date;
}

/** A single historical position row from the database (snake_case). */
export interface HistoryPosition {
  id: number;
  device_id: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  satellites: number | null;
  valid: boolean;
  protocol: string | null;
  device_time: string | null;
  server_time: string;
}

/** Filter state for the history page. */
export interface HistoryFilters {
  deviceId: string | null;
  from: string | null;
  to: string | null;
  page: number;
}

/** Paginated result returned by the history query helper. */
export interface HistoryResult {
  positions: HistoryPosition[];
  total: number;
  page: number;
  pageSize: number;
  deviceId: string | null;
  from: string | null;
  to: string | null;
}
