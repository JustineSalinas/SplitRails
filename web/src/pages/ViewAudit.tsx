import { useEffect, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { useWallet } from '../context/WalletContext'
import { baseUnitsToDollars, truncateAddress } from '../lib/amounts'
import {
  getEscrowParticipants,
  getEscrowTotals,
  getParticipantShare,
  isParticipantCleared,
  settleShare,
} from '../lib/escrow'

const GOAL = 5550
const CLOSES_IN_SECONDS = 8 * 60 + 28
const LIVE_AVATAR_COLORS = ['#007AFF', '#00C7BE', '#7A5AF8', '#FF9500', '#5c5f61', '#263143']

interface Participant {
  id: number
  name: string
  initials: string
  avatarBg: string
  amount?: number
  isMe?: boolean
  locked: boolean
  joined: boolean
}

const initialParticipants: Participant[] = [
  { id: 1, name: 'Alex Rivera', initials: 'AR', avatarBg: '#007AFF', amount: 1350, locked: true, joined: true },
  { id: 2, name: 'Sarah Chen', initials: 'SC', avatarBg: '#00C7BE', amount: 960, locked: true, joined: true },
  { id: 3, name: 'Jordan Smith', initials: 'JS', avatarBg: '#7A5AF8', locked: false, joined: true },
  { id: 4, name: 'You (John)', initials: 'JD', avatarBg: '#E3E2E7', amount: 1410, isMe: true, locked: false, joined: true },
  { id: 5, name: 'Taylor W.', initials: '?', avatarBg: '#ECEDF9', locked: false, joined: false },
]

// Real per-participant history, once there's a live invoice to read. The
// contract only knows addresses (no names/avatars — that's off-chain
// identity data nobody's built yet), so each row's "name" is a truncated
// address, same convention as ReviewSplit's summary.
async function loadLiveParticipants(myAddress: string | null): Promise<Participant[] | null> {
  const addresses = await getEscrowParticipants()
  if (addresses.length === 0) return null
  return Promise.all(
    addresses.map(async (participantAddress, i) => {
      const [share, cleared] = await Promise.all([
        getParticipantShare(participantAddress),
        isParticipantCleared(participantAddress),
      ])
      return {
        id: i,
        name: truncateAddress(participantAddress),
        initials: participantAddress.slice(1, 3).toUpperCase(),
        avatarBg: LIVE_AVATAR_COLORS[i % LIVE_AVATAR_COLORS.length],
        amount: baseUnitsToDollars(share),
        isMe: participantAddress === myAddress,
        locked: cleared,
        joined: true,
      }
    }),
  )
}

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return [m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function ViewAudit() {
  const { address, connecting, error: walletError, connect } = useWallet()
  const [secondsLeft, setSecondsLeft] = useState(CLOSES_IN_SECONDS)
  const [participants, setParticipants] = useState(initialParticipants)
  const [liveParticipants, setLiveParticipants] = useState<Participant[] | null>(null)
  const [locking, setLocking] = useState(false)
  const [lockError, setLockError] = useState<string | null>(null)
  const [liveTotals, setLiveTotals] = useState<{ cleared: number; required: number } | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false
    getEscrowTotals()
      .then((totals) => {
        // get_totals() returns (cleared, required) — totals[0] is cleared.
        if (!cancelled) setLiveTotals({ cleared: baseUnitsToDollars(totals[0]), required: baseUnitsToDollars(totals[1]) })
      })
      .catch(() => {
        // no live escrow to read yet — fall back to the mock totals below
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    loadLiveParticipants(address)
      .then((rows) => {
        if (!cancelled && rows) setLiveParticipants(rows)
      })
      .catch(() => {
        // no live escrow to read yet — fall back to the mock participants below
      })
    return () => {
      cancelled = true
    }
  }, [address])

  async function handleLockMe() {
    if (!address) {
      await connect()
      return
    }
    setLocking(true)
    setLockError(null)
    try {
      await settleShare(address, address)
      if (liveParticipants) {
        const rows = await loadLiveParticipants(address)
        if (rows) setLiveParticipants(rows)
      } else {
        setParticipants((prev) => prev.map((p) => (p.isMe ? { ...p, locked: true } : p)))
      }
    } catch (err) {
      setLockError(err instanceof Error ? err.message : 'Failed to settle your share')
    } finally {
      setLocking(false)
    }
  }

  const displayParticipants = liveParticipants ?? participants
  const lockedAmount = liveTotals?.cleared ?? displayParticipants.reduce((sum, p) => sum + (p.locked ? (p.amount ?? 0) : 0), 0)
  const totalPot = liveTotals?.required ?? displayParticipants.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const partiesJoined = displayParticipants.filter((p) => p.joined).length
  const totalInvited = liveParticipants ? liveParticipants.length : 6
  const committedPct = Math.round((lockedAmount / GOAL) * 100)
  const circumference = 2 * Math.PI * 42
  const dashArray = `${(committedPct / 100) * circumference} ${circumference}`

  return (
    <div className="text-text-primary font-sans pb-20">
      <main className="max-w-[1120px] mx-auto px-10 max-md:px-6 max-sm:px-4 pt-10 max-sm:pt-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <nav className="flex items-center gap-1.5 mb-2">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                Active Split
              </span>
              <span className="msym text-sm text-text-muted">chevron_right</span>
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary">
                AWS Infrastructure — August
              </span>
            </nav>
            <h1 className="text-[32px] font-bold tracking-tight m-0 mb-1.5">Settlement in progress…</h1>
            <p className="text-text-secondary text-[15px] m-0 max-w-[460px]">
              Waiting for all participants to lock their contributions before finalizing the split.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-white bg-action px-4.5 py-2.5 rounded-full shadow-[0_2px_8px_rgba(232,99,10,0.3)]">
            <span className="msym text-[15px]">timer</span>
            <span className="text-[11px] font-bold tracking-[0.06em] uppercase">Closes in</span>
            <span className="font-mono font-bold text-[15px] tracking-[0.02em] [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
              {formatCountdown(secondsLeft)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-5 max-[900px]:grid-cols-1">
          {/* Left: Pie progress */}
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-10 max-md:p-6 max-sm:p-4 flex flex-col items-center justify-center">
            <div className="relative w-[280px] h-[280px] max-sm:w-[220px] max-sm:h-[220px]">
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="-rotate-90">
                <defs>
                  <linearGradient id="pieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#007AFF" />
                    <stop offset="100%" stopColor="#00C7BE" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-light)" strokeWidth="13" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#pieGrad)"
                  strokeWidth="13"
                  strokeLinecap="butt"
                  strokeDasharray={dashArray}
                  className="transition-[stroke-dasharray] duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-1">
                  Total pot
                </span>
                <span className="font-mono text-[34px] font-bold tracking-tight">${totalPot.toFixed(2)}</span>
                <div className="inline-flex items-center gap-1.5 text-white bg-gradient-brand px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.03em] uppercase shadow-[0_2px_6px_rgba(0,122,255,0.2)] mt-3.5 animate-pulse">
                  <span className="msym fill text-sm">sync</span> {committedPct}% committed
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 max-sm:gap-3 w-full max-w-[440px] mt-10">
              <div className="text-center">
                <div className="text-[13px] font-bold text-text-secondary mb-2">Goal</div>
                <div className="font-mono text-[22px] font-bold">${GOAL.toFixed(2)}</div>
              </div>
              <div className="text-center border-l-[0.5px] border-r-[0.5px] border-border">
                <div className="text-[13px] font-bold text-text-secondary mb-2">Parties</div>
                <div className="font-mono text-[22px] font-bold">{partiesJoined} / {totalInvited}</div>
              </div>
              <div className="text-center">
                <div className="text-[13px] font-bold text-text-secondary mb-2">Locked</div>
                <div className="font-mono text-[22px] font-bold">${lockedAmount}</div>
              </div>
            </div>

            <button
              type="button"
              className="mt-7 inline-flex items-center gap-2 text-white bg-action px-4.5 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-[0.06em] cursor-pointer border-none shadow-[0_2px_8px_rgba(232,99,10,0.3)]"
            >
              <span className="msym text-base">campaign</span>Nudge pending
            </button>
          </div>

          {/* Right: Participants */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card overflow-hidden">
              <div className="px-6 py-5 flex items-center justify-between">
                <h3 className="text-base font-bold m-0">Participants</h3>
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                  {liveParticipants ? `${totalInvited} on invoice` : `${totalInvited} invited`}
                </span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />

              {(lockError ?? walletError) && (
                <div className="px-6 pt-3 text-[11px] text-[#93000a]">{lockError ?? walletError}</div>
              )}

              {displayParticipants.map((p) => (
                <div key={p.id}>
                  <div
                    className="px-6 py-4 flex items-center justify-between gap-3"
                    style={{ opacity: p.joined ? 1 : 0.55 }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar initials={p.initials} bg={p.avatarBg} size={40} bordered={false} textColor="white" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm flex items-center gap-1.5">
                          {p.name}
                          {p.isMe && (
                            <span className="text-[9px] bg-neutral-light text-text-secondary px-1.5 py-0.5 rounded font-bold uppercase">
                              Me
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-xs text-text-muted">
                          {!p.joined
                            ? "Hasn't joined yet"
                            : p.amount === undefined
                              ? 'Estimating…'
                              : p.isMe
                                ? p.locked
                                  ? `$${p.amount.toFixed(2)} locked`
                                  : `$${p.amount.toFixed(2)} pending`
                                : `$${p.amount.toFixed(2)} contributed`}
                        </div>
                      </div>
                    </div>
                    {p.isMe && !p.locked ? (
                      <button
                        type="button"
                        onClick={handleLockMe}
                        disabled={locking || connecting}
                        className="bg-gradient-brand text-white border-none py-2 px-4.5 rounded-full text-xs font-bold tracking-[0.02em] cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-97 disabled:opacity-60"
                      >
                        {!address ? 'Connect wallet' : locking ? 'Locking…' : 'Lock now'}
                      </button>
                    ) : !p.joined ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.03em] uppercase bg-neutral-light text-text-muted">
                        <span className="msym fill text-[13px]">mail</span>Invited
                      </span>
                    ) : p.locked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.03em] uppercase bg-gradient-brand text-white shadow-[0_2px_6px_rgba(0,122,255,0.2)]">
                        <span className="msym fill text-[13px]">lock</span>Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.03em] uppercase bg-action text-white animate-pulse">
                        <span className="msym fill text-[13px]">pending</span>Pending
                      </span>
                    )}
                  </div>
                  <hr className="h-[0.5px] bg-border/50 border-none" />
                </div>
              ))}

              <div className="px-6 py-4 text-center">
                <button
                  type="button"
                  className="bg-transparent border-none text-sm font-semibold text-text-primary cursor-pointer"
                >
                  View all details
                </button>
              </div>
            </div>

            {/* Rule summary */}
            <div className="bg-neutral-light/60 border-[0.5px] border-border rounded-[14px] p-5.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="msym text-base text-text-secondary">info</span>
                <span className="font-bold text-sm text-text-secondary">Settlement rule</span>
              </div>
              <p className="text-[13px] text-text-secondary leading-[1.5] m-0">
                This split is set to <strong>Mutual consent</strong>. It finalizes once 100% of participants lock
                their amounts. A dispute resets the settlement to its last stable state.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
