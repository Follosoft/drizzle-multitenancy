import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'

/** Provider-agnostic Drizzle Postgres database type. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DrizzleDatabase = PgDatabase<PgQueryResultHKT, any, any>

/** Factory function that creates a Drizzle database client from a connection URL. */
export type DatabaseClientFactory = (url: string) => DrizzleDatabase

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
  db: DrizzleDatabase | null
  landlordDb: DrizzleDatabase
  config: Record<string, unknown> | null
  metadata: Record<string, unknown>
}

export interface ResolvedTenantContext extends TenantContext {
  tenant: Tenant
  db: DrizzleDatabase
  config: Record<string, unknown>
}

export interface SwitchTenantTask {
  makeCurrent(tenant: Tenant, ctx: TenantContext): void | Promise<void>
  forgetCurrent(ctx: TenantContext): void | Promise<void>
}

export interface TenantFinder {
  findForRequest(req: Request, landlordDb: DrizzleDatabase): Promise<Tenant | null>
}

export interface TenancyConfig {
  landlordDatabaseUrl: string
  databaseStrategy: 'separate-db' | 'shared-db'
  tenantFinders: TenantFinder[]
  switchTenantTasks: SwitchTenantTask[]
  createDatabaseClient: DatabaseClientFactory
  tenantTableName?: string
}
