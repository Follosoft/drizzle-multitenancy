import type { Tenant } from '../types.js'

export interface TenantAwarePayload {
  tenantId: string
  tenantDatabaseUrl: string
  [key: string]: unknown
}

/**
 * Serialize a tenant into a job payload.
 */
export function serializeTenantPayload<T extends Record<string, unknown>>(
  tenant: Tenant,
  data: T,
): TenantAwarePayload & T {
  return {
    tenantId: tenant.id,
    tenantDatabaseUrl: tenant.databaseUrl,
    ...data,
  }
}

/**
 * Extract tenant fields from a job payload.
 */
export function extractTenantFromPayload(payload: TenantAwarePayload): {
  tenantId: string
  tenantDatabaseUrl: string
} {
  return {
    tenantId: payload.tenantId,
    tenantDatabaseUrl: payload.tenantDatabaseUrl,
  }
}
