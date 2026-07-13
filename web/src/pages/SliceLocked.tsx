import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'

const TRUNCATED_HASH = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F432A772B565D890...'
const FULL_HASH = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F432A772B565D89088E91A80B39'

export function SliceLocked() {
  const [expanded, setExpanded] = useState(false)

  function handleDownloadReceipt() {
    const receipt = [
      'SplitRails Receipt',
      '-------------------',
      'Split: Weekend Cabin Retreat',
      'Slice amount: $142.50',
      `Transaction hash: ${FULL_HASH}`,
      'Settlement: Instant lock',
    ].join('\n')
    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'splitrails-receipt.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      <style>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes pop-in { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <main className="max-w-[800px] mx-auto px-10 pt-16 flex flex-col items-center">
        {/* Success card */}
        <div className="w-full max-w-[480px] bg-white border-[0.5px] border-border/60 rounded-[28px] shadow-card p-12 flex flex-col items-center text-center animate-[pop-in_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="w-24 h-24 mb-5">
            <svg viewBox="0 0 52 52" className="w-full h-full">
              <defs>
                <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#007AFF" />
                  <stop offset="100%" stopColor="#00C7BE" />
                </linearGradient>
              </defs>
              <circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="url(#checkGrad)"
                strokeWidth="2"
                strokeDasharray={166}
                strokeDashoffset={166}
                className="animate-[draw_0.6s_ease-out_forwards]"
              />
              <path
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                fill="none"
                stroke="url(#checkGrad)"
                strokeLinecap="round"
                strokeWidth="3"
                strokeDasharray={48}
                strokeDashoffset={48}
                className="animate-[draw_0.3s_ease-out_0.6s_forwards]"
              />
            </svg>
          </div>

          <h1 className="text-[28px] font-bold tracking-tight m-0 mb-2">Your slice is locked in</h1>
          <p className="text-[15px] text-text-secondary m-0 mb-6">
            Confirmation has been broadcast to the SplitRails network.
          </p>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full mb-5 bg-neutral-light rounded-xl p-4 cursor-pointer border-none active:scale-98 transition-transform duration-150 text-left"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                Transaction hash
              </span>
              <span className="msym text-base text-text-muted">content_copy</span>
            </div>
            <p className="font-mono text-[13px] text-text-primary m-0 break-all">
              {expanded ? FULL_HASH : TRUNCATED_HASH}
            </p>
          </button>

          <Link
            to="/"
            className="w-full h-[52px] inline-flex items-center justify-center gap-2 bg-gradient-brand text-white rounded-full text-base font-bold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98 mb-2"
          >
            <span className="msym fill text-lg">pie_chart</span> View settlement ledger
          </Link>
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-action text-white border-none rounded-full py-3.5 px-5 text-[15px] font-bold cursor-pointer shadow-[0_2px_8px_rgba(255,149,0,0.25)] hover:shadow-[0_4px_14px_rgba(255,149,0,0.35)]"
          >
            <span className="msym text-lg">receipt_long</span>Download receipt
          </button>
        </div>

        {/* Bento summary */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[800px] mt-10 max-[820px]:grid-cols-1">
          <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5 text-left">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Participants
            </div>
            <div className="flex">
              <Avatar initials="JD" bg="var(--gradient-brand)" textColor="white" size={32} className="-mr-2" />
              <Avatar initials="ML" bg="#FF9500" textColor="white" size={32} className="-mr-2" />
              <Avatar initials="+4" bg="#ECEDF9" textColor="#454652" size={32} />
            </div>
          </div>
          <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5 text-left">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Slice amount
            </div>
            <div className="text-2xl font-bold tracking-tight">$142.50</div>
          </div>
          <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5 text-left">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Settlement
            </div>
            <div className="flex items-center gap-1.5">
              <span className="msym fill accent-grad-text text-[17px]">verified</span>
              <span className="accent-grad-text font-bold text-sm">Instant lock</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
