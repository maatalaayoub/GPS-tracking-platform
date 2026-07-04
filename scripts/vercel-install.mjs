#!/usr/bin/env node
/**
 * Vercel install script.
 *
 * The vendor/ overrides in pnpm-workspace.yaml point to Windows-specific
 * native binaries (.tgz files packed on Windows). They exist for local
 * development where the npm registry is unreliable, but they cause an
 * ENOTDIR crash on Vercel's Linux machines.
 *
 * This script writes a clean pnpm-workspace.yaml (no overrides) so that
 * pnpm downloads cross-platform packages from the npm registry, then runs
 * pnpm install.
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Always operate from the workspace root regardless of where Vercel calls
// this script from (e.g. apps/dashboard when Root Directory is set there).
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(workspaceRoot);

writeFileSync(
  'pnpm-workspace.yaml',
  `packages:
  - "apps/*"
  - "packages/*"

allowBuilds:
  esbuild: true
  sharp: true
  unrs-resolver: true
`
);

console.log('Removed Windows-only vendor overrides from pnpm-workspace.yaml');

execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' });
