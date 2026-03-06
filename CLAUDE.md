# @follosoft/drizzle-multitenancy

## Overview

Open-source multi-tenancy package for Drizzle ORM + Neon, inspired by Spatie's `laravel-multitenancy`. Designed for stateless serverless edge functions.

**npm:** `@follosoft/drizzle-multitenancy`
**GitHub:** `github.com/Follosoft/drizzle-multitenancy`
**License:** MIT

## Tech Stack

- TypeScript (ES2022, strict mode)
- Drizzle ORM (peer dependency)
- @neondatabase/serverless (peer dependency)
- Vitest for testing
- Plain `tsc` for builds (no bundler)

## Commands

```bash
npm run build       # Compile TypeScript → dist/
npm test            # Run all tests (vitest)
npm run test:watch  # Watch mode
```

## Architecture

```
src/
├── index.ts                    # Barrel export (public API)
├── types.ts                    # Tenant, TenantContext, SwitchTenantTask, TenantFinder
├── config.ts                   # defineConfig() → Tenancy object
├── errors.ts                   # NoCurrentTenantError, TenantNotFoundError
├── schema/tenants.ts           # Drizzle pgTable for landlord DB
├── context/
│   ├── tenant-context.ts       # createContext(), makeCurrent(), forgetCurrent()
│   └── landlord.ts             # landlordExecute()
├── finders/
│   ├── subdomain-finder.ts     # Resolve from hostname
│   ├── header-finder.ts        # Resolve from X-Tenant-ID header
│   ├── jwt-finder.ts           # Resolve from JWT claim
│   └── composite-finder.ts     # Chain finders (first match wins)
├── tasks/
│   ├── tasks-collection.ts     # Ordered task runner
│   ├── switch-database-task.ts # Separate-DB: new Drizzle client per tenant
│   ├── switch-config-task.ts   # Copy tenant config/locale to context
│   └── tenant-scope-task.ts    # Shared-DB: tenant_id column scoping
├── middleware/
│   ├── needs-tenant.ts         # Type guard: asserts ResolvedTenantContext
│   └── with-tenant.ts          # HOF: wrap handler with tenant resolution
├── collection/
│   └── tenant-collection.ts    # eachCurrent(), mapCurrent(), filterCurrent()
└── jobs/
    ├── tenant-aware.ts         # Payload serialization types
    ├── job-dispatcher.ts       # wrapDispatcher()
    └── job-handler.ts          # withTenantJob()
```

## Key Concepts

**Database strategies** (pluggable via tasks):
- `separate-db` — Each tenant has its own Neon database. `SwitchDatabaseTask` creates a new Drizzle client per request.
- `shared-db` — Single database, rows scoped by `tenant_id`. `TenantScopeTask` sets metadata for filtering.

**Request lifecycle:**
1. `withTenant()` creates a fresh `TenantContext`
2. Finders cascade until one resolves a tenant from the request
3. Switch tasks run (`makeCurrent`) — sets up DB client, config, etc.
4. Handler runs with `ctx.tenant`, `ctx.db`, `ctx.config`
5. Cleanup via `forgetCurrent` (always runs, even on error)

## Conventions

- All exports go through `src/index.ts` — no deep imports
- Factory functions (`create*`) over classes
- Every finder queries the `tenants` table in the landlord DB
- Tasks run in order on `makeCurrent`, reverse order on `forgetCurrent`
- `TenantContext` is always passed explicitly (no global state)
- Peer dependencies only: drizzle-orm, @neondatabase/serverless

## Testing

- All tests in `tests/` using vitest
- `fakeLandlordDb()` and `fakeQueryableDb()` stubs in `tests/helpers.ts`
- `spyTask()` for recording task invocations
- `staticFinder()` for deterministic finder behavior
- No real DB needed for unit tests

## Publishing

```bash
npm publish --access public
```

Requires npm login to `@follosoft` org. 2FA enabled.
