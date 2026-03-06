import { eq } from 'drizzle-orm'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { Tenant, TenantFinder } from '../types.js'
import { tenants } from '../schema/tenants.js'

export interface JwtFinderOptions {
  /** JWT claim that holds the tenant ID. Default: "tenant_id" */
  claim?: string
  /** Custom JWT decoder. If omitted, uses a basic base64 decode (no signature verification). */
  decode?: (token: string) => Record<string, unknown> | null
}

export function createJwtFinder(options: JwtFinderOptions = {}): TenantFinder {
  const claim = options.claim ?? 'tenant_id'
  const decode = options.decode ?? defaultDecode

  return {
    async findForRequest(req: Request, landlordDb: NeonHttpDatabase): Promise<Tenant | null> {
      const authHeader = req.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) return null

      const token = authHeader.slice(7)
      const payload = decode(token)
      if (!payload) return null

      const tenantId = payload[claim]
      if (typeof tenantId !== 'string') return null

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

function defaultDecode(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
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
