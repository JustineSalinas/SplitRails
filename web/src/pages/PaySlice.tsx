import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { useWallet } from '../context/WalletContext'
import { corridors, type Corridor } from '../lib/anchor'
import { getEscrowClient, settleShare } from '../lib/escrow'
import { createPasskey, isPasskeySupported, signWithPasskey, verifyAssertion } from '../lib/passkey'
import { loadPasskeyRegistration, savePasskeyRegistration } from '../lib/passkeyStore'

const DEADLINE_SECONDS = 14 * 3600 + 20 * 60 + 28
const SHARE_AMOUNT = 1080
type PayoutCurrency = 'USDC' | Corridor

async function buildSettleChallenge(address: string, contractId?: string): Promise<Uint8Array> {
  const client = getEscrowClient(address, contractId)
  const tx = await client.settle({ participant: address })
  const bytes = new TextEncoder().encode(tx.toXDR())
  return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
}

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function PaySlice() {
  const navigate = useNavigate()
  const { contractId } = useParams()
  const { address, connecting, error: walletError, connect } = useWallet()
  const [secondsLeft, setSecondsLeft] = useState(DEADLINE_SECONDS)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [biometricStage, setBiometricStage] = useState<'idle' | 'verifying' | 'verified' | 'unsupported'>(
    isPasskeySupported() ? 'idle' : 'unsupported',
  )
  const [payoutCurrency, setPayoutCurrency] = useState<PayoutCurrency>('USDC')
  const [anchorLoading, setAnchorLoading] = useState(false)
  const [anchorError, setAnchorError] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function verifyWithPasskey(address: string) {
    setBiometricStage('verifying')
    let registration = loadPasskeyRegistration(address)
    if (!registration) {
      registration = await createPasskey(address)
      savePasskeyRegistration(address, registration)
    }
    const challenge = await buildSettleChallenge(address, contractId)
    const assertion = await signWithPasskey(registration.credentialId, challenge)
    const ok = await verifyAssertion(assertion, registration.publicKeyJwk)
    if (!ok) throw new Error('Biometric verification failed — signature did not match')
    setBiometricStage('verified')
  }

  async function handleClaim() {
    if (!address) {
      await connect()
      return
    }
    setPaying(true)
    setPayError(null)
    try {
      if (isPasskeySupported()) {
        await verifyWithPasskey(address)
      }
      await settleShare(address, address, contractId)
      navigate('/locked')
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Failed to settle your share')
    } finally {
      setPaying(false)
    }
  }

  async function handleOpenAnchor() {
    if (payoutCurrency === 'USDC') return
    const corridor = corridors[payoutCurrency]
    setAnchorLoading(true)
    setAnchorError(null)
    try {
      const { interactiveUrl } = await corridor.initWithdraw(SHARE_AMOUNT.toFixed(2))
      window.open(interactiveUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setAnchorError(err instanceof Error ? err.message : 'Could not reach the anchor')
    } finally {
      setAnchorLoading(false)
    }
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      <main className="max-w-[1200px] mx-auto px-10 max-md:px-6 max-sm:px-4 pt-10 max-sm:pt-6">
        <div className="grid grid-cols-[1.4fr_1fr] gap-6 items-start max-lg:grid-cols-1">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Main context card */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-7">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-2">
                    Group expense
                  </div>
                  <h1 className="text-[34px] font-bold tracking-tight m-0 mb-2 leading-[1.1]">
                    Q3 Client Infrastructure &amp; Tooling
                  </h1>
                  <p className="text-text-secondary text-sm m-0 max-w-[380px]">
                    Collection organized by <strong className="text-text-primary">Alex Rivera</strong> for
                    shared AWS, design, and API costs.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 text-white bg-action px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(255,149,0,0.3)]">
                    <span className="msym text-base">timer</span>
                    <span className="font-mono font-bold text-base tracking-[0.02em] [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
                      {formatCountdown(secondsLeft)}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mt-1.5">
                    Deadline countdown
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-end justify-between mb-2">
                <div className="font-mono accent-grad-text text-2xl font-bold tracking-tight">
                  $5,550.00 <span className="font-mono text-text-secondary font-medium text-sm">/ $7,200.00</span>
                </div>
                <div className="text-[13px] font-bold">77% collected</div>
              </div>
              <div className="h-2.5 w-full bg-neutral-light rounded-full overflow-hidden">
                <div className="h-full w-[77%] rounded-full bg-gradient-brand" />
              </div>

              <div className="flex items-center gap-2.5 mt-4.5">
                <div className="flex">
                  <Avatar initials="JS" bg="#007AFF" textColor="white" size={32} className="-mr-2" />
                  <Avatar initials="EM" bg="#FF9500" textColor="white" size={32} className="-mr-2" />
                  <Avatar initials="MK" bg="#263143" textColor="white" size={32} className="-mr-2" />
                  <Avatar initials="+4" bg="#ECEDF9" textColor="#454652" size={32} />
                </div>
                <span className="text-[13px] text-action-hover font-semibold">7 participants joined</span>
              </div>
            </div>

            {/* Secondary metadata */}
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-4.5 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-[10px] bg-info-light flex items-center justify-center shrink-0">
                  <span className="msym accent-grad-text text-xl">receipt_long</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-0.5">
                    Bill reference
                  </div>
                  <div className="font-mono text-sm font-semibold">#AWS-Q3-0714</div>
                </div>
              </div>
              <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-4.5 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-[10px] bg-neutral-light flex items-center justify-center shrink-0">
                  <span className="msym text-text-secondary text-xl">verified_user</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-0.5">
                    Payment protection
                  </div>
                  <div className="text-sm font-semibold">Rails-Escrow active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Your slice */}
          <div className="sticky top-20 max-lg:static">
            <div className="bg-white/[0.82] backdrop-blur-xl border-[0.5px] border-border/60 rounded-[14px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 py-8 flex flex-col items-center text-center">
              <div className="accent-grad-text text-[15px] font-bold tracking-[0.15em] uppercase mb-5">
                Your slice
              </div>

              {/* Pie glyph */}
              <div className="relative w-[180px] h-[180px] mb-6">
                <div
                  className="w-[180px] h-[180px] rounded-full shadow-[inset_0_0_0_0.5px_rgba(198,197,212,0.6)]"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #007AFF 0deg 54deg, #00C7BE 54deg 60deg, #FF9500 60deg 277deg, #ECEDF9 277deg 360deg)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center">
                    <div className="text-[9px] font-semibold tracking-[0.08em] uppercase text-text-secondary">
                      Your slice
                    </div>
                    <div className="text-2xl font-bold tracking-tight">15%</div>
                  </div>
                </div>
              </div>

              <div className="mb-7">
                <div className="text-[44px] font-bold tracking-tight leading-none">${SHARE_AMOUNT.toFixed(2)}</div>
                <p className="text-[13px] text-text-secondary mt-2.5 mb-0">
                  Includes AWS compute, S3 storage &amp; Figma seats
                </p>
              </div>

              <button
                type="button"
                onClick={handleClaim}
                disabled={paying || connecting}
                className="w-full h-[52px] inline-flex items-center justify-center gap-2 bg-gradient-brand text-white border-none rounded-full text-[15px] font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98 mb-3 disabled:opacity-60"
              >
                <span className="msym text-lg">
                  {!address ? 'account_balance_wallet' : biometricStage === 'verifying' ? 'fingerprint' : 'lock'}
                </span>
                {!address
                  ? 'Connect wallet to pay'
                  : paying && biometricStage === 'verifying'
                    ? 'Verify with Face ID / Touch ID…'
                    : paying
                      ? 'Settling…'
                      : 'Approve & Settle'}
              </button>

              {(payError ?? walletError) && (
                <div className="mb-3 text-[11px] text-[#93000a] text-center">{payError ?? walletError}</div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <span className="msym text-sm">{biometricStage === 'unsupported' ? 'lock' : 'fingerprint'}</span>
                {biometricStage === 'unsupported'
                  ? 'Biometric approval unavailable on this device — signed with your wallet only'
                  : 'Passwordless approval via Face ID / Touch ID, then wallet-signed on-chain'}
              </div>
            </div>

            {/* Payout currency picker — real SEP-24 hand-off for the PHP testnet anchor */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5 mt-5">
              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-3">
                Payout currency
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(['USDC', 'PHP', 'VND', 'IDR'] as const).map((code) => {
                  const isUsdc = code === 'USDC'
                  const corridor = isUsdc ? null : corridors[code]
                  const disabled = !isUsdc && !corridor!.enabled
                  return (
                    <button
                      key={code}
                      type="button"
                      disabled={disabled}
                      onClick={() => setPayoutCurrency(code)}
                      title={disabled ? `${code} corridor is architecture-ready but not connected in this demo` : undefined}
                      className={`py-2 rounded-lg text-xs font-bold border-[0.5px] ${
                        payoutCurrency === code
                          ? 'bg-gradient-brand text-white border-transparent cursor-pointer'
                          : disabled
                            ? 'bg-neutral-light text-text-muted border-border cursor-not-allowed'
                            : 'bg-white text-text-primary border-border cursor-pointer hover:bg-neutral-light'
                      }`}
                    >
                      {code}
                    </button>
                  )
                })}
              </div>

              {payoutCurrency === 'USDC' ? (
                <p className="text-xs text-text-secondary m-0">
                  Settling directly in USDC on-chain — no anchor hand-off needed.
                </p>
              ) : corridors[payoutCurrency].enabled ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenAnchor}
                    disabled={anchorLoading}
                    className="w-full py-2.5 rounded-full bg-action text-white border-none text-xs font-bold cursor-pointer disabled:opacity-60"
                  >
                    {anchorLoading ? 'Opening anchor…' : `Continue payout in ${payoutCurrency} (testnet anchor)`}
                  </button>
                  {anchorError && <div className="mt-2 text-[11px] text-[#93000a]">{anchorError}</div>}
                </>
              ) : (
                <p className="text-xs text-text-muted m-0">
                  {payoutCurrency} corridor is configured and architecture-ready, but not wired to a live anchor in
                  this demo.
                </p>
              )}

              <hr className="h-[0.5px] bg-border/50 border-none my-3" />
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <span className="msym text-text-muted text-sm">bolt</span>
                  <span className="text-xs text-text-secondary">Stellar network fee</span>
                </div>
                <span className="font-mono text-xs text-text-primary">0.00001 XLM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity rail */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold tracking-tight m-0">Collection activity</h3>
            <span className="text-[13px] font-bold text-info cursor-pointer hover:text-[#0060cc]">
              View all updates
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="min-w-[260px] bg-white border-[0.5px] border-border/60 rounded-[14px] p-4 flex items-center gap-3 shrink-0">
              <Avatar initials="JS" bg="#007AFF" textColor="white" size={40} bordered={false} />
              <div>
                <div className="text-[13px] font-semibold">
                  Jordan S. paid <span className="accent-grad-text font-bold">$720</span>
                </div>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mt-0.5">
                  2 hours ago
                </div>
              </div>
            </div>
            <div className="min-w-[260px] bg-white border-[0.5px] border-border/60 rounded-[14px] p-4 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-action/[0.14] flex items-center justify-center shrink-0">
                <span className="msym text-action-hover text-lg">notifications_active</span>
              </div>
              <div>
                <div className="text-[13px] font-semibold">3/8 slices claimed</div>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mt-0.5">
                  System update
                </div>
              </div>
            </div>
            <div className="min-w-[260px] bg-white border-[0.5px] border-border/60 rounded-[14px] p-4 flex items-center gap-3 shrink-0">
              <Avatar initials="EM" bg="#263143" textColor="white" size={40} bordered={false} />
              <div>
                <div className="text-[13px] font-semibold">Elena M. joined</div>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mt-0.5">
                  5 hours ago
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
