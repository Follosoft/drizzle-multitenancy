import { describe, it, expect } from 'vitest'
import { NoCurrentTenantError, TenantNotFoundError } from '../src/errors.js'

describe('errors', () => {
  it('NoCurrentTenantError has correct name and default message', () => {
    const err = new NoCurrentTenantError()
    expect(err.name).toBe('NoCurrentTenantError')
    expect(err.message).toContain('No current tenant')
    expect(err).toBeInstanceOf(Error)
  })

  it('TenantNotFoundError includes identifier', () => {
    const err = new TenantNotFoundError('abc-123')
    expect(err.name).toBe('TenantNotFoundError')
    expect(err.message).toBe('Tenant not found: abc-123')
  })
})
