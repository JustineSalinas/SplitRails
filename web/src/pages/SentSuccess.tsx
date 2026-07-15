import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import type { EscrowDraft } from '../lib/escrowDraft'

interface SentParticipant {
  id: number
  name: string
  avatarBg: string
  initials: string
  status: 'paid' | 'notified'
}

const GRADIENT = 'var(--gradient-brand)'
// Third-party brand color — Instagram's own icon gradient, intentionally kept
// outside the app's semantic token system (see refactor summary).
const INSTAGRAM_GRADIENT = 'linear-gradient(135deg, #FEDA75 0%, #D62976 50%, #4F5BD5 100%)'

const participants: SentParticipant[] = [
  { id: 1, name: 'Riya (you)', avatarBg: GRADIENT, initials: 'RM', status: 'paid' },
  { id: 2, name: 'Alex Suarez', avatarBg: '#FF9500', initials: 'AS', status: 'notified' },
  { id: 3, name: 'Mia Kwon', avatarBg: '#263143', initials: 'MK', status: 'notified' },
  { id: 4, name: 'Theo Rowe', avatarBg: '#5c5f61', initials: 'TR', status: 'notified' },
]

const MOCK_TOTAL = 4850
const MOCK_SHARE_LINK = 'splitrails.co/s/aws-infra-q3'

export function SentSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const draft = location.state as (EscrowDraft & { contractId?: string }) | null
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const total = draft?.total ?? MOCK_TOTAL
  const label = draft?.label ?? 'AWS + Design Tools — Q3'
  // A real invoice gets a real settle link pointing at its own deployed escrow instance;
  // without a live draft (e.g. landing here directly) we fall back to the mock demo link.
  const shareUrl = draft?.contractId
    ? `${window.location.origin}/pay/${draft.contractId}`
    : `https://${MOCK_SHARE_LINK}`
  const shareLinkDisplay = draft?.contractId ? shareUrl.replace(/^https?:\/\//, '') : MOCK_SHARE_LINK
  const ledgerUrl = draft?.contractId ? `/audit-ledger/${draft.contractId}` : '/audit-ledger'

  function showToast(text: string) {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  function copyLink() {
    if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).catch(() => {})
    showToast('Link copied to clipboard')
  }

  function shareGeneric() {
    const url = shareUrl
    if (navigator.share) {
      navigator.share({ title: 'SplitRails payment request', text: `Pay your share for ${label}`, url }).catch(() => {})
    } else {
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {})
      showToast('Link copied — paste to share')
    }
  }

  function shareMessenger() {
    window.open(
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=0&redirect_uri=${encodeURIComponent(shareUrl)}`,
      '_blank',
    )
  }

  function shareInstagram() {
    if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).catch(() => {})
    showToast('Link copied — paste it in your Instagram DM or story')
  }

  function shareWhatsapp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Pay your share for ${label}: ${shareUrl}`)}`,
      '_blank',
    )
  }

  function shareEmail() {
    window.open(
      `mailto:?subject=${encodeURIComponent(`Your share for ${label}`)}&body=${encodeURIComponent(`Pay your share here: ${shareUrl}`)}`,
      '_blank',
    )
  }

  return (
    <div className="text-text-primary font-sans">
      <main className="max-w-[640px] mx-auto px-10 max-md:px-6 max-sm:px-4 pt-14 max-sm:pt-8 pb-24">
        {/* Success state */}
        <div className="text-center mb-8">
          <div className="w-[72px] h-[72px] rounded-full bg-success-light flex items-center justify-center mx-auto mb-5">
            <span className="msym fill text-[36px] text-success">check_circle</span>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight m-0 mb-2">Request sent!</h1>
          <p className="text-text-secondary text-[15px] m-0 leading-[1.5]">
            {draft?.contractId
              ? 'Your escrow contract is live on testnet. Share the link below — funds release once every share is collected.'
              : 'Alex, Mia and Theo have been notified. Funds go to Amazon Web Services once all 4 shares are collected.'}
          </p>
        </div>

        {/* Details card */}
        <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5 mb-4">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                {label}
              </div>
              <div className="text-xl font-bold tracking-tight">
                ${total.toFixed(2)}{' '}
                <span className="text-[13px] font-medium text-text-secondary">
                  total · {draft?.participants.length ?? 4} ways
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-success/[0.15] text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(52,199,89,0.25)]" />
              Awaiting payment
            </span>
          </div>
          <hr className="h-[0.5px] bg-border/60 border-none my-4" />
          <div>
            {participants.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={p.initials} bg={p.avatarBg} size={30} bordered={false} textColor="white" />
                  <span className="text-sm font-semibold">{p.name}</span>
                </div>
                {p.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                    <span className="msym text-sm">check_circle</span>Paid
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-text-muted">Notified</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Link card */}
        <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5 mb-4">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-2.5">
            Your share link
          </div>
          <div className="flex items-center gap-2.5 bg-bg border-[0.5px] border-border rounded-xl px-3.5 py-3">
            <span className="msym text-info text-lg">link</span>
            <div className="flex-1 min-w-0 font-mono text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              {shareLinkDisplay}
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 bg-transparent text-text-secondary border-[0.5px] border-border hover:bg-info-light px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0"
            >
              <span className="msym text-sm">content_copy</span>Copy
            </button>
          </div>
        </div>

        {/* Share to */}
        <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5 max-sm:p-4 pb-6 mb-6">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-3.5">
            Share the link
          </div>
          <div className="grid grid-cols-5 gap-1.5 max-sm:gap-1">
            <button
              type="button"
              onClick={shareGeneric}
              className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-1.5 rounded-xl hover:bg-info-light hover:-translate-y-px transition-[background,transform] duration-150"
            >
              <div
                className="w-[52px] h-[52px] max-sm:w-11 max-sm:h-11 rounded-full flex items-center justify-center text-white text-[22px] max-sm:text-lg"
                style={{ background: GRADIENT }}
              >
                <span className="msym">ios_share</span>
              </div>
              <span className="text-[11px] font-semibold text-text-secondary">Share</span>
            </button>
            <button
              type="button"
              onClick={shareMessenger}
              className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-1.5 rounded-xl hover:bg-info-light hover:-translate-y-px transition-[background,transform] duration-150"
            >
              <div className="w-[52px] h-[52px] max-sm:w-11 max-sm:h-11 rounded-full flex items-center justify-center text-white text-[22px] max-sm:text-lg bg-[#0084FF]">
                <span className="msym">forum</span>
              </div>
              <span className="text-[11px] font-semibold text-text-secondary">Messenger</span>
            </button>
            <button
              type="button"
              onClick={shareInstagram}
              className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-1.5 rounded-xl hover:bg-info-light hover:-translate-y-px transition-[background,transform] duration-150"
            >
              <div
                className="w-[52px] h-[52px] max-sm:w-11 max-sm:h-11 rounded-full flex items-center justify-center text-white text-[22px] max-sm:text-lg"
                style={{ background: INSTAGRAM_GRADIENT }}
              >
                <span className="msym">photo_camera</span>
              </div>
              <span className="text-[11px] font-semibold text-text-secondary">Instagram</span>
            </button>
            <button
              type="button"
              onClick={shareWhatsapp}
              className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-1.5 rounded-xl hover:bg-info-light hover:-translate-y-px transition-[background,transform] duration-150"
            >
              <div className="w-[52px] h-[52px] max-sm:w-11 max-sm:h-11 rounded-full flex items-center justify-center text-white text-[22px] max-sm:text-lg bg-[#25D366]">
                <span className="msym">chat</span>
              </div>
              <span className="text-[11px] font-semibold text-text-secondary">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={shareEmail}
              className="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer p-1.5 rounded-xl hover:bg-info-light hover:-translate-y-px transition-[background,transform] duration-150"
            >
              <div className="w-[52px] h-[52px] max-sm:w-11 max-sm:h-11 rounded-full flex items-center justify-center text-white text-[22px] max-sm:text-lg bg-text-secondary">
                <span className="msym">mail</span>
              </div>
              <span className="text-[11px] font-semibold text-text-secondary">Email</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => navigate(ledgerUrl)}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-brand text-white border-none py-3.5 px-5 rounded-full text-sm font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98"
          >
            <span className="msym text-lg">receipt_long</span> View split status
          </button>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center py-3 bg-transparent text-text-secondary rounded-full text-[13px] font-semibold cursor-pointer hover:bg-info-light"
          >
            Back to Splits
          </Link>
        </div>
      </main>

      {/* Toast */}
      <div
        className={`fixed left-1/2 bottom-7 -translate-x-1/2 bg-text-primary text-white px-[18px] py-2.5 rounded-full text-[13px] font-semibold flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)] z-[80] transition-[opacity,transform] duration-200 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <span className="msym text-base">check_circle</span>
        {toast}
      </div>
    </div>
  )
}
