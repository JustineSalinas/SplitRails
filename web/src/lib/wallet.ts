import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress as freighterGetAddress,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'
import { networkPassphrase } from './config'

const CONNECT_TIMEOUT_MS = 5000
const NOT_INSTALLED_MESSAGE =
  'Freighter wallet extension not detected. Install it from freighter.app and reload the page.'

function unwrap<T extends { error?: { message: string } }>(result: T): Omit<T, 'error'> {
  if (result.error) {
    throw new Error(result.error.message)
  }
  return result
}

// Freighter's own API talks to the extension over postMessage. If the
// extension isn't installed, there's no content script to ever answer that
// message, so the call hangs forever instead of rejecting — verified live:
// clicking "Connect wallet" with no extension leaves the button stuck on
// "Connecting…" indefinitely, no error, no console output. window.freighter
// is a synchronous flag the extension injects on load; its absence means
// there's nothing listening, so we can fail fast instead of waiting on a
// response that will never come. (Not part of @stellar/freighter-api's
// public type exports, hence the manual cast rather than a direct
// `window.freighter` reference.) The timeout is defense-in-depth for the
// remaining case where the extension is installed but unresponsive.
function hasFreighterExtension(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean((window as unknown as { freighter?: boolean }).freighter)
}

function assertWalletInstalled(): void {
  if (!hasFreighterExtension()) {
    throw new Error(NOT_INSTALLED_MESSAGE)
  }
}

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), CONNECT_TIMEOUT_MS)),
  ])
}

// isWalletAvailable/getAddress are status checks with no human interaction
// involved, so a hang past a few seconds means something's actually wrong
// (unresponsive extension) rather than a user still reading a popup — a
// tight timeout is safe here. connect()/signTransaction() wait on a real
// person clicking "Approve" in the extension, which can legitimately take
// far longer than a few seconds, so they only get the fast-fail install
// check, not a timeout — assertWalletInstalled() already covers the actual
// bug (no extension at all → the call hangs forever with no popup ever
// shown, since there's nothing to answer the postMessage handshake).

export async function isWalletAvailable(): Promise<boolean> {
  if (!hasFreighterExtension()) return false
  const result = await withTimeout(freighterIsConnected(), 'Freighter did not respond in time.')
  return unwrap(result).isConnected
}

export async function connect(): Promise<string> {
  assertWalletInstalled()
  const result = await requestAccess()
  return unwrap(result).address
}

export async function getAddress(): Promise<string> {
  assertWalletInstalled()
  const result = await withTimeout(freighterGetAddress(), 'Freighter did not respond in time.')
  return unwrap(result).address
}

export async function signTransaction(transactionXdr: string, address: string): Promise<string> {
  assertWalletInstalled()
  const result = await freighterSignTransaction(transactionXdr, { networkPassphrase, address })
  return unwrap(result).signedTxXdr
}
