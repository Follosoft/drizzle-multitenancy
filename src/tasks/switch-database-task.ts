import type { Tenant, TenantContext, SwitchTenantTask, DatabaseClientFactory } from '../types.js'

/**
 * Separate-DB strategy: creates a new Drizzle client pointing at the tenant's database.
 */
export function createSwitchDatabaseTask(createClient: DatabaseClientFactory): SwitchTenantTask {
  return {
    makeCurrent(tenant: Tenant, ctx: TenantContext) {
      ctx.db = createClient(tenant.databaseUrl)
    },
    forgetCurrent(ctx: TenantContext) {
      ctx.db = null
    },
  }
}
