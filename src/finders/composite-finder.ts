import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { Tenant, TenantFinder } from '../types.js'

/**
 * Chains multiple finders, returning the first match.
 */
export function createCompositeFinder(finders: TenantFinder[]): TenantFinder {
  return {
    async findForRequest(req: Request, landlordDb: NeonHttpDatabase): Promise<Tenant | null> {
      for (const finder of finders) {
        const tenant = await finder.findForRequest(req, landlordDb)
        if (tenant) return tenant
      }
      return null
    },
  }
}
