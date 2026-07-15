import { describe, expect, it } from 'vitest'
import { corridors, getCorridor, listCorridors } from './anchor'

describe('corridors', () => {
  it('only PHP is enabled — VND/IDR must not silently reuse the PHP sandbox', () => {
    expect(corridors.PHP.enabled).toBe(true)
    expect(corridors.VND.enabled).toBe(false)
    expect(corridors.IDR.enabled).toBe(false)
  })

  it('PHP builds a real testnet interactive withdraw URL', async () => {
    const { interactiveUrl } = await corridors.PHP.initWithdraw('1080.00')
    expect(interactiveUrl).toBe(
      'https://testanchor.stellar.org/sep24/transactions/withdraw/interactive?asset_code=USDC&amount=1080.00',
    )
  })

  it('rejects deposit/withdraw on a disabled corridor instead of hitting a fake endpoint', async () => {
    await expect(corridors.VND.initWithdraw('100')).rejects.toThrow(/not enabled/)
    await expect(corridors.IDR.initDeposit('100')).rejects.toThrow(/not enabled/)
  })

  it('getCorridor/listCorridors expose all three currencies symmetrically', () => {
    expect(getCorridor('PHP').currency).toBe('PHP')
    expect(listCorridors().map((c) => c.currency).sort()).toEqual(['IDR', 'PHP', 'VND'])
  })
})
