import type { Tenancy } from '../config.js'
import type { TenantContext } from '../types.js'
import { createContext, makeCurrent, forgetCurrent } from '../context/tenant-context.js'
import { createCompositeFinder } from '../finders/composite-finder.js'

type TenantHandler = (req: Request, ctx: TenantContext) => Response | Promise<Response>

/**
 * HOF: wraps a request handler with tenant resolution.
 *
 * 1. Creates a fresh TenantContext
 * 2. Runs finders to resolve the tenant
 * 3. Runs switch tasks if a tenant is found
 * 4. Calls the handler
 * 5. Cleans up via forgetCurrent
 */
export function withTenant(tenancy: Tenancy, handler: TenantHandler): (req: Request) => Promise<Response> {
  const compositeFinder = createCompositeFinder(tenancy.config.tenantFinders)

  return async (req: Request): Promise<Response> => {
    const ctx = createContext(tenancy.landlordDb)

    const tenant = await compositeFinder.findForRequest(req, tenancy.landlordDb)

    if (tenant) {
      await makeCurrent(tenant, ctx, tenancy.config.switchTenantTasks)
    }

    try {
      return await handler(req, ctx)
    } finally {
      if (ctx.tenant) {
        await forgetCurrent(ctx, tenancy.config.switchTenantTasks)
      }
    }
  }
}
