import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DonutChart } from '../components/DonutChart'
import { useWallet } from '../context/WalletContext'
import { dollarsToBaseUnits, truncateAddress } from '../lib/amounts'
import { initEscrow } from '../lib/escrow'
import type { EscrowDraft } from '../lib/escrowDraft'

interface ReviewParticipant {
  id: number
  name: string
  avatarBg: string
  donutColor?: string
  initials: string
  amount: number
  percent: number
  subtitle: string
  badge?: 'organizer' | 'locked'
  hasPaymentMethod: boolean
}

const GRADIENT = 'var(--gradient-brand)'

const mockParticipants: ReviewParticipant[] = [
  {
    id: 1,
    name: 'Riya (you)',
    avatarBg: GRADIENT,
    donutColor: 'gradient',
    initials: 'RM',
    amount: 113,
    percent: 25,
    subtitle: 'Will pay from Chase ••••4821',
    badge: 'organizer',
    hasPaymentMethod: true,
  },
  {
    id: 2,
    name: 'Alex Suarez',
    avatarBg: '#FF9500',
    donutColor: 'var(--color-chart-2)',
    initials: 'AS',
    amount: 113,
    percent: 25,
    subtitle: 'alex@rails.co · Apple Pay',
    badge: 'locked',
    hasPaymentMethod: true,
  },
  {
    id: 3,
    name: 'Mia Kwon',
    avatarBg: '#263143',
    initials: 'MK',
    amount: 113,
    percent: 25,
    subtitle: 'mia.k@rails.co · Bank transfer',
    hasPaymentMethod: true,
  },
  {
    id: 4,
    name: 'Theo Rowe',
    avatarBg: '#5c5f61',
    initials: 'TR',
    amount: 113,
    percent: 25,
    subtitle: 'theo@rails.co · No method set',
    hasPaymentMethod: false,
  },
]

const shareLink = 'splitrails.co/s/office-dinner'

export function ReviewSplit() {
  const navigate = useNavigate()
  const location = useLocation()
  const draft = location.state as EscrowDraft | null
  const { address: myAddress } = useWallet()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const participants: ReviewParticipant[] = useMemo(() => {
    if (!draft) return mockParticipants
    return draft.participants.map((p) => ({
      id: p.id,
      name: p.name,
      avatarBg: p.avatarBg,
      donutColor: p.donutColor,
      initials: p.initials,
      amount: p.amount,
      percent: draft.total > 0 ? Math.round((p.amount / draft.total) * 1000) / 10 : 0,
      subtitle: truncateAddress(p.address),
      badge: p.isPayer ? 'organizer' : undefined,
      hasPaymentMethod: true,
    }))
  }, [draft])

  const total = draft?.total ?? 452
  const missingMethod = participants.find((p) => !p.hasPaymentMethod)

  async function handleSend() {
    if (!draft) {
      navigate('/sent')
      return
    }
    if (!myAddress) {
      setSendError('Connect your wallet first')
      return
    }
    setSending(true)
    setSendError(null)
    try {
      await initEscrow(myAddress, {
        vendor: draft.vendorAddress,
        token: draft.tokenAddress,
        deadline: BigInt(draft.deadlineUnix),
        totalRequired: dollarsToBaseUnits(draft.total),
        shares: draft.participants.map((p) => [p.address, dollarsToBaseUnits(p.amount)] as const),
      })
      navigate('/sent', { state: draft })
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to open escrow')
    } finally {
      setSending(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`https://${shareLink}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="text-text-primary font-sans">
      {/* Breadcrumb + step */}
      <div className="max-w-[1240px] mx-auto px-10 pt-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-[13px] text-text-secondary">
          <Link to="/" className="text-text-secondary hover:text-text-primary">
            Splits
          </Link>
          <span className="msym text-sm text-text-muted">chevron_right</span>
          <Link to="/new" className="text-text-secondary hover:text-text-primary">
            New split
          </Link>
          <span className="msym text-sm text-text-muted">chevron_right</span>
          <span className="text-text-primary font-semibold">Review</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <div className="w-[22px] h-[22px] rounded-full bg-success-light text-success flex items-center justify-center">
              <span className="msym text-sm">check</span>
            </div>
            <span>Set up</span>
          </div>
          <div className="w-6 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-[22px] h-[22px] rounded-full bg-info text-white flex items-center justify-center text-[11px] font-bold">
              2
            </div>
            <span className="font-semibold text-text-primary">Review</span>
          </div>
          <div className="w-6 h-px bg-border" />
          <div className="flex items-center gap-1.5 opacity-50">
            <div className="w-[22px] h-[22px] rounded-full bg-white border-[0.5px] border-border flex items-center justify-center text-[11px] font-bold">
              3
            </div>
            <span>Send</span>
          </div>
        </div>
      </div>

      <main className="max-w-[1240px] mx-auto px-10 pt-6 pb-20">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-[34px] font-bold tracking-tight m-0 mb-1.5 leading-[1.1]">Review your split</h1>
            <p className="text-text-secondary text-[15px] m-0">
              Once everyone pays their share, SplitRails releases the full amount to the seller.
            </p>
          </div>
          <Link
            to="/new"
            className="inline-flex items-center gap-1 bg-transparent text-text-secondary border-none px-3 py-2 rounded-full text-[13px] font-semibold cursor-pointer hover:bg-info-light hover:text-text-primary"
          >
            <span className="msym text-base">arrow_back</span> Back to edit
          </Link>
        </div>

        <div className="grid grid-cols-[1fr_420px] gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Summary card */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
              <div className="flex items-center justify-between gap-4 mb-1">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                    Paying to
                  </div>
                  <div className="text-[22px] font-bold tracking-tight font-mono">
                    {draft ? truncateAddress(draft.vendorAddress) : 'Sora Restaurant'}
                  </div>
                  <div className="text-[13px] text-text-secondary mt-0.5">
                    {draft?.label ?? 'Office Dinner'} · {draft ? draft.dueDate : 'Jul 12, 2026'}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-success tracking-tight shrink-0">
                  <span className="msym text-sm">check_circle</span>Ready to send
                </span>
              </div>
              <hr className="h-[0.5px] bg-border/60 border-none my-4" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1">
                    Total to seller
                  </div>
                  <div className="font-mono tabular-nums text-xl font-bold">${total.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1">
                    Split
                  </div>
                  <div className="text-[15px] font-semibold">Equal · {participants.length} ways</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1">
                    Collect by
                  </div>
                  <div className="text-[15px] font-semibold">{draft?.dueDate ?? 'Jul 20, 2026'}</div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <div className="text-[15px] font-semibold tracking-tight">Each participant's share</div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Held in escrow until 100% is collected, then released to seller.
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-success tracking-tight shrink-0">
                  <span className="msym text-sm">check_circle</span>Balances to ${total.toFixed(2)}
                </span>
              </div>

              <div>
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-3.5 border-b-[0.5px] border-border/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.initials} bg={p.avatarBg} size={36} bordered={false} textColor="white" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">{p.name}</span>
                          {p.badge === 'organizer' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-light text-success">
                              Organizer
                            </span>
                          )}
                          {p.badge === 'locked' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-action/[0.14] text-action-hover">
                              <span className="msym text-[10px]">lock</span> Locked
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-secondary">{p.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[15px] font-bold">${p.amount.toFixed(2)}</div>
                      <div className="text-[11px] text-text-secondary">{p.percent}% share</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice */}
            {missingMethod && (
              <div className="py-3.5 px-4 bg-action rounded-xl flex gap-3 items-start shadow-[0_2px_8px_rgba(255,149,0,0.2)]">
                <span className="msym text-white text-xl shrink-0">info</span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white">
                    {missingMethod.name.split(' ')[0]} hasn't set a payment method
                  </div>
                  <div className="text-xs font-medium text-white/95 mt-0.5">
                    They'll be prompted to add one when they open the link.{' '}
                    <a href="#" className="text-white underline font-bold">
                      Remind me
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: sticky preview */}
          <div className="sticky top-20">
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-6 flex flex-col items-center">
              <div className="mb-5">
                <DonutChart
                  total={total}
                  centerLabel="Escrow target"
                  centerSubtitle={`0 of ${participants.length} paid in`}
                  slices={participants.map((p) => ({
                    id: p.id,
                    color: p.donutColor ?? p.avatarBg,
                    amount: p.amount,
                  }))}
                />
              </div>

              <div className="w-full flex flex-col gap-2.5 mb-5">
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>Total to seller</span>
                  <span className="font-mono font-semibold text-text-primary">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>Your share</span>
                  <span className="font-mono font-semibold text-text-primary">
                    ${(participants[0]?.amount ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>Held in escrow</span>
                  <span className="font-mono font-bold text-text-primary">
                    $0.00 <span className="text-text-muted font-normal">/ ${total.toFixed(2)}</span>
                  </span>
                </div>
                <hr className="h-[0.5px] bg-border/60 border-none" />
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>Collect by</span>
                  <span className="font-semibold text-text-primary">Jul 20, 2026</span>
                </div>
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>Auto-nudge</span>
                  <span className="font-semibold text-text-primary">After 3d overdue</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-brand text-white border-none py-3.5 px-5 rounded-full text-sm font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98"
              >
                Send payment request <span className="msym text-lg">arrow_forward</span>
              </button>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted">
                <span className="msym text-sm">lock</span>
                Funds released to seller only when 100% is paid in
              </div>
            </div>

            {/* Share link */}
            <div className="mt-3 bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-info-light flex items-center justify-center text-info shrink-0">
                <span className="msym">link</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-text-secondary">Everyone gets this link</div>
                <div className="font-mono text-[13px] font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  {shareLink}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy link"
                className="inline-flex items-center gap-1.5 bg-transparent text-text-secondary border-[0.5px] border-border hover:bg-info-light px-2.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0"
              >
                <span className="msym text-sm">{copied ? 'check' : 'content_copy'}</span>
                {copied && 'Copied'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirm sheet */}
      <div
        onClick={() => setSheetOpen(false)}
        className={`fixed inset-0 bg-text-primary/50 backdrop-blur-[6px] z-[60] transition-opacity duration-200 ${
          sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed left-1/2 bottom-0 w-full max-w-[480px] bg-white rounded-t-[20px] z-[70] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          sheetOpen ? 'translate-x-[-50%] translate-y-0' : 'translate-x-[-50%] translate-y-full'
        }`}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-2.5" />
        <div className="p-6 pb-8">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-info-light flex items-center justify-center mx-auto mb-3.5">
              <span
                className="msym text-[28px]"
                style={{
                  background: GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                send
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight m-0 mb-1.5">Send payment request?</h2>
            <p className="text-text-secondary text-sm m-0 leading-snug">
              Everyone gets a link to pay their share. SplitRails holds the funds and pays the vendor
              automatically once all {participants.length} shares are in.
            </p>
          </div>
          <div className="bg-bg border-[0.5px] border-border rounded-xl py-3.5 px-4 mb-4 flex flex-col gap-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Paying to</span>
              <span className="font-semibold text-text-primary font-mono">
                {draft ? truncateAddress(draft.vendorAddress) : 'Sora Restaurant'}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Escrow target</span>
              <span className="font-mono font-semibold text-text-primary">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Notify by</span>
              <span className="font-semibold text-text-primary">Email + push</span>
            </div>
          </div>
          {sendError && <div className="mb-3 text-[13px] text-[#93000a] text-center">{sendError}</div>}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="w-full h-[52px] mb-2.5 inline-flex items-center justify-center bg-gradient-brand text-white border-none rounded-full text-[15px] font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] disabled:opacity-60"
          >
            {sending ? 'Opening escrow…' : 'Send & get share link'}
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="w-full py-3.5 bg-transparent text-text-secondary border-none rounded-full text-xs font-semibold cursor-pointer hover:bg-info-light"
          >
            Back to review
          </button>
        </div>
      </div>
    </div>
  )
}
