import type { Tenant, TenantContext, SwitchTenantTask, DrizzleDatabase } from '../types.js'
import { createContext, makeCurrent, forgetCurrent } from '../context/tenant-context.js'
import { tenants } from '../schema/tenants.js'

/**
 * Iterate over all (or a subset of) tenants, running a callback with each as current.
 */
export async function eachCurrent(
  landlordDb: DrizzleDatabase,
  tasks: SwitchTenantTask[],
  callback: (ctx: TenantContext) => void | Promise<void>,
  tenantList?: Tenant[],
): Promise<void> {
  const list = tenantList ?? (await fetchAllTenants(landlordDb))

  for (const tenant of list) {
    const ctx = createContext(landlordDb)
    await makeCurrent(tenant, ctx, tasks)
    try {
      await callback(ctx)
    } finally {
      await forgetCurrent(ctx, tasks)
    }
  }
}

/**
 * Map over all (or a subset of) tenants, collecting results.
 */
export async function mapCurrent<T>(
  landlordDb: DrizzleDatabase,
  tasks: SwitchTenantTask[],
  callback: (ctx: TenantContext) => T | Promise<T>,
  tenantList?: Tenant[],
): Promise<T[]> {
  const list = tenantList ?? (await fetchAllTenants(landlordDb))
  const results: T[] = []

  for (const tenant of list) {
    const ctx = createContext(landlordDb)
    await makeCurrent(tenant, ctx, tasks)
    try {
      results.push(await callback(ctx))
    } finally {
      await forgetCurrent(ctx, tasks)
    }
  }

  return results
}

/**
 * Filter tenants based on a predicate run with each tenant as current.
 */
export async function filterCurrent(
  landlordDb: DrizzleDatabase,
  tasks: SwitchTenantTask[],
  predicate: (ctx: TenantContext) => boolean | Promise<boolean>,
  tenantList?: Tenant[],
): Promise<Tenant[]> {
  const list = tenantList ?? (await fetchAllTenants(landlordDb))
  const matching: Tenant[] = []

  for (const tenant of list) {
    const ctx = createContext(landlordDb)
    await makeCurrent(tenant, ctx, tasks)
    try {
      if (await predicate(ctx)) {
        matching.push(tenant)
      }
    } finally {
      await forgetCurrent(ctx, tasks)
    }
  }

  return matching
}

async function fetchAllTenants(landlordDb: DrizzleDatabase): Promise<Tenant[]> {
  const rows = await landlordDb.select().from(tenants)
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    databaseUrl: row.databaseUrl,
    locale: row.locale,
    status: row.status as Tenant['status'],
    config: (row.config ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}
