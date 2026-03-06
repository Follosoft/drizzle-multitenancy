import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { Tenant, TenantContext, SwitchTenantTask } from '../types.js'

/**
 * Separate-DB strategy: creates a new Drizzle client pointing at the tenant's database.
 */
export function createSwitchDatabaseTask(): SwitchTenantTask {
  return {
    makeCurrent(tenant: Tenant, ctx: TenantContext) {
      const sql = neon(tenant.databaseUrl)
      ctx.db = drizzle(sql)
    },
    forgetCurrent(ctx: TenantContext) {
      ctx.db = null
    },
  }
}
