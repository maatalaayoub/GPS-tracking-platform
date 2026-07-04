import { DeviceSimulator } from './simulator.js';
import type {
  GpsPayload,
  RouteFile,
  SimulatorConfig,
  SimulatorMode,
} from './types.js';
import { movePoint } from './movement.js';

export interface RunnerOptions {
  count: number;
  host: string;
  port: number;
  mode: SimulatorMode;
  baseLat: number;
  baseLng: number;
  intervalMs: number;
  route?: RouteFile;
  loop?: boolean;
  drain?: number;
}

/**
 * Runs multiple DeviceSimulator instances concurrently, each with a slightly
 * offset starting position so they don't overlap on the map.
 */
export class MultiRunner {
  private simulators: DeviceSimulator[] = [];

  constructor(private readonly opts: RunnerOptions) {}

  async start(): Promise<void> {
    const { count, host, port, mode, intervalMs, route, loop, drain } =
      this.opts;

    for (let i = 0; i < count; i++) {
      // Spread devices ~200 m apart in a circle
      const angle = (360 / count) * i;
      const pos = movePoint(this.opts.baseLat, this.opts.baseLng, angle, 200);

      const config: SimulatorConfig = {
        deviceId: `SIM-${String(i + 1).padStart(3, '0')}`,
        host,
        port,
        latitude: pos.latitude,
        longitude: pos.longitude,
        speed: 50 + i * 10,
        heading: angle,
        battery: 100 - i * 5,
        intervalMs,
        reconnect: true,
      };

      const sim = new DeviceSimulator(config);

      sim.on('connected', () => {
        console.log(`  [${sim.id}] connected`);
        if (drain) sim.setBatteryDrain(drain);

        switch (mode) {
          case 'random':
            sim.startRandom();
            break;
          case 'moving':
            sim.startMoving();
            break;
          case 'route':
            if (route) sim.startRoute(route, loop ?? true);
            break;
          default:
            sim.startMoving();
        }
      });

      sim.on('sent', (p: GpsPayload) => {
        process.stdout.write(
          `\r  [${sim.id}] lat=${p.latitude.toFixed(5)}  lng=${p.longitude.toFixed(5)}  spd=${p.speed.toFixed(0)}km/h  bat=${p.raw.battery}%  #${sim.state.sentCount}   `,
        );
      });

      sim.on('disconnected', () => console.log(`\n  [${sim.id}] disconnected`));
      sim.on('reconnecting', () =>
        console.log(`\n  [${sim.id}] reconnecting…`),
      );
      sim.on('error', (err) =>
        console.error(`\n  [${sim.id}] error: ${err.message}`),
      );

      this.simulators.push(sim);
    }

    await Promise.allSettled(this.simulators.map((s) => s.connect()));
  }

  stop(): void {
    this.simulators.forEach((s) => s.disconnect());
  }
}
