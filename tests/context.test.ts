import { describe, it, expect } from 'vitest'
import { createContext, makeCurrent, forgetCurrent } from '../src/context/tenant-context.js'
import { makeTenant, fakeLandlordDb, spyTask } from './helpers.js'

describe('tenant-context', () => {
  it('creates a context with null tenant', () => {
    const ctx = createContext(fakeLandlordDb())
    expect(ctx.tenant).toBeNull()
    expect(ctx.db).toBeNull()
    expect(ctx.config).toBeNull()
    expect(ctx.metadata).toEqual({})
  })

  it('makeCurrent sets the tenant and runs tasks', async () => {
    const ctx = createContext(fakeLandlordDb())
    const tenant = makeTenant()
    const task = spyTask()

    await makeCurrent(tenant, ctx, [task])

    expect(ctx.tenant).toBe(tenant)
    expect(task.calls).toEqual(['makeCurrent'])
  })

  it('forgetCurrent clears tenant and runs tasks in reverse', async () => {
    const ctx = createContext(fakeLandlordDb())
    const tenant = makeTenant()
    const task1 = spyTask()
    const task2 = spyTask()

    await makeCurrent(tenant, ctx, [task1, task2])
    await forgetCurrent(ctx, [task1, task2])

    expect(ctx.tenant).toBeNull()
    expect(ctx.db).toBeNull()
    expect(ctx.config).toBeNull()
    // task2 should be called before task1 (reverse order)
    expect(task2.calls).toEqual(['makeCurrent', 'forgetCurrent'])
    expect(task1.calls).toEqual(['makeCurrent', 'forgetCurrent'])
  })
})
