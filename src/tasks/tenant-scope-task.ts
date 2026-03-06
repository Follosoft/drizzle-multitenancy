import { eq } from 'drizzle-orm'
import type { Column } from 'drizzle-orm'
import type { Tenant, TenantContext, SwitchTenantTask } from '../types.js'

/**
 * Shared-DB strategy: reuses the landlord DB connection and sets
 * ctx.metadata.tenantId for query scoping.
 */
export function createTenantScopeTask(): SwitchTenantTask {
  return {
    makeCurrent(tenant: Tenant, ctx: TenantContext) {
      ctx.db = ctx.landlordDb
      ctx.metadata.tenantId = tenant.id
    },
    forgetCurrent(ctx: TenantContext) {
      ctx.db = null
      delete ctx.metadata.tenantId
    },
  }
}

/**
 * Helper: returns a Drizzle `eq()` condition scoped to the current tenant.
 *
 * Usage: `db.select().from(table).where(scopedWhere(ctx, table.tenantId))`
 */
export function scopedWhere(ctx: TenantContext, tenantIdColumn: Column) {
  const tenantId = ctx.metadata.tenantId as string | undefined
  if (!tenantId) {
    throw new Error('No tenantId in context. Is TenantScopeTask configured?')
  }
  return eq(tenantIdColumn, tenantId)
}
