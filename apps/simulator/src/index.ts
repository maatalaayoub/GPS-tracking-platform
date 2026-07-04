import { createInterface } from 'node:readline';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { config as loadEnv } from 'dotenv';

import { DeviceSimulator } from './simulator.js';
import { MultiRunner } from './runner.js';
import type { CliArgs, RouteFile, SimulatorMode } from './types.js';

// ── Load env ──────────────────────────────────────────────────────────────────

loadEnv({ path: resolve(process.cwd(), '../../.env') });

// ── Parse CLI args ────────────────────────────────────────────────────────────

function parseArgs(): CliArgs {
  const argv = process.argv.slice(2);
  const get = (flag: string, fallback: string): string => {
    const idx = argv.indexOf(flag);
    return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : fallback;
  };
  const has = (flag: string): boolean => argv.includes(flag);

  return {
    deviceId: get('--id', process.env['GPS_SIMULATOR_ID'] ?? 'SIM-001'),
    host: get('--host', process.env['GPS_SIMULATOR_HOST'] ?? 'localhost'),
    port: parseInt(
      get('--port', process.env['GPS_SIMULATOR_PORT'] ?? '5000'),
      10,
    ),
    lat: parseFloat(
      get('--lat', process.env['GPS_SIMULATOR_LAT'] ?? '36.7372'),
    ),
    lng: parseFloat(get('--lng', process.env['GPS_SIMULATOR_LNG'] ?? '3.0868')),
    speed: parseFloat(get('--speed', '50')),
    heading: parseFloat(get('--heading', '0')),
    battery: parseFloat(get('--battery', '100')),
    intervalMs: parseInt(get('--interval', '3000'), 10),
    mode: get('--mode', 'moving') as SimulatorMode,
    multi: has('--multi'),
    count: parseInt(get('--count', '3'), 10),
    routeFile: has('--route') ? get('--route', '') : null,
    loop: has('--loop'),
    drain: parseFloat(get('--drain', '0')),
    interactive: !has('--no-interactive') && process.stdin.isTTY !== false,
  };
}

// ── Route loader ──────────────────────────────────────────────────────────────

function loadRoute(filePath: string): RouteFile {
  const abs = existsSync(filePath)
    ? filePath
    : resolve(process.cwd(), 'routes', filePath);

  if (!existsSync(abs)) {
    throw new Error(`Route file not found: ${filePath}`);
  }
  return JSON.parse(readFileSync(abs, 'utf8')) as RouteFile;
}

// ── Single-device interactive CLI ─────────────────────────────────────────────

function startInteractiveCli(sim: DeviceSimulator): void {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `[${sim.id}]> `,
  });

  const help = () => {
    console.log(`
Commands:
  move [speed] [heading]  – Start moving (km/h, degrees)
  stop                    – Stop (speed = 0)
  random                  – Start random movement
  offline                 – Simulate device offline
  online                  – Reconnect after offline
  battery <0-100>         – Set battery level
  drain [rate]            – Set battery drain rate % per update (0 = off)
  route <file>            – Load & replay a route file
  status                  – Print current state
  help                    – Show this help
  exit / quit             – Stop and exit
    `);
  };

  rl.prompt();

  rl.on('line', async (line) => {
    const [cmd, ...parts] = line.trim().split(/\s+/);

    switch (cmd) {
      case 'move':
        sim.startMoving(
          parts[0] ? parseFloat(parts[0]) : undefined,
          parts[1] ? parseFloat(parts[1]) : undefined,
        );
        console.log(
          `Moving at ${sim.state.speed.toFixed(0)} km/h → ${sim.state.heading.toFixed(0)}°`,
        );
        break;

      case 'stop':
        sim.stopMoving();
        console.log('Stopped.');
        break;

      case 'random':
        sim.startRandom();
        console.log('Random movement started.');
        break;

      case 'offline':
        sim.goOffline();
        console.log('Device offline.');
        break;

      case 'online':
        try {
          await sim.goOnline();
          console.log('Reconnected.');
        } catch (e) {
          console.error('Reconnect failed:', (e as Error).message);
        }
        break;

      case 'battery':
        if (parts[0]) {
          sim.setBattery(parseFloat(parts[0]));
          console.log(`Battery set to ${sim.state.battery}%`);
        }
        break;

      case 'drain':
        sim.setBatteryDrain(parts[0] ? parseFloat(parts[0]) : 0.2);
        console.log(`Battery drain: ${parts[0] ?? 0.2}% per update`);
        break;

      case 'route': {
        if (!parts[0]) {
          console.error('Usage: route <file>');
          break;
        }
        try {
          const route = loadRoute(parts[0]);
          sim.startRoute(route, true);
          console.log(`Replaying route: ${route.name}`);
        } catch (e) {
          console.error((e as Error).message);
        }
        break;
      }

      case 'status': {
        const s = sim.state;
        console.log(
          `  id      : ${sim.id}\n` +
            `  mode    : ${s.mode}\n` +
            `  lat     : ${s.latitude.toFixed(6)}\n` +
            `  lng     : ${s.longitude.toFixed(6)}\n` +
            `  speed   : ${s.speed.toFixed(1)} km/h\n` +
            `  heading : ${s.heading.toFixed(1)}°\n` +
            `  battery : ${s.battery.toFixed(1)}%\n` +
            `  sent    : ${s.sentCount} packets\n` +
            `  online  : ${s.connected}`,
        );
        break;
      }

      case 'help':
      case '?':
        help();
        break;

      case 'exit':
      case 'quit':
        sim.disconnect();
        rl.close();
        process.exit(0);

      case '':
        break;

      default:
        console.log(`Unknown command: "${cmd}". Type "help" for commands.`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    sim.disconnect();
    process.exit(0);
  });

  help();
  rl.prompt();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs();

  console.log('\n🛰  GPS Platform Simulator');
  console.log(`   TCP server : ${args.host}:${args.port}`);
  console.log(`   Interval   : ${args.intervalMs} ms`);
  console.log('');

  // ── Multi-device mode ──────────────────────────────────────────────────────
  if (args.multi) {
    let route: RouteFile | undefined;
    if (args.routeFile) {
      route = loadRoute(args.routeFile);
      console.log(
        `   Route      : ${route.name} (${route.waypoints.length} waypoints)`,
      );
    }

    console.log(`   Spawning ${args.count} devices in "${args.mode}" mode…\n`);

    const runner = new MultiRunner({
      count: args.count,
      host: args.host,
      port: args.port,
      mode: args.mode,
      baseLat: args.lat,
      baseLng: args.lng,
      intervalMs: args.intervalMs,
      route,
      loop: args.loop,
      drain: args.drain || 0,
    });

    await runner.start();

    const stop = () => {
      console.log('\nShutting down…');
      runner.stop();
      process.exit(0);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    return;
  }

  // ── Single-device mode ─────────────────────────────────────────────────────
  let route: RouteFile | undefined;
  if (args.routeFile) {
    route = loadRoute(args.routeFile);
    console.log(
      `   Route      : ${route.name} (${route.waypoints.length} waypoints, loop=${args.loop})`,
    );
  }

  const sim = new DeviceSimulator({
    deviceId: args.deviceId,
    host: args.host,
    port: args.port,
    latitude: args.lat,
    longitude: args.lng,
    speed: args.speed,
    heading: args.heading,
    battery: args.battery,
    intervalMs: args.intervalMs,
    reconnect: true,
  });

  sim.on('sent', (p) => {
    if (!args.interactive) {
      console.log(
        `[${sim.id}] lat=${p.latitude}  lng=${p.longitude}  spd=${p.speed}km/h  bat=${p.raw.battery}%  #${sim.state.sentCount}`,
      );
    }
  });

  sim.on('disconnected', () => console.log(`\n[${sim.id}] disconnected`));
  sim.on('reconnecting', () => console.log(`[${sim.id}] reconnecting…`));
  sim.on('error', (err) => console.error(`[${sim.id}] error: ${err.message}`));
  sim.on('routeComplete', () => console.log(`[${sim.id}] route completed`));

  console.log(`   Device     : ${args.deviceId}`);
  console.log(`   Start pos  : ${args.lat}, ${args.lng}`);
  console.log(`   Mode       : ${route ? 'route' : args.mode}\n`);

  try {
    await sim.connect();
    console.log(`[${sim.id}] ✓ connected to ${args.host}:${args.port}\n`);
  } catch (err) {
    console.error(`[${sim.id}] ✖ failed to connect: ${(err as Error).message}`);
    console.error(
      '  Is the TCP server running? (pnpm --filter @gps/tcp-server dev)',
    );
    process.exit(1);
  }

  if (args.drain > 0) sim.setBatteryDrain(args.drain);

  if (route) {
    sim.startRoute(route, args.loop);
  } else {
    switch (args.mode) {
      case 'moving':
        sim.startMoving(args.speed, args.heading);
        break;
      case 'random':
        sim.startRandom();
        break;
      case 'static':
        sim.startMoving(0);
        break;
      default:
        sim.startMoving(args.speed, args.heading);
    }
  }

  if (args.interactive) {
    startInteractiveCli(sim);
  } else {
    const stop = () => {
      sim.disconnect();
      process.exit(0);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
