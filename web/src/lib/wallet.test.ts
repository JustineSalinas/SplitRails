import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  getAddress: vi.fn(),
  getNetworkDetails: vi.fn(),
  signTransaction: vi.fn(),
}))

vi.mock('@stellar/freighter-api', () => mocks)

const wallet = await import('./wallet')

function setFreighterInstalled(installed: boolean) {
  Object.defineProperty(window, 'freighter', {
    value: installed,
    writable: true,
    configurable: true,
  })
}

describe('wallet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // @ts-expect-error test-only cleanup of the injected extension flag
    delete window.freighter
  })

  describe('isWalletAvailable', () => {
    it('returns false immediately when the extension is not installed, without calling the API', async () => {
      setFreighterInstalled(false)
      const result = await wallet.isWalletAvailable()
      expect(result).toBe(false)
      expect(mocks.isConnected).not.toHaveBeenCalled()
    })

    it('defers to Freighter isConnected() once the extension is present', async () => {
      setFreighterInstalled(true)
      mocks.isConnected.mockResolvedValue({ isConnected: true })
      const result = await wallet.isWalletAvailable()
      expect(result).toBe(true)
    })
  })

  describe('connect', () => {
    it('fails fast with an install message when the extension is missing', async () => {
      setFreighterInstalled(false)
      await expect(wallet.connect()).rejects.toThrow(/freighter.app/i)
    })

    it('rejects with a friendly message when Freighter is on the wrong network', async () => {
      setFreighterInstalled(true)
      // Access is granted first (Freighter won't answer network queries until it is),
      // then the network mismatch is what surfaces the error.
      mocks.requestAccess.mockResolvedValue({ address: 'GABC123' })
      mocks.getNetworkDetails.mockResolvedValue({
        network: 'PUBLIC',
        networkUrl: 'https://horizon.stellar.org',
        networkPassphrase: 'Public Global Stellar Network ; September 2015',
      })
      await expect(wallet.connect()).rejects.toThrow(/different network/i)
    })

    it('proceeds to requestAccess() once the network passphrase matches', async () => {
      setFreighterInstalled(true)
      mocks.getNetworkDetails.mockResolvedValue({
        network: 'TESTNET',
        networkUrl: 'https://horizon-testnet.stellar.org',
        networkPassphrase: 'Test SDF Network ; September 2015',
      })
      mocks.requestAccess.mockResolvedValue({ address: 'GABC123' })
      const address = await wallet.connect()
      expect(address).toBe('GABC123')
    })
  })
})
