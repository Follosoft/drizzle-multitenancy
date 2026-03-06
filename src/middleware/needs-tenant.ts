import { NoCurrentTenantError } from '../errors.js'
import type { TenantContext, ResolvedTenantContext } from '../types.js'

/**
 * Guard: asserts that a tenant has been resolved on the context.
 * Type-narrows TenantContext → ResolvedTenantContext.
 *
 * Throws NoCurrentTenantError if no tenant is set.
 */
export function needsTenant(ctx: TenantContext): asserts ctx is ResolvedTenantContext {
  if (!ctx.tenant || !ctx.db) {
    throw new NoCurrentTenantError()
  }
}
