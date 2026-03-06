import type { Tenant } from '../types.js'
import { serializeTenantPayload } from './tenant-aware.js'

type Dispatcher<T extends Record<string, unknown>> = (payload: T) => void | Promise<void>

/**
 * Wraps a generic job dispatcher to automatically inject tenant context.
 *
 * Usage:
 *   const dispatch = wrapDispatcher(ctx.tenant!, originalDispatch)
 *   dispatch({ orderId: '123' }) // payload now includes tenantId + tenantDatabaseUrl
 */
export function wrapDispatcher<T extends Record<string, unknown>>(
  tenant: Tenant,
  dispatch: Dispatcher<T & { tenantId: string; tenantDatabaseUrl: string }>,
): (data: T) => void | Promise<void> {
  return (data: T) => {
    const payload = serializeTenantPayload(tenant, data)
    return dispatch(payload as T & { tenantId: string; tenantDatabaseUrl: string })
  }
}
