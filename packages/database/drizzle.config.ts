import { resolve } from 'node:path';

import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load the monorepo-root .env so DATABASE_URL is available to drizzle-kit.
config({ path: resolve(__dirname, '../../.env') });

export default {
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
} satisfies Config;
