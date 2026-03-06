import type { Tenant, TenantContext, SwitchTenantTask } from '../types.js'

/**
 * Copies the tenant's config into ctx.config and sets locale/timezone metadata.
 */
export function createSwitchConfigTask(): SwitchTenantTask {
  return {
    makeCurrent(tenant: Tenant, ctx: TenantContext) {
      ctx.config = { ...tenant.config }
      ctx.metadata.locale = tenant.locale
      ctx.metadata.tenantId = tenant.id
    },
    forgetCurrent(ctx: TenantContext) {
      ctx.config = null
      delete ctx.metadata.locale
      delete ctx.metadata.tenantId
    },
  }
}
