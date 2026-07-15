import { beforeEach, describe, expect, it } from 'vitest'
import { getTxLog, logTx, stellarExpertTxUrl } from './txLog'

describe('txLog', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns entries sorted by timestamp regardless of insertion order', () => {
    logTx('second', 'hash-b', 'contract-a')
    logTx('first', 'hash-a', 'contract-a')
    const [first, second] = getTxLog('contract-a')
    expect(first.label).toBe('second')
    expect(second.label).toBe('first')
  })

  it('scopes entries by contract ID — one invoice cannot see another invoice’s activity', () => {
    logTx('created A', 'hash-a', 'contract-a')
    logTx('created B', 'hash-b', 'contract-b')

    expect(getTxLog('contract-a').map((e) => e.label)).toEqual(['created A'])
    expect(getTxLog('contract-b').map((e) => e.label)).toEqual(['created B'])
  })

  it('returns every entry across all contracts when no contract ID is given', () => {
    logTx('created A', 'hash-a', 'contract-a')
    logTx('created B', 'hash-b', 'contract-b')
    expect(getTxLog()).toHaveLength(2)
  })

  it('carries an optional dollar amount used for burn-rate calculations', () => {
    logTx('settled', 'hash-c', 'contract-a', 42.5)
    expect(getTxLog('contract-a')[0].amount).toBe(42.5)
  })

  it('builds a Stellar Expert explorer link from a tx hash', () => {
    expect(stellarExpertTxUrl('abc123')).toContain('/tx/abc123')
  })
})
