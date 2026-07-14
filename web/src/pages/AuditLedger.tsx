import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { baseUnitsToDollars } from '../lib/amounts'
import { getEscrowStatus, getEscrowTotals, type EscrowStatus } from '../lib/escrow'
import { getTxLog, stellarExpertTxUrl, type TxLogEntry } from '../lib/txLog'

interface Contribution {
  id: number
  name: string
  initials: string
  avatarBg: string
  amount: number
}

interface HashEvent {
  hash: string
}

const contributions: Contribution[] = [
  { id: 1, name: 'You (John)', initials: 'JD', avatarBg: '#007AFF', amount: 1410 },
  { id: 2, name: 'Alex Rivera', initials: 'AR', avatarBg: '#007AFF', amount: 1350 },
  { id: 3, name: 'Sarah Chen', initials: 'SC', avatarBg: '#00C7BE', amount: 960 },
]

const TOTAL_SETTLED = 3720
const GOAL = 5550
const PARTICIPANTS = 5
const VENDOR = 'Amazon Web Services'

function CopyHash({ hash }: HashEvent) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-2 inline-flex items-center gap-2 bg-neutral-light rounded-lg px-3 py-2 cursor-pointer border-none active:scale-97 transition-transform duration-150"
    >
      <span className="font-mono text-xs">{hash}</span>
      <span className="msym text-sm text-text-muted">{copied ? 'check' : 'content_copy'}</span>
    </button>
  )
}

function LiveTxLink({ entry }: { entry: TxLogEntry }) {
  return (
    <a
      href={stellarExpertTxUrl(entry.hash)}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-2 bg-neutral-light rounded-lg px-3 py-2 no-underline text-inherit active:scale-97 transition-transform duration-150"
    >
      <span className="font-mono text-xs">
        {entry.hash.slice(0, 6)}…{entry.hash.slice(-6)}
      </span>
      <span className="msym text-sm text-text-muted">open_in_new</span>
    </a>
  )
}

function statusLabel(status: EscrowStatus | null) {
  if (!status) return null
  if (status.tag === 'Open') return { label: 'Open', className: 'bg-action/[0.14] text-action-hover' }
  if (status.tag === 'Released') return { label: 'Settled', className: 'bg-success-light text-success' }
  return { label: 'Rolled back', className: 'bg-neutral-light text-text-secondary' }
}

export function AuditLedger() {
  const [liveTotals, setLiveTotals] = useState<{ cleared: number; required: number } | null>(null)
  const [liveStatus, setLiveStatus] = useState<EscrowStatus | null>(null)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [liveTxLog] = useState<TxLogEntry[]>(() => getTxLog())

  useEffect(() => {
    let cancelled = false
    async function loadLiveData() {
      try {
        const [totals, status] = await Promise.all([getEscrowTotals(), getEscrowStatus()])
        if (cancelled) return
        setLiveTotals({ cleared: baseUnitsToDollars(totals[1]), required: baseUnitsToDollars(totals[0]) })
        setLiveStatus(status)
      } catch (err) {
        if (!cancelled) setLiveError(err instanceof Error ? err.message : 'Could not load on-chain data')
      }
    }
    loadLiveData()
    return () => {
      cancelled = true
    }
  }, [])

  const totalSettled = liveTotals?.cleared ?? TOTAL_SETTLED
  const goal = liveTotals?.required ?? GOAL
  const badge = statusLabel(liveStatus)

  function handleExportCsv() {
    const rows = [
      ['Participant', 'Amount'],
      ...contributions.map((c) => [c.name, c.amount.toFixed(2)]),
      ['Total settled', totalSettled.toFixed(2)],
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aws-infra-q3-ledger.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      <main className="max-w-[1120px] mx-auto px-10 max-md:px-6 max-sm:px-4 pt-10 max-sm:pt-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <nav className="flex items-center gap-1.5 mb-2">
              <Link to="/" className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                Splits
              </Link>
              <span className="msym text-sm text-text-muted">chevron_right</span>
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary">
                Split Ledger
              </span>
            </nav>
            <h1 className="text-[32px] font-bold tracking-tight m-0 mb-1.5">AWS Infrastructure — August</h1>
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold ${badge?.className ?? 'bg-success-light text-success'}`}
              >
                <span className="msym fill text-base">check_circle</span>
                {badge?.label ?? 'Settled'}
              </span>
              <span className="text-[13px] text-text-muted">
                {liveError ? 'Live data unavailable' : 'Closed Oct 24, 2023 · 14:32'}
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Link
              to="/"
              className="bg-gradient-brand text-white border-none py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer inline-flex items-center gap-2 shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)]"
            >
              <span className="msym text-base">home</span>Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-action text-white border-none py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer inline-flex items-center gap-2 shadow-[0_2px_8px_rgba(232,99,10,0.25)]"
            >
              <span className="msym text-base">download</span>Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1.5fr] gap-5 items-start max-[900px]:grid-cols-1">
          {/* Left: summary */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-6">
              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2">
                Total settled
              </div>
              <div className="text-[32px] font-bold tracking-tight mb-5">${totalSettled.toFixed(2)}</div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-text-secondary">Goal</span>
                <span className="font-mono text-[13px] font-semibold">${goal.toFixed(2)}</span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-text-secondary">Participants</span>
                <span className="font-mono text-[13px] font-semibold">{PARTICIPANTS}</span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-text-secondary">Vendor</span>
                <span className="text-[13px] font-semibold">{VENDOR}</span>
              </div>
            </div>

            {/* Per-participant breakdown */}
            <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-6">
              <h3 className="text-[15px] font-bold m-0 mb-3.5">Contributions</h3>
              <div className="flex flex-col gap-3.5">
                {contributions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={c.initials} bg={c.avatarBg} size={28} bordered textColor="white" />
                      <span className="text-[13px] font-semibold">{c.name}</span>
                    </div>
                    <span className="font-mono text-[13px] font-bold">${c.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: event timeline */}
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card px-6 py-7">
            <h3 className="text-base font-bold m-0 mb-5.5">Event history</h3>

            {liveTxLog.length > 0 && (
              <div className="flex flex-col mb-6">
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-3">
                  Live on-chain actions this session
                </div>
                {liveTxLog.map((entry) => (
                  <div key={entry.hash} className="flex gap-4 relative pb-6">
                    <div className="absolute left-[17px] top-[34px] bottom-[-8px] w-0.5 bg-border" />
                    <div className="w-[34px] h-[34px] rounded-full bg-success-light flex items-center justify-center shrink-0 z-[1]">
                      <span className="msym fill text-success text-[17px]">check_circle</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{entry.label}</span>
                        <span className="font-mono text-xs text-text-muted">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <LiveTxLink entry={entry} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex gap-4 relative pb-6">
                <div className="absolute left-[17px] top-[34px] bottom-[-8px] w-0.5 bg-border" />
                <div className="w-[34px] h-[34px] rounded-full bg-neutral-light flex items-center justify-center shrink-0 z-[1]">
                  <span className="msym text-text-secondary text-[17px]">add_circle</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Split created</span>
                    <span className="font-mono text-xs text-text-muted">Oct 22, 09:04</span>
                  </div>
                  <p className="text-[13px] text-text-secondary mt-0.5 mb-0">
                    You created "AWS Infrastructure — August" with a goal of $5,550.00.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 relative pb-6">
                <div className="absolute left-[17px] top-[34px] bottom-[-8px] w-0.5 bg-border" />
                <div className="w-[34px] h-[34px] rounded-full bg-neutral-light flex items-center justify-center shrink-0 z-[1]">
                  <span className="msym text-text-secondary text-[17px]">group_add</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">4 participants joined</span>
                    <span className="font-mono text-xs text-text-muted">Oct 22, 09:20</span>
                  </div>
                  <p className="text-[13px] text-text-secondary mt-0.5 mb-0">
                    Alex, Sarah, Jordan, and Taylor accepted the invite.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 relative pb-6">
                <div className="absolute left-[17px] top-[34px] bottom-[-8px] w-0.5 bg-border" />
                <div className="w-[34px] h-[34px] rounded-full bg-gradient-brand flex items-center justify-center shrink-0 z-[1]">
                  <span className="msym fill text-white text-[17px]">lock</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Alex Rivera locked $1,350.00</span>
                    <span className="font-mono text-xs text-text-muted">Oct 23, 18:41</span>
                  </div>
                  <CopyHash hash="0x71c...a4f2" />
                </div>
              </div>

              <div className="flex gap-4 relative pb-6">
                <div className="absolute left-[17px] top-[34px] bottom-[-8px] w-0.5 bg-border" />
                <div className="w-[34px] h-[34px] rounded-full bg-gradient-brand flex items-center justify-center shrink-0 z-[1]">
                  <span className="msym fill text-white text-[17px]">lock</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Sarah Chen locked $960.00</span>
                    <span className="font-mono text-xs text-text-muted">Oct 24, 08:12</span>
                  </div>
                  <CopyHash hash="0x92b...3e91" />
                </div>
              </div>

              <div className="flex gap-4 relative pb-6">
                <div className="absolute left-[17px] top-[34px] bottom-[-8px] w-0.5 bg-border" />
                <div className="w-[34px] h-[34px] rounded-full bg-gradient-brand flex items-center justify-center shrink-0 z-[1]">
                  <span className="msym fill text-white text-[17px]">lock</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">You locked $1,410.00</span>
                    <span className="font-mono text-xs text-text-muted">Oct 24, 13:58</span>
                  </div>
                  <CopyHash hash="0x7a2...f8e1" />
                </div>
              </div>

              <div className="flex gap-4 relative">
                <div className="w-[34px] h-[34px] rounded-full bg-success-light flex items-center justify-center shrink-0">
                  <span className="msym fill text-success text-[17px]">check_circle</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Settlement finalized · funds transferred</span>
                    <span className="font-mono text-xs text-text-muted">Oct 24, 14:32</span>
                  </div>
                  <p className="text-[13px] text-text-secondary mt-0.5 mb-0">
                    $3,720.00 sent to Amazon Web Services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
