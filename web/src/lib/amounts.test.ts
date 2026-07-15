import { describe, expect, it } from 'vitest'
import { baseUnitsToDollars, dollarsToBaseUnits, isValidStellarAddress, truncateAddress } from './amounts'

describe('dollarsToBaseUnits / baseUnitsToDollars', () => {
  it('round-trips a typical dollar amount through 7-decimal base units', () => {
    expect(dollarsToBaseUnits(1410)).toBe(14100000000n)
    expect(baseUnitsToDollars(14100000000n)).toBe(1410)
  })

  it('rounds fractional cents rather than truncating', () => {
    // 12.345 dollars * 1e7 = 123450000 exactly, but 12.3456789 needs rounding.
    expect(dollarsToBaseUnits(12.3456789)).toBe(123456789n)
  })

  it('handles zero', () => {
    expect(dollarsToBaseUnits(0)).toBe(0n)
    expect(baseUnitsToDollars(0n)).toBe(0)
  })
})

describe('isValidStellarAddress', () => {
  it('accepts a well-formed G... public key', () => {
    expect(isValidStellarAddress('GDDUC3PNY63T67JHVOZIXXABMIWUQHPKLLNM3YA3Z6KA3TPKPJJSPJ7G')).toBe(true)
  })

  it('rejects an address with the wrong length', () => {
    expect(isValidStellarAddress('GDDUC3PNY63T67JHVOZIXXABMIWUQHPKLLNM3YA3Z6KA3TPKPJJSPJ7')).toBe(false)
  })

  it('rejects a non-Stellar-looking string', () => {
    expect(isValidStellarAddress('not-an-address')).toBe(false)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isValidStellarAddress('  GDDUC3PNY63T67JHVOZIXXABMIWUQHPKLLNM3YA3Z6KA3TPKPJJSPJ7G  ')).toBe(true)
  })
})

describe('truncateAddress', () => {
  it('keeps the first 4 and last 4 characters', () => {
    expect(truncateAddress('GDDUC3PNY63T67JHVOZIXXABMIWUQHPKLLNM3YA3Z6KA3TPKPJJSPJ7G')).toBe('GDDU…PJ7G')
  })
})
