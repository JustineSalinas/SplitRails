import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'

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
  { id: 1, name: 'You (John)', initials: 'JD', avatarBg: '#007AFF', amount: 470 },
  { id: 2, name: 'Alex Rivera', initials: 'AR', avatarBg: '#007AFF', amount: 450 },
  { id: 3, name: 'Sarah Chen', initials: 'SC', avatarBg: '#00C7BE', amount: 320 },
]

const TOTAL_SETTLED = 1240
const GOAL = 1850
const PARTICIPANTS = 5
const VENDOR = 'CloudKitchens Co.'

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

export function AuditLedger() {
  function handleExportCsv() {
    const rows = [
      ['Participant', 'Amount'],
      ...contributions.map((c) => [c.name, c.amount.toFixed(2)]),
      ['Total settled', TOTAL_SETTLED.toFixed(2)],
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dinner-at-nobu-ledger.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      <main className="max-w-[1120px] mx-auto px-10 pt-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <nav className="flex items-center gap-1.5 mb-2">
              <Link to="/activity" className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                Activity
              </Link>
              <span className="msym text-sm text-text-muted">chevron_right</span>
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary">
                Split Ledger
              </span>
            </nav>
            <h1 className="text-[32px] font-bold tracking-tight m-0 mb-1.5">Dinner at Nobu</h1>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-success-light text-success">
                <span className="msym fill text-base">check_circle</span>Settled
              </span>
              <span className="text-[13px] text-text-muted">Closed Oct 24, 2023 · 14:32</span>
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
              <div className="text-[32px] font-bold tracking-tight mb-5">${TOTAL_SETTLED.toFixed(2)}</div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-text-secondary">Goal</span>
                <span className="font-mono text-[13px] font-semibold">${GOAL.toFixed(2)}</span>
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
                    You created "Dinner at Nobu" with a goal of $1,850.00.
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
                    <span className="text-sm font-bold">Alex Rivera locked $450.00</span>
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
                    <span className="text-sm font-bold">Sarah Chen locked $320.00</span>
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
                    <span className="text-sm font-bold">You locked $470.00</span>
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
                    $1,240.00 sent to CloudKitchens Co.
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
