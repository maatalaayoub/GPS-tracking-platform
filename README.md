# GPS Platform

Production-ready **pnpm monorepo** for a GPS tracking platform.

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm build
```

## Workspace

| Package             | Path                 | Stack                                       |
| ------------------- | -------------------- | ------------------------------------------- |
| `@gps/dashboard`    | `apps/dashboard`     | Next.js 15, React 19, TailwindCSS, shadcn/ui |
| `@gps/tcp-server`   | `apps/tcp-server`    | Express, Socket.IO                          |
| `@gps/database`     | `packages/database`  | Drizzle ORM, PostgreSQL, Supabase           |
| `@gps/shared`       | `packages/shared`    | Zod, dotenv                                 |
| `@gps/ui`           | `packages/ui`        | shadcn/ui, Tailwind preset                  |

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Run all packages in dev mode         |
| `pnpm build`        | Build all packages (topological)     |
| `pnpm lint`         | Lint all packages                    |
| `pnpm typecheck`    | Type-check all packages              |
| `pnpm format`       | Format the codebase with Prettier    |

## Docker

```bash
docker compose -f docker/docker-compose.yml up --build
```

> This is **Phase 1** (scaffold only). Application logic is added in later phases.
