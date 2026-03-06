# Changelog

## 0.2.0 (2026-03-06)

### Breaking Changes

- `defineConfig()` now requires `createDatabaseClient` — a `DatabaseClientFactory` function
- `createSwitchDatabaseTask()` now takes a `DatabaseClientFactory` argument

### Added

- Provider-agnostic architecture — core uses `DrizzleDatabase` type, no longer hardcoded to Neon
- `neonClientFactory()` — built-in Neon provider (`src/providers/neon.ts`)
- `DrizzleDatabase` and `DatabaseClientFactory` type exports
- `@neondatabase/serverless` is now an optional peer dependency
- CONTRIBUTING.md with Spatie-inspired contributor guidelines
- GitHub issue templates (bug report, feature request)
- GitHub PR template

## 0.1.0 (2026-03-06)

Initial release.

- `defineConfig()` with pluggable finders and tasks
- Database strategies: separate-db (`createSwitchDatabaseTask`) and shared-db (`createTenantScopeTask`)
- Tenant finders: subdomain, header, JWT, composite
- `withTenant()` HOF middleware and `needsTenant()` type guard
- Collection utilities: `eachCurrent()`, `mapCurrent()`, `filterCurrent()`
- Job helpers: `serializeTenantPayload()`, `wrapDispatcher()`, `withTenantJob()`
- `landlordExecute()` for cross-tenant queries
- Drizzle `tenants` table schema
