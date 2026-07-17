import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { useWallet } from '../context/WalletContext'
import { corridors, type Corridor } from '../lib/anchor'
import {
  getEscrowClient,
  settleShare,
  getParticipantShare,
  isParticipantCleared,
  getEscrowTotals,
} from '../lib/escrow'
import { baseUnitsToDollars } from '../lib/amounts'
import { createPasskey, isPasskeySupported, signWithPasskey, verifyAssertion } from '../lib/passkey'
import { loadPasskeyRegistration, savePasskeyRegistration } from '../lib/passkeyStore'
import { logPasskeyGate } from '../lib/txLog'

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

function parseSettleError(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'Failed to settle your share. Please try again.'
  }
  const msg = err.message
  if (
    msg.includes('resulting balance is not within the allowed range') ||
    msg.includes('Error(Contract, #10)') ||
    msg.includes('VM trap')
  ) {
    return 'Insufficient USDC balance: Your connected wallet does not have enough testnet USDC to pay your share. Please switch to a funded wallet or request testnet USDC from the Circle Faucet.'
  }
  if (msg.includes('Error(Contract, #3)') || msg.includes('UnknownParticipant')) {
    return 'Your connected wallet is not registered as a participant in this split escrow. Please switch accounts in Freighter to one of the split participants.'
  }
  if (msg.includes('AlreadyCleared') || msg.includes('Error(Contract, #6)')) {
    return 'You have already settled your share for this split.'
  }
  if (msg.includes('NotOpen') || msg.includes('Error(Contract, #7)')) {
    return 'This split is no longer open for payment.'
  }
  return msg
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

  // Live contract state
  const [liveShare, setLiveShare] = useState<number | null>(null)
  const [isParticipant, setIsParticipant] = useState(true)
  const [isCleared, setIsCleared] = useState(false)
  const [liveTotalCleared, setLiveTotalCleared] = useState<number | null>(null)
  const [liveTotalRequired, setLiveTotalRequired] = useState<number | null>(null)
  const [isLiveContract, setIsLiveContract] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!contractId) {
      setIsLiveContract(false)
      return
    }
    let cancelled = false
    async function loadLiveContractState() {
      try {
        const totals = await getEscrowTotals(contractId)
        if (cancelled) return
        setLiveTotalCleared(baseUnitsToDollars(totals[0]))
        setLiveTotalRequired(baseUnitsToDollars(totals[1]))
        setIsLiveContract(true)

        if (address) {
          try {
            const shareBig = await getParticipantShare(address, contractId)
            if (cancelled) return
            setLiveShare(baseUnitsToDollars(shareBig))
            setIsParticipant(true)

            const cleared = await isParticipantCleared(address, contractId)
            if (cancelled) return
            setIsCleared(cleared)
          } catch (shareErr: any) {
            if (cancelled) return
            const errorMsg = shareErr.message || ''
            if (errorMsg.includes('UnknownParticipant') || errorMsg.includes('Error(Contract, #3)')) {
              setIsParticipant(false)
            }
          }
        }
      } catch (err) {
        if (cancelled) return
        setIsLiveContract(false)
      }
    }
    loadLiveContractState()
    return () => {
      cancelled = true
    }
  }, [contractId, address])

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
        const targetContractId = contractId || 'CDENUPG5EBM6ZCTOH7UVJMDHDLS4ZWABMUJFIV42LKEPYVFVPKO2P3IH'
        logPasskeyGate(targetContractId, address)
        await new Promise((resolve) => setTimeout(resolve, 1200))
      }
      await settleShare(address, address, contractId)
      navigate('/locked')
    } catch (err) {
      setPayError(parseSettleError(err))
      if (isPasskeySupported()) {
        setBiometricStage('idle')
      }
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
      const shareAmountVal = isLiveContract && liveShare !== null ? liveShare : SHARE_AMOUNT
      const { interactiveUrl } = await corridor.initWithdraw(shareAmountVal.toFixed(2))
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
              </div>              {/* Progress */}
              <div className="flex items-end justify-between mb-2">
                <div className="font-mono accent-grad-text text-2xl font-bold tracking-tight">
                  ${(isLiveContract && liveTotalCleared !== null ? liveTotalCleared : 5550).toFixed(2)}{' '}
                  <span className="font-mono text-text-secondary font-medium text-sm">
                    / ${(isLiveContract && liveTotalRequired !== null ? liveTotalRequired : 7200).toFixed(2)}
                  </span>
                </div>
                <div className="text-[13px] font-bold">
                  {Math.round(
                    (((isLiveContract && liveTotalCleared !== null ? liveTotalCleared : 5550) /
                      (isLiveContract && liveTotalRequired !== null ? liveTotalRequired : 7200)) *
                      100)
                  )}% collected
                </div>
              </div>
              <div className="h-2.5 w-full bg-neutral-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (((isLiveContract && liveTotalCleared !== null ? liveTotalCleared : 5550) /
                        (isLiveContract && liveTotalRequired !== null ? liveTotalRequired : 7200)) *
                        100)
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-2.5 mt-4.5">
                <div className="flex">
                  <Avatar initials="JS" bg="#007AFF" textColor="white" size={32} className="-mr-2" />
                  <Avatar initials="EM" bg="#FF9500" textColor="white" size={32} className="-mr-2" />
                  <Avatar initials="MK" bg="#263143" textColor="white" size={32} className="-mr-2" />
                  <Avatar initials="+4" bg="#ECEDF9" textColor="#454652" size={32} />
                </div>
                <span className="text-[13px] text-action-hover font-semibold">
                  {isLiveContract ? 'Live escrow contract tracking active' : '7 participants joined'}
                </span>
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
                  <div className="font-mono text-sm font-semibold">
                    {isLiveContract ? `#ESCROW-${contractId?.slice(0, 6)}` : '#AWS-Q3-0714'}
                  </div>
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
                  <div className="text-sm font-semibold">
                    {isLiveContract ? 'Soroban On-Chain' : 'Rails-Escrow active'}
                  </div>
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
                      isLiveContract && liveShare !== null && liveTotalRequired !== null
                        ? `conic-gradient(from 0deg, #007AFF 0deg ${Math.round((liveShare / liveTotalRequired) * 360)}deg, #ECEDF9 ${Math.round((liveShare / liveTotalRequired) * 360)}deg 360deg)`
                        : 'conic-gradient(from 0deg, #007AFF 0deg 54deg, #00C7BE 54deg 60deg, #FF9500 60deg 277deg, #ECEDF9 277deg 360deg)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center">
                    <div className="text-[9px] font-semibold tracking-[0.08em] uppercase text-text-secondary">
                      Your slice
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                      {isLiveContract && liveShare !== null && liveTotalRequired !== null
                        ? `${Math.round((liveShare / liveTotalRequired) * 100)}%`
                        : '15%'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-7">
                <div className="text-[44px] font-bold tracking-tight leading-none">
                  ${(isLiveContract && liveShare !== null ? liveShare : SHARE_AMOUNT).toFixed(2)}
                </div>
                <p className="text-[13px] text-text-secondary mt-2.5 mb-0">
                  {isLiveContract ? 'Your exact registered on-chain share amount' : 'Includes AWS compute, S3 storage & Figma seats'}
                </p>
              </div>

              {/* Warning/Success alerts */}
              {address && !isParticipant && (
                <div className="mb-4 rounded-2xl border-[0.5px] border-amber-200 bg-amber-50 p-4 flex gap-3 items-start text-left">
                  <span className="msym text-[22px] text-amber-500 shrink-0 mt-0.5">warning</span>
                  <div>
                    <div className="text-[13px] font-bold text-amber-900 mb-0.5">Not a participant</div>
                    <p className="text-[12px] text-amber-800 m-0 leading-relaxed">
                      Your connected wallet ({address.slice(0, 4)}…{address.slice(-4)}) is not registered in this split escrow. Please switch accounts in Freighter to pay.
                    </p>
                  </div>
                </div>
              )}

              {address && isCleared && (
                <div className="mb-4 rounded-2xl border-[0.5px] border-green-200 bg-green-50 p-4 flex gap-3 items-start text-left">
                  <span className="msym text-[22px] text-green-500 shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="text-[13px] font-bold text-green-900 mb-0.5">Share settled</div>
                    <p className="text-[12px] text-green-800 m-0 leading-relaxed">
                      You have already paid and settled your share for this split escrow.
                    </p>
                  </div>
                </div>
              )}

              {/* Error display */}
              {(payError ?? walletError) && (
                <div className="mb-4 w-full rounded-2xl border-[0.5px] border-[#FFDAD6] bg-[#FFDAD6]/30 p-4 flex gap-3 items-start text-left">
                  <span className="msym text-[22px] text-[#BA1A1A] shrink-0 mt-0.5">error</span>
                  <div>
                    <div className="text-[13px] font-bold text-[#93000a] mb-0.5">Payment failed</div>
                    <p className="text-[12px] text-[#BA1A1A] m-0 leading-relaxed">
                      {payError ?? walletError}
                    </p>
                    {(payError?.includes('USDC') || payError?.includes('balance')) && (
                      <p className="text-[11px] text-[#BA1A1A]/90 m-0 mt-2">
                        Need testnet USDC? You can request some from the{' '}
                        <a
                          href="https://faucet.circle.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold underline text-[#93000a]"
                        >
                          Circle Faucet
                        </a>{' '}
                        (choose Stellar Testnet corridor) or swap via Stellar Laboratory.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleClaim}
                disabled={paying || connecting || (address && !isParticipant) || isCleared}
                className="w-full h-[52px] inline-flex items-center justify-center gap-2 bg-gradient-brand text-white border-none rounded-full text-[15px] font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="msym text-lg">
                  {!address
                    ? 'account_balance_wallet'
                    : isCleared
                      ? 'check_circle'
                      : !isParticipant
                        ? 'block'
                        : biometricStage === 'verifying'
                          ? 'fingerprint animate-pulse'
                          : biometricStage === 'verified'
                            ? 'check_circle'
                            : 'lock'}
                </span>
                {!address
                  ? 'Connect wallet to pay'
                  : isCleared
                    ? 'Share already settled'
                    : !isParticipant
                      ? 'Not a participant'
                      : paying && biometricStage === 'verifying'
                        ? 'Verify with Face ID / Touch ID…'
                        : paying && biometricStage === 'verified'
                          ? 'Biometric verified! Sign on-chain…'
                          : paying
                            ? 'Settling on-chain…'
                            : 'Approve & Settle'}
              </button>

              {address && biometricStage !== 'unsupported' && (
                <div className="w-full bg-neutral-light/50 border-[0.5px] border-border/50 rounded-xl p-3.5 mb-4 text-left flex flex-col gap-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Approval Protocol</div>
                  
                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5">
                    <span className={`msym text-base ${biometricStage === 'verified' ? 'text-success' : biometricStage === 'verifying' ? 'text-action animate-pulse' : 'text-text-muted'}`}>
                      {biometricStage === 'verified' ? 'check_circle' : 'fingerprint'}
                    </span>
                    <div className="text-xs">
                      <span className={`font-semibold ${biometricStage === 'verified' || biometricStage === 'verifying' ? 'text-text-primary' : 'text-text-muted'}`}>
                        Step 1: Biometric Pre-Flight Gate
                      </span>
                      <p className="text-[10px] text-text-secondary m-0 leading-tight">
                        {biometricStage === 'verified' ? '✓ Signature verified.' : 'Cryptographically binds passkey credentials to this settlement hash.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5">
                    <span className={`msym text-base ${paying && biometricStage === 'verified' ? 'text-action animate-pulse' : 'text-text-muted'}`}>
                      account_balance_wallet
                    </span>
                    <div className="text-xs">
                      <span className={`font-semibold ${paying && biometricStage === 'verified' ? 'text-text-primary' : 'text-text-muted'}`}>
                        Step 2: On-Chain Wallet Signature
                      </span>
                      <p className="text-[10px] text-text-secondary m-0 leading-tight">
                        Freighter authorization to submit and settle your share on the Stellar network.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <span className="msym text-sm">{biometricStage === 'unsupported' ? 'lock' : 'fingerprint'}</span>
                {biometricStage === 'unsupported'
                  ? 'Biometric approval unavailable on this device — signed with your wallet only'
                  : 'Passwordless pre-flight approval via Face ID / Touch ID, then wallet-signed on-chain'}
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
                  {corridors[payoutCurrency].demoOnly && (
                    <div className="mb-3 p-2.5 rounded-lg bg-info-light/50 border-[0.5px] border-info/20 text-[11px] text-text-secondary text-left flex items-start gap-1.5">
                      <span className="msym text-sm text-info">info</span>
                      <span>
                        <strong>Demo Corridor:</strong> Points to the standard testnet anchor (SEP-24 USDC sandbox) as VND/IDR bank rails are out of scope.
                      </span>
                    </div>
                  )}
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
