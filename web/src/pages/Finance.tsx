import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { baseUnitsToDollars, truncateAddress } from '../lib/amounts'
import { getEscrowParticipants, getEscrowTotals, getParticipantShare, isParticipantCleared } from '../lib/escrow'
import { buildLedgerCsv, downloadCsv } from '../lib/glExport'

interface LiveRow {
  participant: string
  amount: number
  cleared: boolean
}

const ROADMAP_ITEMS = [
  {
    icon: 'sync_alt',
    title: 'Direct API sync to QuickBooks, Xero, NetSuite',
    body: 'Push settled invoices straight into the ledger via each platform’s API instead of a manual CSV import. Requires a formal integration + auth agreement with each provider — out of scope for the hackathon build window.',
  },
  {
    icon: 'verified_user',
    title: 'Approval-based release roles',
    body: 'Let finance team members review and authorize an invoice before escrow funds are allowed to release, rather than releasing automatically once every participant clears their share. A real permissions/roles system, not yet built.',
  },
]

export function Finance() {
  const { contractId } = useParams()
  const [rows, setRows] = useState<LiveRow[] | null>(null)
  const [totals, setTotals] = useState<{ cleared: number; required: number } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [costCenter, setCostCenter] = useState('Operations')
  const [projectId, setProjectId] = useState('AWS-Q3-0714')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const addresses = await getEscrowParticipants(contractId)
        const [rowData, liveTotals] = await Promise.all([
          Promise.all(
            addresses.map(async (participant) => {
              const [share, cleared] = await Promise.all([
                getParticipantShare(participant, contractId),
                isParticipantCleared(participant, contractId),
              ])
              return { participant, amount: baseUnitsToDollars(share), cleared }
            }),
          ),
          getEscrowTotals(contractId),
        ])
        if (cancelled) return
        setRows(rowData)
        // get_totals() returns (cleared, required) — totals[0] is cleared.
        setTotals({ cleared: baseUnitsToDollars(liveTotals[0]), required: baseUnitsToDollars(liveTotals[1]) })
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'No live escrow to read from yet')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [contractId])

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      const csv = await buildLedgerCsv({ costCenter, projectId }, contractId)
      downloadCsv('splitrails-gl-ledger.csv', csv)
    } catch (err) {
      setExportError(
        err instanceof Error
          ? `Couldn't export live data: ${err.message}`
          : "Couldn't export live data — no live escrow to read from.",
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      <main className="max-w-[1000px] mx-auto px-10 max-md:px-6 max-sm:px-4 pt-10 max-sm:pt-6">
        <div className="mb-6">
          <h1 className="text-[32px] font-bold tracking-tight m-0 mb-1.5">Finance &amp; Accounting</h1>
          <p className="text-text-secondary text-[15px] m-0 max-w-[560px]">
            The same GL-tagged export surfaced from the Audit Ledger, as its own dedicated view for finance teams.
          </p>
        </div>

        {/* Live export — real escrow data */}
        <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-6 mb-6">
          <div className="flex items-center gap-1.5 mb-4">
            <h2 className="text-lg font-bold m-0">Live GL export</h2>
            <span className="text-[9px] font-bold uppercase tracking-[0.04em] bg-success-light text-success px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>

          {loadError && (
            <div className="text-[13px] text-text-secondary bg-neutral-light rounded-lg p-4 mb-4">
              No live escrow available to read yet ({loadError}). Initialize a split from the invoice creator, then
              return here to export its real on-chain data.
            </div>
          )}

          {rows && totals && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-light/60 rounded-[10px] p-4">
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-1.5">
                    Cleared
                  </div>
                  <div className="font-mono text-xl font-bold">${totals.cleared.toFixed(2)}</div>
                </div>
                <div className="bg-neutral-light/60 rounded-[10px] p-4">
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-1.5">
                    Required
                  </div>
                  <div className="font-mono text-xl font-bold">${totals.required.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {rows.map((r) => (
                  <div key={r.participant} className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="font-mono text-xs">{truncateAddress(r.participant)}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold">${r.amount.toFixed(2)}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          r.cleared ? 'bg-success-light text-success' : 'bg-action/[0.12] text-action-hover'
                        }`}
                      >
                        {r.cleared ? 'Cleared' : 'Outstanding'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="bg-neutral-light/60 border-[0.5px] border-border rounded-[14px] p-4 mb-4 flex items-center gap-4 flex-wrap">
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted shrink-0">
              Tag before export
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="financeCostCenter" className="text-xs text-text-secondary">
                Cost center
              </label>
              <input
                id="financeCostCenter"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border-[0.5px] border-border text-xs font-mono outline-none focus:border-info bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="financeProjectId" className="text-xs text-text-secondary">
                Project ID
              </label>
              <input
                id="financeProjectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border-[0.5px] border-border text-xs font-mono outline-none focus:border-info bg-white"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="bg-action text-white border-none py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer inline-flex items-center gap-2 shadow-[0_2px_8px_rgba(232,99,10,0.25)] disabled:opacity-60"
          >
            <span className="msym text-base">download</span>
            {exporting ? 'Exporting…' : 'Export GL-tagged CSV'}
          </button>
          {exportError && <div className="mt-2 text-[11px] text-[#93000a]">{exportError}</div>}
          <p className="text-[11px] text-text-muted mt-3 mb-0">
            Ready for import into QuickBooks, Xero, or NetSuite.
          </p>
        </div>

        {/* Roadmap — explicitly not live */}
        <div className="bg-neutral-light/40 border-[0.5px] border-dashed border-border rounded-[14px] p-6">
          <div className="flex items-center gap-1.5 mb-4">
            <h2 className="text-lg font-bold m-0 text-text-secondary">Roadmap — not in this build</h2>
            <span className="text-[9px] font-bold uppercase tracking-[0.04em] bg-neutral-light text-text-muted px-1.5 py-0.5 rounded">
              Static preview
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {ROADMAP_ITEMS.map((item) => (
              <div key={item.title} className="flex items-start gap-3.5 opacity-70">
                <div className="w-10 h-10 rounded-full bg-neutral-light flex items-center justify-center shrink-0">
                  <span className="msym text-text-muted text-xl">{item.icon}</span>
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <p className="text-[13px] text-text-secondary m-0 leading-[1.5]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
