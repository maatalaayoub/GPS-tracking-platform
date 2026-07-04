import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Load environment variables from the monorepo root .env so Next.js build
 * can embed NEXT_PUBLIC_* vars in the client bundle and render server
 * components that depend on Supabase keys.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const raw = readFileSync(resolve(__dirname, '../../.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  }
} catch {
  // .env not present — expected in CI where vars come from the environment.
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gps/ui', '@gps/shared'],
};

export default nextConfig;
