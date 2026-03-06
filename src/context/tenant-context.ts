import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { Tenant, TenantContext, SwitchTenantTask } from '../types.js'

export function createContext(landlordDb: NeonHttpDatabase): TenantContext {
  return {
    tenant: null,
    db: null,
    landlordDb,
    config: null,
    metadata: {},
  }
}

export async function makeCurrent(
  tenant: Tenant,
  ctx: TenantContext,
  tasks: SwitchTenantTask[],
): Promise<void> {
  ctx.tenant = tenant
  for (const task of tasks) {
    await task.makeCurrent(tenant, ctx)
  }
}

export async function forgetCurrent(
  ctx: TenantContext,
  tasks: SwitchTenantTask[],
): Promise<void> {
  for (const task of [...tasks].reverse()) {
    await task.forgetCurrent(ctx)
  }
  ctx.tenant = null
  ctx.db = null
  ctx.config = null
  ctx.metadata = {}
}
