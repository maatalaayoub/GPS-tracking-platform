import { EventEmitter } from 'node:events';
import { type Socket, createConnection } from 'node:net';

import {
  bearingBetween,
  clamp,
  haversineDistance,
  movePoint,
  randomBetween,
} from './movement.js';
import type {
  GpsPayload,
  RouteFile,
  SimulatorConfig,
  SimulatorMode,
  SimulatorState,
  Waypoint,
} from './types.js';

export interface SimulatorEvents {
  connected: [];
  disconnected: [];
  reconnecting: [];
  error: [err: Error];
  sent: [payload: GpsPayload];
  mode: [mode: SimulatorMode];
  routeComplete: [];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface DeviceSimulator {
  on<K extends keyof SimulatorEvents>(
    event: K,
    listener: (...args: SimulatorEvents[K]) => void,
  ): this;
  emit<K extends keyof SimulatorEvents>(
    event: K,
    ...args: SimulatorEvents[K]
  ): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class DeviceSimulator extends EventEmitter {
  private socket: Socket | null = null;
  private sendTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private routeGen: Generator<Waypoint, void, unknown> | null = null;
  private batteryDrainRate = 0;

  readonly state: SimulatorState;

  constructor(private readonly config: SimulatorConfig) {
    super();
    this.state = {
      latitude: config.latitude,
      longitude: config.longitude,
      speed: config.speed,
      heading: config.heading,
      battery: config.battery,
      mode: 'static',
      connected: false,
      sentCount: 0,
    };
  }

  get id(): string {
    return this.config.deviceId;
  }

  // ── Connection ──────────────────────────────────────────────────────────────

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createConnection(this.config.port, this.config.host);

      this.socket.once('connect', () => {
        this.state.connected = true;
        this.emit('connected');
        resolve();
      });

      this.socket.once('error', (err) => {
        this.state.connected = false;
        this.emit('error', err);
        reject(err);
      });

      this.socket.on('close', () => {
        this.state.connected = false;
        this.emit('disconnected');
        if (this.config.reconnect && this.state.mode !== 'offline') {
          this.scheduleReconnect();
        }
      });
    });
  }

  disconnect(): void {
    this.clearTimers();
    this.socket?.destroy();
    this.socket = null;
    this.state.connected = false;
  }

  // ── Mode commands ───────────────────────────────────────────────────────────

  startMoving(speed?: number, heading?: number): void {
    if (speed !== undefined) this.state.speed = clamp(speed, 0, 250);
    if (heading !== undefined)
      this.state.heading = ((heading % 360) + 360) % 360;
    this.setMode('moving');
    this.restartSendLoop();
  }

  stopMoving(): void {
    this.state.speed = 0;
    this.setMode('static');
    this.restartSendLoop();
  }

  startRandom(): void {
    this.state.speed = randomBetween(20, 80);
    this.setMode('random');
    this.restartSendLoop();
  }

  goOffline(): void {
    this.setMode('offline');
    this.clearTimers();
    this.socket?.destroy();
    this.emit('disconnected');
  }

  goOnline(): Promise<void> {
    return this.connect().then(() => {
      this.setMode('static');
      this.restartSendLoop();
    });
  }

  setBattery(level: number): void {
    this.state.battery = clamp(level, 0, 100);
  }

  setBatteryDrain(ratePerUpdate: number): void {
    this.batteryDrainRate = Math.max(0, ratePerUpdate);
  }

  startRoute(route: RouteFile, loop = true): void {
    this.routeGen = this.buildRouteGenerator(route, loop);
    this.setMode('route');
    this.restartSendLoop();
  }

  // ── Internals ───────────────────────────────────────────────────────────────

  private setMode(mode: SimulatorMode): void {
    this.state.mode = mode;
    this.emit('mode', mode);
  }

  private restartSendLoop(): void {
    this.clearSendTimer();
    // Send immediately then start interval
    this.send();
    this.sendTimer = setInterval(() => this.send(), this.config.intervalMs);
  }

  private clearSendTimer(): void {
    if (this.sendTimer !== null) {
      clearInterval(this.sendTimer);
      this.sendTimer = null;
    }
  }

  private clearTimers(): void {
    this.clearSendTimer();
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private send(): void {
    if (!this.socket || !this.state.connected) return;

    this.updatePosition();

    // Battery drain
    if (this.batteryDrainRate > 0) {
      this.state.battery = clamp(
        this.state.battery - this.batteryDrainRate,
        0,
        100,
      );
      if (this.state.battery === 0) {
        console.log(`\n[${this.id}] battery depleted — going offline`);
        this.goOffline();
        return;
      }
    }

    const payload: GpsPayload = {
      uniqueId: this.config.deviceId,
      latitude: parseFloat(this.state.latitude.toFixed(7)),
      longitude: parseFloat(this.state.longitude.toFixed(7)),
      speed: parseFloat(this.state.speed.toFixed(1)),
      heading: parseFloat(this.state.heading.toFixed(1)),
      satellites: Math.round(randomBetween(6, 12)),
      accuracy: parseFloat(randomBetween(2, 8).toFixed(1)),
      valid: true,
      protocol: 'generic',
      raw: {
        battery: Math.round(this.state.battery),
        signal: Math.round(randomBetween(2, 5)),
        simulated: true,
      },
      deviceTime: new Date().toISOString(),
    };

    try {
      this.socket.write(JSON.stringify(payload) + '\n');
      this.state.sentCount++;
      this.emit('sent', payload);
    } catch (err) {
      this.emit('error', err as Error);
    }
  }

  private updatePosition(): void {
    const intervalSec = this.config.intervalMs / 1000;

    switch (this.state.mode) {
      case 'moving': {
        const distanceM = ((this.state.speed * 1000) / 3600) * intervalSec;
        const pos = movePoint(
          this.state.latitude,
          this.state.longitude,
          this.state.heading,
          distanceM,
        );
        this.state.latitude = pos.latitude;
        this.state.longitude = pos.longitude;
        break;
      }

      case 'random': {
        this.state.heading =
          (this.state.heading + randomBetween(-20, 20) + 360) % 360;
        this.state.speed = clamp(
          this.state.speed + randomBetween(-8, 8),
          5,
          130,
        );
        const distanceM = ((this.state.speed * 1000) / 3600) * intervalSec;
        const pos = movePoint(
          this.state.latitude,
          this.state.longitude,
          this.state.heading,
          distanceM,
        );
        this.state.latitude = pos.latitude;
        this.state.longitude = pos.longitude;
        break;
      }

      case 'route': {
        if (this.routeGen) {
          const next = this.routeGen.next();
          if (next.done) {
            this.emit('routeComplete');
            this.stopMoving();
          } else {
            this.state.latitude = next.value.latitude;
            this.state.longitude = next.value.longitude;
            if (next.value.speed !== undefined)
              this.state.speed = next.value.speed;
            if (next.value.heading !== undefined)
              this.state.heading = next.value.heading;
          }
        }
        break;
      }

      default:
        break;
    }
  }

  private *buildRouteGenerator(
    route: RouteFile,
    loop: boolean,
  ): Generator<Waypoint, void, unknown> {
    do {
      for (let i = 0; i < route.waypoints.length; i++) {
        const from = route.waypoints[i];
        const to = route.waypoints[(i + 1) % route.waypoints.length];

        const bearing = bearingBetween(
          from.latitude,
          from.longitude,
          to.latitude,
          to.longitude,
        );
        const distanceM = haversineDistance(
          from.latitude,
          from.longitude,
          to.latitude,
          to.longitude,
        );
        const speed = from.speed ?? this.config.speed;
        const speedMs = (speed * 1000) / 3600;
        const travelMs = (distanceM / speedMs) * 1000;
        const steps = Math.max(1, Math.ceil(travelMs / this.config.intervalMs));

        for (let step = 0; step < steps; step++) {
          const fraction = steps === 1 ? 1 : step / steps;
          const pos = movePoint(
            from.latitude,
            from.longitude,
            bearing,
            distanceM * fraction,
          );
          yield {
            latitude: pos.latitude,
            longitude: pos.longitude,
            speed,
            heading: bearing,
          };
        }

        // Pause at waypoint
        if (from.pauseMs && from.pauseMs > 0) {
          const pauseSteps = Math.ceil(from.pauseMs / this.config.intervalMs);
          for (let p = 0; p < pauseSteps; p++) {
            yield {
              latitude: from.latitude,
              longitude: from.longitude,
              speed: 0,
              heading: bearing,
            };
          }
        }
      }
    } while (loop);
  }

  private scheduleReconnect(delayMs = 5000): void {
    this.reconnectTimer = setTimeout(async () => {
      this.emit('reconnecting');
      try {
        await this.connect();
        if (this.state.mode !== 'offline' && this.state.mode !== 'static') {
          this.restartSendLoop();
        }
      } catch {
        this.scheduleReconnect(Math.min(delayMs * 2, 30_000));
      }
    }, delayMs);
  }
}
