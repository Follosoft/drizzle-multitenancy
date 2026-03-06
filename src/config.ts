import type { TenancyConfig, DrizzleDatabase } from './types.js'

export interface Tenancy {
  config: TenancyConfig
  landlordDb: DrizzleDatabase
}

export function defineConfig(config: TenancyConfig): Tenancy {
  const landlordDb = config.createDatabaseClient(config.landlordDatabaseUrl)

  return { config, landlordDb }
}
