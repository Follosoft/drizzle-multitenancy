import { describe, it, expect } from 'vitest'
import { createCompositeFinder } from '../src/finders/composite-finder.js'
import { makeTenant, fakeLandlordDb, staticFinder } from './helpers.js'

describe('CompositeFinder', () => {
  it('returns the first matching tenant', async () => {
    const tenant = makeTenant()
    const finder = createCompositeFinder([
      staticFinder(null),
      staticFinder(tenant),
      staticFinder(makeTenant({ id: 'other' })),
    ])

    const result = await finder.findForRequest(new Request('https://example.com'), fakeLandlordDb())
    expect(result).toBe(tenant)
  })

  it('returns null if no finder matches', async () => {
    const finder = createCompositeFinder([staticFinder(null), staticFinder(null)])
    const result = await finder.findForRequest(new Request('https://example.com'), fakeLandlordDb())
    expect(result).toBeNull()
  })
})
