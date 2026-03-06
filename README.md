# @follosoft/drizzle-multitenancy

Multi-tenancy for **Drizzle ORM** — inspired by [Spatie's laravel-multitenancy](https://github.com/spatie/laravel-multitenancy), built for TypeScript + serverless edge functions.

Provider-agnostic: works with any Postgres-compatible Drizzle driver. Ships with a built-in **Neon** provider, ready to add Supabase, PlanetScale, or plain `node-postgres`.

## Installation

```bash
npm install @follosoft/drizzle-multitenancy
```

For Neon (built-in provider):

```bash
npm install drizzle-orm @neondatabase/serverless
```

## Quick Start

```ts
import {
  defineConfig, withTenant, needsTenant,
  createHeaderFinder, createSubdomainFinder,
  createSwitchDatabaseTask, createSwitchConfigTask,
  neonClientFactory,
} from '@follosoft/drizzle-multitenancy'

const tenancy = defineConfig({
  landlordDatabaseUrl: process.env.DATABASE_URL!,
  databaseStrategy: 'separate-db',
  createDatabaseClient: neonClientFactory(),
  tenantFinders: [
    createHeaderFinder(),
    createSubdomainFinder({ baseDomain: 'example.com' }),
  ],
  switchTenantTasks: [
    createSwitchDatabaseTask(neonClientFactory()),
    createSwitchConfigTask(),
  ],
})

export default withTenant(tenancy, async (req, ctx) => {
  needsTenant(ctx) // throws if no tenant resolved

  const data = await ctx.db.select().from(users).limit(10)
  return Response.json({ tenant: ctx.tenant.name, data })
})
```

## Database Providers

The package is **provider-agnostic**. You supply a `DatabaseClientFactory` — a function that takes a connection URL and returns a Drizzle database client.

### Neon (built-in)

```ts
import { neonClientFactory } from '@follosoft/drizzle-multitenancy'

defineConfig({
  createDatabaseClient: neonClientFactory(),
  // ...
})
```

### Custom provider

Implement your own factory to use any Drizzle-compatible Postgres driver:

```ts
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import type { DatabaseClientFactory } from '@follosoft/drizzle-multitenancy'

const nodePgFactory: DatabaseClientFactory = (url) => {
  const pool = new pg.Pool({ connectionString: url })
  return drizzle(pool)
}

defineConfig({
  createDatabaseClient: nodePgFactory,
  // ...
})
```

This makes it straightforward to add support for Supabase, PlanetScale, Turso, or any future Drizzle driver.

## Concepts

### Tenant

A tenant represents an organization/customer with its own database (or scoped data). The built-in `tenants` Drizzle table schema is provided for the landlord database:

```ts
import { tenants } from '@follosoft/drizzle-multitenancy'
```

### Database Strategies

**Separate DB** (`createSwitchDatabaseTask`) — Each tenant gets its own database. A new Drizzle client is created per request using the configured provider.

**Shared DB** (`createTenantScopeTask`) — Single database, rows scoped by `tenant_id` column. Use the `scopedWhere()` helper:

```ts
import { createTenantScopeTask, scopedWhere } from '@follosoft/drizzle-multitenancy'

// In your handler:
const rows = await ctx.db
  .select()
  .from(orders)
  .where(scopedWhere(ctx, orders.tenantId))
```

### Tenant Finders

Finders resolve the current tenant from the incoming request:

| Finder | Resolves from |
|--------|--------------|
| `createHeaderFinder()` | `X-Tenant-ID` header (configurable) |
| `createSubdomainFinder({ baseDomain })` | Subdomain of the hostname |
| `createJwtFinder()` | JWT `tenant_id` claim (configurable) |
| `createCompositeFinder(finders)` | First match from a chain of finders |

### Switch Tasks

Tasks run when a tenant becomes current (and in reverse when forgotten):

| Task | Purpose |
|------|---------|
| `createSwitchDatabaseTask(factory)` | Creates a new Drizzle client for the tenant's DB |
| `createSwitchConfigTask()` | Copies tenant config/locale into context |
| `createTenantScopeTask()` | Sets `tenantId` metadata for shared-DB scoping |

You can create custom tasks by implementing the `SwitchTenantTask` interface.

### Middleware

- **`withTenant(tenancy, handler)`** — HOF that wraps a request handler with automatic tenant resolution and cleanup.
- **`needsTenant(ctx)`** — Type guard that asserts a tenant exists on the context, narrowing the type to `ResolvedTenantContext`.

### Collection Utilities

Iterate over multiple tenants:

```ts
import { eachCurrent, mapCurrent, filterCurrent } from '@follosoft/drizzle-multitenancy'

// Run a migration for every tenant
await eachCurrent(landlordDb, tasks, async (ctx) => {
  await ctx.db.execute(sql`ALTER TABLE ...`)
})

// Collect stats from each tenant
const stats = await mapCurrent(landlordDb, tasks, async (ctx) => {
  const [row] = await ctx.db.select({ count: sql`count(*)` }).from(users)
  return { tenant: ctx.tenant!.name, users: row.count }
})
```

### Job Serialization

Preserve tenant context across async job boundaries:

```ts
import { wrapDispatcher, withTenantJob } from '@follosoft/drizzle-multitenancy'

// Producer: inject tenant into job payload
const dispatch = wrapDispatcher(ctx.tenant, enqueueJob)
dispatch({ orderId: '123' }) // payload includes tenantId + tenantDatabaseUrl

// Consumer: restore tenant context in job handler
export const handler = withTenantJob(landlordDb, tasks, async (payload, ctx) => {
  // ctx.tenant and ctx.db are set
  await ctx.db.insert(notifications).values({ ... })
})
```

### Landlord Execute

Temporarily drop tenant context to run queries against the landlord DB:

```ts
import { landlordExecute } from '@follosoft/drizzle-multitenancy'

const allTenants = await landlordExecute(ctx, tasks, async (db) => {
  return db.select().from(tenants)
})
```

## API Reference

### Config

- `defineConfig(config: TenancyConfig): Tenancy`

### Types

- `Tenant` — Tenant record
- `TenantContext` — Request-scoped context (tenant may be null)
- `ResolvedTenantContext` — Context with guaranteed non-null tenant/db
- `DrizzleDatabase` — Provider-agnostic Drizzle Postgres database type
- `DatabaseClientFactory` — `(url: string) => DrizzleDatabase`
- `SwitchTenantTask` — Plugin interface for `makeCurrent`/`forgetCurrent`
- `TenantFinder` — Plugin interface for `findForRequest`
- `TenancyConfig` — Configuration object

### Providers

- `neonClientFactory()` — Built-in Neon provider

### Errors

- `NoCurrentTenantError` — Thrown by `needsTenant()` when no tenant is set
- `TenantNotFoundError` — Thrown when a tenant lookup fails (e.g., in job handler)

## License

MIT
