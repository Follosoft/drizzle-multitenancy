import { describe, it, expect } from 'vitest'
import { serializeTenantPayload, extractTenantFromPayload } from '../src/jobs/tenant-aware.js'
import { wrapDispatcher } from '../src/jobs/job-dispatcher.js'
import { makeTenant } from './helpers.js'

describe('tenant-aware payload', () => {
  it('serializes tenant fields into payload', () => {
    const tenant = makeTenant({ id: 't-42' })
    const payload = serializeTenantPayload(tenant, { orderId: '123' })

    expect(payload.tenantId).toBe('t-42')
    expect(payload.tenantDatabaseUrl).toBe(tenant.databaseUrl)
    expect(payload.orderId).toBe('123')
  })

  it('extracts tenant fields from payload', () => {
    const payload = { tenantId: 't-42', tenantDatabaseUrl: 'pg://x', orderId: '123' }
    const { tenantId, tenantDatabaseUrl } = extractTenantFromPayload(payload)

    expect(tenantId).toBe('t-42')
    expect(tenantDatabaseUrl).toBe('pg://x')
  })
})

describe('wrapDispatcher', () => {
  it('injects tenant context into dispatch payload', async () => {
    const tenant = makeTenant({ id: 't-99' })
    let captured: Record<string, unknown> | null = null

    const dispatch = wrapDispatcher(tenant, (payload) => {
      captured = payload
    })

    await dispatch({ orderId: 'abc' })

    expect(captured).not.toBeNull()
    expect(captured!.tenantId).toBe('t-99')
    expect(captured!.orderId).toBe('abc')
  })
})
