import { describe, it, expect } from 'vitest'
import { needsTenant } from '../src/middleware/needs-tenant.js'
import { withTenant } from '../src/middleware/with-tenant.js'
import { NoCurrentTenantError } from '../src/errors.js'
import { createContext } from '../src/context/tenant-context.js'
import { makeTenant, fakeLandlordDb, staticFinder, spyTask } from './helpers.js'
import type { Tenancy } from '../src/config.js'

describe('needsTenant', () => {
  it('throws NoCurrentTenantError when no tenant', () => {
    const ctx = createContext(fakeLandlordDb())
    expect(() => needsTenant(ctx)).toThrow(NoCurrentTenantError)
  })

  it('does not throw when tenant is set', () => {
    const ctx = createContext(fakeLandlordDb())
    ctx.tenant = makeTenant()
    ctx.db = fakeLandlordDb()
    expect(() => needsTenant(ctx)).not.toThrow()
  })
})

describe('withTenant', () => {
  it('resolves tenant and passes ctx to handler', async () => {
    const tenant = makeTenant()
    const task = spyTask()
    const tenancy: Tenancy = {
      config: {
        landlordDatabaseUrl: 'fake',
        databaseStrategy: 'separate-db',
        tenantFinders: [staticFinder(tenant)],
        switchTenantTasks: [task],
      },
      landlordDb: fakeLandlordDb(),
    }

    const handler = withTenant(tenancy, async (_req, ctx) => {
      expect(ctx.tenant).toBe(tenant)
      return new Response('ok')
    })

    const res = await handler(new Request('https://example.com'))
    expect(res.status).toBe(200)
    expect(task.calls).toEqual(['makeCurrent', 'forgetCurrent'])
  })

  it('calls handler with null tenant when no finder matches', async () => {
    const tenancy: Tenancy = {
      config: {
        landlordDatabaseUrl: 'fake',
        databaseStrategy: 'separate-db',
        tenantFinders: [staticFinder(null)],
        switchTenantTasks: [],
      },
      landlordDb: fakeLandlordDb(),
    }

    const handler = withTenant(tenancy, async (_req, ctx) => {
      expect(ctx.tenant).toBeNull()
      return new Response('no tenant')
    })

    const res = await handler(new Request('https://example.com'))
    expect(await res.text()).toBe('no tenant')
  })

  it('cleans up even if handler throws', async () => {
    const tenant = makeTenant()
    const task = spyTask()
    const tenancy: Tenancy = {
      config: {
        landlordDatabaseUrl: 'fake',
        databaseStrategy: 'separate-db',
        tenantFinders: [staticFinder(tenant)],
        switchTenantTasks: [task],
      },
      landlordDb: fakeLandlordDb(),
    }

    const handler = withTenant(tenancy, async () => {
      throw new Error('boom')
    })

    await expect(handler(new Request('https://example.com'))).rejects.toThrow('boom')
    expect(task.calls).toEqual(['makeCurrent', 'forgetCurrent'])
  })
})
