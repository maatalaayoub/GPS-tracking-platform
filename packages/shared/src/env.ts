import { z } from 'zod';

/**
 * Environment variables consumed by the TCP / Socket.IO server.
 * Validated at startup so misconfiguration fails fast.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // TCP / Socket.IO
  TCP_SERVER_PORT: z.coerce.number().int().positive().default(4000),
  TCP_LISTEN_PORT: z.coerce.number().int().positive().default(5000),
  SOCKET_CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Database (required)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Supabase (required for admin/backend usage)
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Environment variables consumed by the Next.js dashboard.
 * Only NEXT_PUBLIC_* vars are exposed to the browser.
 */
export const dashboardEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});
export type DashboardEnv = z.infer<typeof dashboardEnvSchema>;

/**
 * Parse and validate an env object with a Zod schema. Throws a readable
 * error listing every invalid/missing variable when validation fails.
 */
export function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined> = process.env,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return result.data;
}
