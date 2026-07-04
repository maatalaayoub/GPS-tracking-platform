// ── Wire payload ─────────────────────────────────────────────────────────────
/** Newline-delimited JSON sent to the TCP server.  Matches positionIngestSchema. */
export interface GpsPayload {
  uniqueId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed: number;
  heading: number;
  accuracy?: number;
  satellites?: number;
  valid: boolean;
  protocol: 'generic';
  raw: {
    battery: number;
    signal: number;
    simulated: true;
    [key: string]: unknown;
  };
  deviceTime: string;
}

// ── Configuration ─────────────────────────────────────────────────────────────
export interface SimulatorConfig {
  deviceId: string;
  host: string;
  port: number;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // 0-360 °
  battery: number; // 0-100 %
  intervalMs: number;
  reconnect: boolean;
}

// ── State ─────────────────────────────────────────────────────────────────────
export type SimulatorMode =
  'static' | 'moving' | 'random' | 'offline' | 'route';

export interface SimulatorState {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  battery: number;
  mode: SimulatorMode;
  connected: boolean;
  sentCount: number;
}

// ── Routes ────────────────────────────────────────────────────────────────────
export interface Waypoint {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  /** ms to pause at this waypoint before moving to the next */
  pauseMs?: number;
}

export interface RouteFile {
  name: string;
  description?: string;
  waypoints: Waypoint[];
}

// ── CLI args ──────────────────────────────────────────────────────────────────
export interface CliArgs {
  deviceId: string;
  host: string;
  port: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  battery: number;
  intervalMs: number;
  mode: SimulatorMode;
  multi: boolean;
  count: number;
  routeFile: string | null;
  loop: boolean;
  drain: number;
  interactive: boolean;
}
