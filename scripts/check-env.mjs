#!/usr/bin/env node
/**
 * check-env.mjs
 * Verifies that a .env file exists and required keys are present.
 * Phase 1 utility — extend as new env vars are introduced.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');
const examplePath = resolve(root, '.env.example');

if (!existsSync(envPath)) {
  console.error('✖ Missing .env file. Copy .env.example to .env first.');
  process.exit(1);
}

const required = readFileSync(examplePath, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split('=')[0]);

const current = new Set(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .map((line) => line.split('=')[0].trim()),
);

const missing = required.filter((key) => !current.has(key));

if (missing.length > 0) {
  console.error(`✖ Missing env keys: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('✔ Environment looks good.');
