import { describe, it, expect } from 'vitest'
import { createContext } from '../src/context/tenant-context.js'
import { createSwitchConfigTask } from '../src/tasks/switch-config-task.js'
import { createTenantScopeTask } from '../src/tasks/tenant-scope-task.js'
import { createTasksCollection } from '../src/tasks/tasks-collection.js'
import { makeTenant, fakeLandlordDb, spyTask } from './helpers.js'

describe('SwitchConfigTask', () => {
  it('sets config and metadata on makeCurrent', () => {
    const task = createSwitchConfigTask()
    const ctx = createContext(fakeLandlordDb())
    const tenant = makeTenant({ locale: 'fr', config: { plan: 'pro' } })

    task.makeCurrent(tenant, ctx)

    expect(ctx.config).toEqual({ plan: 'pro' })
    expect(ctx.metadata.locale).toBe('fr')
    expect(ctx.metadata.tenantId).toBe(tenant.id)
  })

  it('clears config on forgetCurrent', () => {
    const task = createSwitchConfigTask()
    const ctx = createContext(fakeLandlordDb())
    const tenant = makeTenant()

    task.makeCurrent(tenant, ctx)
    task.forgetCurrent(ctx)

    expect(ctx.config).toBeNull()
    expect(ctx.metadata.locale).toBeUndefined()
    expect(ctx.metadata.tenantId).toBeUndefined()
  })
})

describe('TenantScopeTask', () => {
  it('reuses landlord DB and sets tenantId', () => {
    const task = createTenantScopeTask()
    const landlordDb = fakeLandlordDb()
    const ctx = createContext(landlordDb)
    const tenant = makeTenant()

    task.makeCurrent(tenant, ctx)

    expect(ctx.db).toBe(landlordDb)
    expect(ctx.metadata.tenantId).toBe(tenant.id)
  })

  it('clears db on forgetCurrent', () => {
    const task = createTenantScopeTask()
    const ctx = createContext(fakeLandlordDb())
    const tenant = makeTenant()

    task.makeCurrent(tenant, ctx)
    task.forgetCurrent(ctx)

    expect(ctx.db).toBeNull()
    expect(ctx.metadata.tenantId).toBeUndefined()
  })
})

describe('TasksCollection', () => {
  it('runs all tasks in order on makeCurrent', async () => {
    const order: string[] = []
    const t1 = { makeCurrent() { order.push('t1') }, forgetCurrent() { order.push('t1-forget') } }
    const t2 = { makeCurrent() { order.push('t2') }, forgetCurrent() { order.push('t2-forget') } }

    const collection = createTasksCollection([t1, t2])
    const ctx = createContext(fakeLandlordDb())

    await collection.makeCurrent(makeTenant(), ctx)
    expect(order).toEqual(['t1', 't2'])

    await collection.forgetCurrent(ctx)
    expect(order).toEqual(['t1', 't2', 't2-forget', 't1-forget'])
  })
})
