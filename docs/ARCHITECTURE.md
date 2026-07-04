# Architecture

> Phase 1 scaffold. This document grows as the platform is built.

## Monorepo layout

```
gps-platform/
├── apps/
│   ├── dashboard/     # Next.js 15 + React 19 + Tailwind + shadcn/ui
│   └── tcp-server/    # Express + Socket.IO server (GPS ingestion)
├── packages/
│   ├── database/      # Drizzle ORM + PostgreSQL + Supabase
│   ├── shared/        # Shared types, Zod schemas, config
│   └── ui/            # Shared UI components + Tailwind preset
├── docker/            # Dockerfiles + docker-compose
├── docs/              # Documentation
└── scripts/           # Tooling / automation scripts
```

## Package manager

- **pnpm** workspaces (`pnpm-workspace.yaml`).

## Path aliases

| Alias           | Target                    |
| --------------- | ------------------------- |
| `@gps/shared`   | `packages/shared/src`     |
| `@gps/database` | `packages/database/src`   |
| `@gps/ui`       | `packages/ui/src`         |
