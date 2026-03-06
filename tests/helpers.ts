import type { Tenant, TenantContext, SwitchTenantTask, TenantFinder } from '../src/types.js'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'

export function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: 'tenant-1',
    name: 'Acme Corp',
    subdomain: 'acme',
    databaseUrl: 'postgresql://tenant1:pass@localhost/acme',
    locale: 'en',
    status: 'active',
    config: { feature_x: true },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }
}

/** Fake landlord DB — just a plain object stub for unit tests. */
export function fakeLandlordDb(): NeonHttpDatabase {
  return {} as NeonHttpDatabase
}

/** Fake landlord DB with a chainable select() that always returns an empty array. */
export function fakeQueryableDb(): NeonHttpDatabase {
  const chain = {
    from: () => chain,
    where: () => chain,
    limit: () => Promise.resolve([]),
  }
  return { select: () => chain } as unknown as NeonHttpDatabase
}

/** A task that records calls for assertions. */
export function spyTask(): SwitchTenantTask & { calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    makeCurrent(_tenant, _ctx) {
      calls.push('makeCurrent')
    },
    forgetCurrent(_ctx) {
      calls.push('forgetCurrent')
    },
  }
}

/** A finder that always returns the given tenant. */
export function staticFinder(tenant: Tenant | null): TenantFinder {
  return {
    async findForRequest() {
      return tenant
    },
  }
}
