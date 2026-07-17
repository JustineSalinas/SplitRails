import { describe, expect, it } from 'vitest'
import { corridors, getCorridor, listCorridors } from './anchor'

describe('corridors', () => {
  it('only PHP is enabled for production — VND/IDR are demoOnly sandbox corridors', () => {
    expect(corridors.PHP.enabled).toBe(true)
    expect(corridors.PHP.demoOnly).toBe(false)
    expect(corridors.VND.enabled).toBe(true)
    expect(corridors.VND.demoOnly).toBe(true)
    expect(corridors.IDR.enabled).toBe(true)
    expect(corridors.IDR.demoOnly).toBe(true)
  })

  it('PHP builds a real testnet interactive withdraw URL', async () => {
    const { interactiveUrl } = await corridors.PHP.initWithdraw('1080.00')
    expect(interactiveUrl).toBe(
      'https://testanchor.stellar.org/sep24/transactions/withdraw/interactive?asset_code=USDC&amount=1080.00',
    )
  })

  it('VND/IDR build a demo interactive URL', async () => {
    const { interactiveUrl } = await corridors.VND.initWithdraw('100')
    expect(interactiveUrl).toBe(
      'https://testanchor.stellar.org/sep24/transactions/withdraw/interactive?asset_code=USDC&amount=100',
    )
  })

  it('getCorridor/listCorridors expose all three currencies symmetrically', () => {
    expect(getCorridor('PHP').currency).toBe('PHP')
    expect(listCorridors().map((c) => c.currency).sort()).toEqual(['IDR', 'PHP', 'VND'])
  })
})
