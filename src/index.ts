// Types
export type {
  Tenant,
  TenantContext,
  ResolvedTenantContext,
  SwitchTenantTask,
  TenantFinder,
  TenancyConfig,
  DrizzleDatabase,
  DatabaseClientFactory,
} from './types.js'

// Config
export { defineConfig } from './config.js'
export type { Tenancy } from './config.js'

// Errors
export { NoCurrentTenantError, TenantNotFoundError } from './errors.js'

// Context
export { createContext, makeCurrent, forgetCurrent } from './context/tenant-context.js'
export { landlordExecute } from './context/landlord.js'

// Finders
export { createSubdomainFinder } from './finders/subdomain-finder.js'
export type { SubdomainFinderOptions } from './finders/subdomain-finder.js'
export { createHeaderFinder } from './finders/header-finder.js'
export type { HeaderFinderOptions } from './finders/header-finder.js'
export { createJwtFinder } from './finders/jwt-finder.js'
export type { JwtFinderOptions } from './finders/jwt-finder.js'
export { createCompositeFinder } from './finders/composite-finder.js'

// Tasks
export { createTasksCollection } from './tasks/tasks-collection.js'
export { createSwitchDatabaseTask } from './tasks/switch-database-task.js'
export { createSwitchConfigTask } from './tasks/switch-config-task.js'
export { createTenantScopeTask, scopedWhere } from './tasks/tenant-scope-task.js'

// Middleware
export { needsTenant } from './middleware/needs-tenant.js'
export { withTenant } from './middleware/with-tenant.js'

// Collection
export { eachCurrent, mapCurrent, filterCurrent } from './collection/tenant-collection.js'

// Jobs
export { serializeTenantPayload, extractTenantFromPayload } from './jobs/tenant-aware.js'
export type { TenantAwarePayload } from './jobs/tenant-aware.js'
export { wrapDispatcher } from './jobs/job-dispatcher.js'
export { withTenantJob } from './jobs/job-handler.js'

// Providers
export { neonClientFactory } from './providers/neon.js'

// Schema
export { tenants } from './schema/tenants.js'
