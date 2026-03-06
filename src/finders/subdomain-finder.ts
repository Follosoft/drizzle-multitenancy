import { eq } from 'drizzle-orm'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { Tenant, TenantFinder } from '../types.js'
import { tenants } from '../schema/tenants.js'

export interface SubdomainFinderOptions {
  baseDomain: string
}

export function createSubdomainFinder(options: SubdomainFinderOptions): TenantFinder {
  return {
    async findForRequest(req: Request, landlordDb: NeonHttpDatabase): Promise<Tenant | null> {
      const url = new URL(req.url)
      const hostname = url.hostname

      if (!hostname.endsWith(options.baseDomain)) return null

      const subdomain = hostname.slice(0, -(options.baseDomain.length + 1)) // strip ".baseDomain"
      if (!subdomain || subdomain.includes('.')) return null

      const rows = await landlordDb
        .select()
        .from(tenants)
        .where(eq(tenants.subdomain, subdomain))
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
