import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import type { TenancyConfig } from './types.js'

export interface Tenancy {
  config: TenancyConfig
  landlordDb: NeonHttpDatabase
}

export function defineConfig(config: TenancyConfig): Tenancy {
  const sql = neon(config.landlordDatabaseUrl)
  const landlordDb = drizzle(sql)

  return { config, landlordDb }
}
