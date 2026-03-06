import { eq } from 'drizzle-orm'
import type { TenantContext, SwitchTenantTask, DrizzleDatabase } from '../types.js'
import type { TenantAwarePayload } from './tenant-aware.js'
import { tenants } from '../schema/tenants.js'
import { createContext, makeCurrent, forgetCurrent } from '../context/tenant-context.js'
import { TenantNotFoundError } from '../errors.js'

type JobCallback = (payload: TenantAwarePayload, ctx: TenantContext) => void | Promise<void>

/**
 * Wraps a job handler to restore tenant context from the payload.
 *
 * Usage:
 *   export const handler = withTenantJob(landlordDb, tasks, async (payload, ctx) => {
 *     // ctx.tenant and ctx.db are set
 *     await ctx.db.insert(orders).values(...)
 *   })
 */
export function withTenantJob(
  landlordDb: DrizzleDatabase,
  tasks: SwitchTenantTask[],
  callback: JobCallback,
): (payload: TenantAwarePayload) => Promise<void> {
  return async (payload: TenantAwarePayload) => {
    const rows = await landlordDb
      .select()
      .from(tenants)
      .where(eq(tenants.id, payload.tenantId))
      .limit(1)

    if (rows.length === 0) {
      throw new TenantNotFoundError(payload.tenantId)
    }

    const row = rows[0]
    const tenant = {
      id: row.id,
      name: row.name,
      subdomain: row.subdomain,
      databaseUrl: row.databaseUrl,
      locale: row.locale,
      status: row.status as 'active' | 'suspended' | 'trial',
      config: (row.config ?? {}) as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }

    const ctx = createContext(landlordDb)
    await makeCurrent(tenant, ctx, tasks)
    try {
      await callback(payload, ctx)
    } finally {
      await forgetCurrent(ctx, tasks)
    }
  }
}
