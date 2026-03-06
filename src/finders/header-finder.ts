import { eq } from 'drizzle-orm'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { Tenant, TenantFinder } from '../types.js'
import { tenants } from '../schema/tenants.js'

export interface HeaderFinderOptions {
  headerName?: string
}

export function createHeaderFinder(options: HeaderFinderOptions = {}): TenantFinder {
  const headerName = options.headerName ?? 'x-tenant-id'

  return {
    async findForRequest(req: Request, landlordDb: NeonHttpDatabase): Promise<Tenant | null> {
      const tenantId = req.headers.get(headerName)
      if (!tenantId) return null

      const rows = await landlordDb
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1)

      if (rows.length === 0) return null

      return rowToTenant(rows[0])
    },
  }
}

function rowToTenant(row: typeof tenants.$inferSelect): Tenant {
  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    databaseUrl: row.databaseUrl,
    locale: row.locale,
    status: row.status as Tenant['status'],
    config: (row.config ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
