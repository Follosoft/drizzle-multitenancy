import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { DatabaseClientFactory } from '../types.js'

/**
 * Neon database client factory.
 *
 * Usage:
 *   defineConfig({ createDatabaseClient: neonClientFactory(), ... })
 */
export function neonClientFactory(): DatabaseClientFactory {
  return (url: string) => {
    const sql = neon(url)
    return drizzle(sql)
  }
}
