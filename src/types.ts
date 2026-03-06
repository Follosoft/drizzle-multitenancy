import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

export interface Tenant {
  id: string
  name: string
  subdomain: string
  databaseUrl: string
  locale: string
  status: 'active' | 'suspended' | 'trial'
  config: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface TenantContext {
  tenant: Tenant | null
  db: NeonHttpDatabase | null
  landlordDb: NeonHttpDatabase
  config: Record<string, unknown> | null
  metadata: Record<string, unknown>
}

export interface ResolvedTenantContext extends TenantContext {
  tenant: Tenant
  db: NeonHttpDatabase
  config: Record<string, unknown>
}

export interface SwitchTenantTask {
  makeCurrent(tenant: Tenant, ctx: TenantContext): void | Promise<void>
  forgetCurrent(ctx: TenantContext): void | Promise<void>
}

export interface TenantFinder {
  findForRequest(req: Request, landlordDb: NeonHttpDatabase): Promise<Tenant | null>
}

export interface TenancyConfig {
  landlordDatabaseUrl: string
  databaseStrategy: 'separate-db' | 'shared-db'
  tenantFinders: TenantFinder[]
  switchTenantTasks: SwitchTenantTask[]
  tenantTableName?: string
}
