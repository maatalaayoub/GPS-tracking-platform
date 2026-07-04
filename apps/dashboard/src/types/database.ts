export interface Device {
  id: string;
  unique_id: string;
  name: string;
  protocol: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  owner_id: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Position {
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
  raw: Record<string, unknown> | null;
  device_time: string | null;
  server_time: string;
}

export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  positionsToday: number;
}
