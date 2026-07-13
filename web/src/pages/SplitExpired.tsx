import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'

interface RefundedParticipant {
  id: number
  name: string
  initials: string
  avatarBg: string
  avatarTextColor: string
  amount: number
  walletHash?: string
  refunded: boolean
}

const participants: RefundedParticipant[] = [
  {
    id: 1,
    name: 'James Sterling',
    initials: 'JS',
    avatarBg: '#E3E2E7',
    avatarTextColor: '#414755',
    amount: 500,
    walletHash: '0x71C...a4f2',
    refunded: true,
  },
  {
    id: 2,
    name: 'Alina Moore',
    initials: 'AM',
    avatarBg: '#C6C6CB',
    avatarTextColor: '#1a1b1f',
    amount: 340,
    walletHash: '0x92B...3e91',
    refunded: true,
  },
  {
    id: 3,
    name: 'Robert Kincaid',
    initials: 'RK',
    avatarBg: '#ECEDF9',
    avatarTextColor: 'var(--color-text-muted)',
    amount: 1160,
    refunded: false,
  },
]

const ORIGINAL_GOAL = 2000
const totalRefunded = participants.filter((p) => p.refunded).reduce((sum, p) => sum + p.amount, 0)
const collectedAtExpiry = participants.reduce((sum, p) => sum + (p.refunded ? p.amount : 0), 0)
const fundedPct = Math.round((collectedAtExpiry / ORIGINAL_GOAL) * 100)
const circumference = 2 * Math.PI * 45
const dashArray = `${(fundedPct / 100) * circumference} ${circumference}`

export function SplitExpired() {
  return (
    <div className="text-text-primary font-sans pb-20">
      <style>{`
        @keyframes wedge-fade { 0% { opacity: 0.85; } 100% { opacity: 0.4; } }
      `}</style>

      <main className="max-w-[1120px] mx-auto px-10 pt-10">
        {/* Status banner */}
        <div className="bg-neutral-light rounded-[14px] p-6 flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neutral/[0.14] flex items-center justify-center shrink-0">
              <span className="msym text-[28px] text-neutral">timer_off</span>
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight m-0 mb-1">Deadline missed — Split Cancelled</h1>
              <p className="text-sm text-text-secondary m-0">
                All collected funds have been automatically refunded to participants.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-mono bg-white px-4 py-2 rounded-full border-[0.5px] border-border/60 text-[13px] text-neutral font-semibold">
              Status: VOID_EXPIRED
            </div>
            <Link
              to="/new"
              className="bg-neutral text-white border-none py-3 px-6 rounded-full text-sm font-semibold cursor-pointer inline-flex items-center gap-2 hover:opacity-90"
            >
              <span className="msym text-lg">refresh</span>Try new split
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1.3fr] gap-5 max-[900px]:grid-cols-1">
          {/* Left: donut viz */}
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card min-h-[400px] flex flex-col items-center justify-center p-10">
            <div className="relative w-[260px] h-[260px]">
              <svg width="260" height="260" viewBox="0 0 100 100" className="-rotate-90">
                <defs>
                  <linearGradient id="pieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#007AFF" />
                    <stop offset="100%" stopColor="#00C7BE" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-neutral-light)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#pieGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={dashArray}
                  className="animate-[wedge-fade_3s_ease-in-out_infinite_alternate]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                  Total refunded
                </span>
                <span className="text-[34px] font-bold tracking-tight text-neutral mt-1">
                  ${totalRefunded.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-[13px] text-text-muted text-center max-w-[260px] mt-7 mb-0">
              Visualization represents the {fundedPct}% funding reached before the 24h expiration window.
            </p>
          </div>

          {/* Right: refund list */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold m-0">Refunded Participants</h2>
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral">
                {participants.filter((p) => p.refunded).length} recovered
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`bg-white border-[0.5px] rounded-xl p-4 flex items-center justify-between transition-colors duration-150 ${
                    p.refunded
                      ? 'border-border/40 hover:border-border'
                      : 'border-dashed border-border/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar
                      initials={p.initials}
                      bg={p.avatarBg}
                      textColor={p.avatarTextColor}
                      size={40}
                      bordered={false}
                    />
                    <div>
                      <div
                        className={`font-semibold text-sm ${!p.refunded ? 'text-text-muted' : ''}`}
                      >
                        {p.name}
                      </div>
                      {p.refunded ? (
                        <div className="font-mono text-xs flex items-center gap-1 mt-0.5">
                          <span className="msym text-[13px] text-text-muted">link</span>
                          <span className="accent-grad-text">{p.walletHash}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted mt-0.5">Awaiting payment when expired</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono font-bold text-[15px] ${!p.refunded ? 'text-text-muted' : ''}`}
                    >
                      ${p.amount.toFixed(2)}
                    </div>
                    {p.refunded ? (
                      <div className="text-xs flex items-center justify-end gap-1 mt-0.5">
                        <span className="msym fill text-[13px] text-info">check_circle</span>
                        <span className="accent-grad-text font-semibold">Refunded</span>
                      </div>
                    ) : (
                      <div className="text-xs text-text-muted mt-0.5">Uncollected</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-neutral-light/60 border-[0.5px] border-border rounded-[14px] px-5 py-4.5">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[13px] text-text-secondary">Original goal</span>
                <span className="font-mono text-[13px]">${ORIGINAL_GOAL.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[13px] text-text-secondary">Collected at expiry</span>
                <span className="font-mono text-[13px]">${collectedAtExpiry.toFixed(2)}</span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none my-2" />
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[13px] font-bold">Total funds returned</span>
                <span className="font-mono text-[13px] font-bold">${totalRefunded.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
