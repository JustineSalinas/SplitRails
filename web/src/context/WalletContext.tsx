import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as wallet from '../lib/wallet'

interface WalletState {
  address: string | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function restoreSession() {
      try {
        if (await wallet.isWalletAvailable()) {
          const existing = await wallet.getAddress()
          if (!cancelled && existing) setAddress(existing)
        }
      } catch {
        // no existing Freighter session — user must connect explicitly
      }
    }
    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const connected = await wallet.connect()
      setAddress(connected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }, [])

  // Freighter itself has no dApp-initiated "disconnect" — access, once granted, stays
  // granted at the extension level until the user revokes it there. This just forgets
  // the address locally so the app shows "Connect wallet" again.
  const disconnect = useCallback(() => {
    setAddress(null)
    setError(null)
  }, [])

  const value = useMemo(
    () => ({ address, connecting, error, connect, disconnect }),
    [address, connecting, error, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
