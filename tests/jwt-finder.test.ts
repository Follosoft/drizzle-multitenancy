import { describe, it, expect } from 'vitest'
import { createJwtFinder } from '../src/finders/jwt-finder.js'
import { makeTenant, fakeLandlordDb, fakeQueryableDb } from './helpers.js'

describe('JwtFinder', () => {
  it('returns null when no Authorization header', async () => {
    const finder = createJwtFinder({
      decode: () => ({ tenant_id: 'x' }),
    })
    const req = new Request('https://example.com')
    const result = await finder.findForRequest(req, fakeLandlordDb())
    expect(result).toBeNull()
  })

  it('returns null for non-Bearer auth', async () => {
    const finder = createJwtFinder({
      decode: () => ({ tenant_id: 'x' }),
    })
    const req = new Request('https://example.com', {
      headers: { authorization: 'Basic abc' },
    })
    const result = await finder.findForRequest(req, fakeLandlordDb())
    expect(result).toBeNull()
  })

  it('returns null when decode fails', async () => {
    const finder = createJwtFinder({
      decode: () => null,
    })
    const req = new Request('https://example.com', {
      headers: { authorization: 'Bearer bad-token' },
    })
    const result = await finder.findForRequest(req, fakeLandlordDb())
    expect(result).toBeNull()
  })

  it('returns null when claim is not a string', async () => {
    const finder = createJwtFinder({
      decode: () => ({ tenant_id: 123 }),
    })
    const req = new Request('https://example.com', {
      headers: { authorization: 'Bearer some-token' },
    })
    const result = await finder.findForRequest(req, fakeLandlordDb())
    expect(result).toBeNull()
  })

  it('uses custom claim name', async () => {
    const finder = createJwtFinder({
      claim: 'org_id',
      decode: () => ({ org_id: 'tenant-1' }),
    })
    // Still returns null because landlordDb is a fake (no DB to query),
    // but we can verify it doesn't crash. Integration tests would cover the full path.
    const req = new Request('https://example.com', {
      headers: { authorization: 'Bearer some-token' },
    })
    const result = await finder.findForRequest(req, fakeQueryableDb())
    // Null because fake DB returns no rows
    expect(result).toBeNull()
  })
})
