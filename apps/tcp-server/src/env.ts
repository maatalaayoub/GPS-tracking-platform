import { resolve } from 'node:path';

import { config } from 'dotenv';

import { parseEnv, serverEnvSchema } from '@gps/shared';

// Load monorepo-root .env before validating.
config({ path: resolve(process.cwd(), '../../.env') });

export const env = parseEnv(serverEnvSchema);
