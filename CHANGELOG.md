# Changelog

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
