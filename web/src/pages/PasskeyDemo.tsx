import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { getEscrowClient } from '../lib/escrow'
import {
  createPasskey,
  isPasskeySupported,
  signWithPasskey,
  verifyAssertion,
  type PasskeyAssertion,
  type PasskeyRegistration,
} from '../lib/passkey'

// Standalone proof-of-concept: a real WebAuthn passkey signs a challenge derived from the hash of
// an actual escrow `settle` transaction, verified client-side. This is separate from — and does
// not replace — the live Freighter-signed settlement flow used elsewhere in the app.

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.slice().buffer as ArrayBuffer))
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function PasskeyDemo() {
  const { address, connect, connecting } = useWallet()
  const supported = isPasskeySupported()

  const [registration, setRegistration] = useState<PasskeyRegistration | null>(null)
  const [challengeHex, setChallengeHex] = useState<string | null>(null)
  const [challengeSource, setChallengeSource] = useState<string | null>(null)
  const [assertion, setAssertion] = useState<PasskeyAssertion | null>(null)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreatePasskey() {
    setBusy(true)
    setError(null)
    try {
      const reg = await createPasskey('splitrails-demo-user')
      setRegistration(reg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create passkey')
    } finally {
      setBusy(false)
    }
  }

  async function buildChallenge(): Promise<Uint8Array> {
    if (address) {
      try {
        const client = getEscrowClient(address)
        const tx = await client.settle({ participant: address })
        setChallengeSource('Hash of a real escrow settle() transaction for your connected address')
        return sha256(new TextEncoder().encode(tx.toXDR()))
      } catch {
        // No open escrow to build a real settle tx against (e.g. testnet contract not
        // initialized for this session) — fall back to a random challenge, clearly labeled.
      }
    }
    setChallengeSource('Random challenge (no live escrow transaction available to bind to)')
    return crypto.getRandomValues(new Uint8Array(32))
  }

  async function handleSignAndVerify() {
    if (!registration) return
    setBusy(true)
    setError(null)
    setVerified(null)
    try {
      const challenge = await buildChallenge()
      setChallengeHex(toHex(challenge))
      const sig = await signWithPasskey(registration.credentialId, challenge)
      setAssertion(sig)
      const ok = await verifyAssertion(sig, registration.publicKeyJwk)
      setVerified(ok)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign or verify with passkey')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="max-w-[720px] mx-auto px-10 py-10">
      <h1 className="text-[28px] font-bold tracking-tight m-0 mb-1.5">Passkey signing — technical demo</h1>
      <p className="text-text-secondary text-sm m-0 mb-6 max-w-[560px]">
        Proof-of-concept only: a real browser passkey signs a challenge bound to a real escrow
        transaction, verified client-side with Web Crypto. This is separate from the live
        settlement flow (still wallet-approved via Freighter elsewhere in the app) and does not
        submit anything on-chain.
      </p>

      {!supported && (
        <div className="mb-5 p-4 rounded-xl bg-neutral-light text-sm text-text-secondary">
          This browser/device does not support WebAuthn passkeys.
        </div>
      )}

      {!address && (
        <div className="mb-5 p-4 rounded-xl bg-neutral-light flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">
            Connect a wallet to bind the challenge to a real settle transaction (optional).
          </span>
          <button
            type="button"
            onClick={connect}
            disabled={connecting}
            className="bg-gradient-brand text-white border-none py-2 px-4 rounded-full text-xs font-bold cursor-pointer disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
          <div className="text-sm font-bold mb-2">1. Create a passkey</div>
          <button
            type="button"
            onClick={handleCreatePasskey}
            disabled={busy || !supported}
            className="bg-gradient-brand text-white border-none py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer disabled:opacity-60"
          >
            {registration ? 'Recreate passkey' : 'Create passkey'}
          </button>
          {registration && (
            <div className="mt-3 font-mono text-xs text-text-secondary break-all">
              Credential ID: {registration.credentialId}
            </div>
          )}
        </div>

        <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
          <div className="text-sm font-bold mb-2">2. Sign a transaction-bound challenge</div>
          <button
            type="button"
            onClick={handleSignAndVerify}
            disabled={busy || !registration}
            className="bg-action text-white border-none py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer disabled:opacity-60"
          >
            Sign &amp; verify
          </button>
          {challengeSource && <div className="mt-3 text-xs text-text-secondary">{challengeSource}</div>}
          {challengeHex && (
            <div className="mt-1 font-mono text-xs text-text-secondary break-all">Challenge: {challengeHex}</div>
          )}
          {assertion && (
            <div className="mt-1 font-mono text-xs text-text-secondary break-all">
              Signature: {toHex(assertion.signature).slice(0, 48)}…
            </div>
          )}
          {verified !== null && (
            <div className={`mt-3 text-sm font-bold ${verified ? 'text-success' : 'text-[#93000a]'}`}>
              {verified ? 'Signature verified client-side ✓' : 'Signature verification failed'}
            </div>
          )}
        </div>

        {error && <div className="text-[13px] text-[#93000a]">{error}</div>}
      </div>
    </main>
  )
}
