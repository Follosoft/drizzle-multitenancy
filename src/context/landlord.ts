import type { TenantContext, SwitchTenantTask, DrizzleDatabase } from '../types.js'
import { forgetCurrent, makeCurrent } from './tenant-context.js'

/**
 * Temporarily forget the current tenant, run a callback against
 * the landlord DB, then restore the original tenant.
 */
export async function landlordExecute<T>(
  ctx: TenantContext,
  tasks: SwitchTenantTask[],
  callback: (landlordDb: DrizzleDatabase) => T | Promise<T>,
): Promise<T> {
  const previousTenant = ctx.tenant
  if (previousTenant) {
    await forgetCurrent(ctx, tasks)
  }
  try {
    return await callback(ctx.landlordDb)
  } finally {
    if (previousTenant) {
      await makeCurrent(previousTenant, ctx, tasks)
    }
  }
}
