import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress as freighterGetAddress,
  getNetworkDetails,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'
import { networkPassphrase, stellarNetwork } from './config'

const CONNECT_TIMEOUT_MS = 5000
const NOT_INSTALLED_MESSAGE =
  'Freighter wallet extension not detected. Install it from freighter.app and reload the page.'

// A user on the wrong Freighter network (e.g. Mainnet while this app runs on Testnet) would
// otherwise get whatever raw error the RPC/contract call throws back — usually an opaque
// "transaction failed" with no indication of the actual cause. Check up front and say so.
async function assertCorrectNetwork(): Promise<void> {
  const details = await withTimeout(getNetworkDetails(), 'Freighter did not respond in time.')
  const result = unwrap(details)
  if (result.networkPassphrase !== networkPassphrase) {
    throw new Error(
      `Freighter is set to a different network than this app (expected ${stellarNetwork}). Switch networks in the Freighter extension and try again.`,
    )
  }
}

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

const DETECTION_RETRY_MS = 100
const DETECTION_RETRIES = 5

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// The extension injects window.freighter asynchronously once its content
// script loads, which can race with a check that runs on first paint right
// after a reload — the flag can still be absent even though the extension
// is installed and will be ready a beat later. Poll briefly before
// concluding it's actually missing.
async function waitForFreighterExtension(): Promise<boolean> {
  for (let attempt = 0; attempt < DETECTION_RETRIES; attempt++) {
    if (hasFreighterExtension()) return true
    await sleep(DETECTION_RETRY_MS)
  }
  return hasFreighterExtension()
}

async function assertWalletInstalled(): Promise<void> {
  if (!(await waitForFreighterExtension())) {
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
  if (!(await waitForFreighterExtension())) return false
  const result = await withTimeout(freighterIsConnected(), 'Freighter did not respond in time.')
  return unwrap(result).isConnected
}

export async function connect(): Promise<string> {
  await assertWalletInstalled()
  // Request access *before* checking the network: Freighter won't answer
  // getNetworkDetails() until the app is allowlisted, so a network check first
  // would throw before the access prompt ever appears.
  const result = await requestAccess()
  const address = unwrap(result).address
  await assertCorrectNetwork()
  return address
}

export async function getAddress(): Promise<string> {
  await assertWalletInstalled()
  const result = await withTimeout(freighterGetAddress(), 'Freighter did not respond in time.')
  return unwrap(result).address
}

export async function signTransaction(transactionXdr: string, address: string): Promise<string> {
  await assertWalletInstalled()
  await assertCorrectNetwork()
  const result = await freighterSignTransaction(transactionXdr, { networkPassphrase, address })
  return unwrap(result).signedTxXdr
}
