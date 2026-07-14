import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'

const TRUNCATED_HASH = '0x7a2...f8e1'
const FULL_HASH = '0x7a2c9e4f1b8d6a3c5e7f9b2d4a6c8e0f2a4c6e8b0d2f4a6c8e0f2a4c6e8bf8e1'

export function AuditComplete() {
  const [expanded, setExpanded] = useState(false)
// /testing
  function handleDownloadReceipt() {
    const receipt = [
      'SplitRails Receipt',
      '-------------------',
      'Vendor: CloudKitchens Co.',
      'Date: Oct 24, 2023 • 14:32',
      'Total contribution: $1,248.50',
      `Transaction hash: ${FULL_HASH}`,
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
        @keyframes success-pop { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      <main className="max-w-[1120px] mx-auto px-10 max-md:px-6 max-sm:px-4 pt-14 max-sm:pt-8">
        {/* Confirmation banner */}
        <div className="text-center max-w-[560px] mx-auto mb-8 animate-[success-pop_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-light rounded-full mb-4">
            <span className="msym fill accent-grad-text text-lg">check_circle</span>
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
              Transaction confirmed
            </span>
          </div>
          <h1 className="text-[34px] font-bold tracking-tight m-0 mb-2">Split completed</h1>
          <p className="text-[15px] text-text-secondary m-0">
            The settlement for <strong className="text-text-primary">CloudKitchens Co.</strong> has been finalized
            and transferred.
          </p>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-5 items-start max-[900px]:grid-cols-1">
          {/* Left: Pie visualizer */}
          <div className="bg-white border-[0.5px] border-border/50 rounded-[20px] shadow-card min-h-[460px] flex flex-col items-center justify-center p-10 max-md:p-6 max-sm:p-4 relative overflow-hidden">
            <div className="w-60 h-60 max-sm:w-44 max-sm:h-44 rounded-full bg-gradient-brand shadow-[0_20px_50px_rgba(0,122,255,0.22)] flex items-center justify-center relative animate-[success-pop_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
              <div className="absolute inset-0 rounded-full border-8 border-white/20" />
              <div className="z-[1] bg-white/10 backdrop-blur-md rounded-full p-8 border border-white/30 flex items-center justify-center">
                <span className="text-white font-bold text-xl">PAID</span>
              </div>
            </div>
            <div className="text-center mt-8">
              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2">
                Total contribution
              </div>
              <div className="text-[40px] font-bold tracking-tight">$1,248.50</div>
            </div>
          </div>

          {/* Right: Payout summary */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border-[0.5px] border-border/50 rounded-[20px] shadow-card px-6 pt-6 pb-2">
              <h3 className="text-xl font-bold m-0 mb-1">Payout Summary</h3>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">Vendor</span>
                <span className="text-sm font-bold">CloudKitchens Co.</span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">Date</span>
                <span className="font-mono text-sm font-bold">Oct 24, 2023 • 14:32</span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">Participants</span>
                <div className="flex">
                  <Avatar initials="JD" bg="#007AFF" className="-mr-2" />
                  <Avatar initials="AL" bg="#00C7BE" className="-mr-2" />
                  <Avatar initials="SM" bg="#FF9500" className="-mr-2" />
                  <Avatar initials="+2" bg="#ECEDF9" textColor="var(--color-text-secondary)" />
                </div>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="py-4.5 pb-5">
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2">
                  Transaction hash
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="w-full bg-neutral-light rounded-[10px] px-4 py-3 flex items-center justify-between cursor-pointer border-none active:scale-98 transition-transform duration-150"
                >
                  <span className="font-mono text-[13px] font-semibold break-all text-left">
                    {expanded ? FULL_HASH : TRUNCATED_HASH}
                  </span>
                  <span className="msym text-base text-text-muted shrink-0 ml-2">content_copy</span>
                </button>
              </div>
            </div>

            <Link
              to="/audit-ledger"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-brand text-white border-none py-4 px-5 rounded-full text-[15px] font-bold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98"
            >
              <span className="msym fill text-lg">receipt_long</span> View full Split Ledger
            </Link>
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="w-full inline-flex items-center justify-center gap-2 bg-transparent text-text-primary border border-border py-4 px-5 rounded-full text-[15px] font-bold cursor-pointer hover:bg-neutral-light"
            >
              Download Receipt (PDF)
            </button>

            <div className="bg-neutral-light/60 border-[0.5px] border-border rounded-[20px] px-5 py-4.5 flex items-start gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-action/[0.14] flex items-center justify-center shrink-0">
                <span className="msym fill text-action text-[17px]">shield</span>
              </div>
              <div>
                <div className="font-bold text-sm mb-0.5">Secured by SplitRails Vault</div>
                <p className="text-[13px] text-text-secondary leading-[1.5] m-0">
                  Funds were held in multi-sig escrow until 100% completion was verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
