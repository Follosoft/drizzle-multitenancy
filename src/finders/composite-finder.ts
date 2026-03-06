import type { Tenant, TenantFinder, DrizzleDatabase } from '../types.js'

/**
 * Chains multiple finders, returning the first match.
 */
export function createCompositeFinder(finders: TenantFinder[]): TenantFinder {
  return {
    async findForRequest(req: Request, landlordDb: DrizzleDatabase): Promise<Tenant | null> {
      for (const finder of finders) {
        const tenant = await finder.findForRequest(req, landlordDb)
        if (tenant) return tenant
      }
      return null
    },
  }
}
