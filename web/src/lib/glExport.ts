import { baseUnitsToDollars } from './amounts'
import { getEscrowParticipants, getEscrowTotals, getParticipantShare, isParticipantCleared } from './escrow'
import { getTxLog } from './txLog'

export interface GlTags {
  costCenter: string
  projectId: string
}

export interface LedgerRow {
  participant: string
  amount: number
  cleared: boolean
  txHash: string
  clearedAt: string
  costCenter: string
  projectId: string
}

function findTxHash(participant: string, contractId?: string): { hash: string; timestamp: number } | null {
  const shortAddr = `${participant.slice(0, 4)}…${participant.slice(-4)}`
  const entry = getTxLog(contractId).find((e) => e.label.startsWith(shortAddr))
  return entry ? { hash: entry.hash, timestamp: entry.timestamp } : null
}

// Builds one row per live on-chain participant — the same escrow contract state the
// Audit Ledger reads to render its "Live" section. Throws if no live escrow is
// reachable, so callers never silently substitute mock rows for a real export.
export async function buildLedgerRows(tags: GlTags, contractId?: string): Promise<LedgerRow[]> {
  const addresses = await getEscrowParticipants(contractId)
  if (addresses.length === 0) throw new Error('No live escrow participants to export')

  return Promise.all(
    addresses.map(async (participant) => {
      const [share, cleared] = await Promise.all([
        getParticipantShare(participant, contractId),
        isParticipantCleared(participant, contractId),
      ])
      const tx = findTxHash(participant, contractId)
      return {
        participant,
        amount: baseUnitsToDollars(share),
        cleared,
        txHash: tx?.hash ?? '',
        clearedAt: tx ? new Date(tx.timestamp).toISOString() : '',
        costCenter: tags.costCenter,
        projectId: tags.projectId,
      }
    }),
  )
}

export async function buildLedgerCsv(tags: GlTags, contractId?: string): Promise<string> {
  const rows = await buildLedgerRows(tags, contractId)
  const totals = await getEscrowTotals(contractId)
  const header = ['Participant', 'Amount (USD)', 'Cleared', 'Tx Hash', 'Cleared At', 'Cost Center', 'Project ID']
  const body = rows.map((r) => [
    r.participant,
    r.amount.toFixed(2),
    r.cleared ? 'Yes' : 'No',
    r.txHash,
    r.clearedAt,
    r.costCenter,
    r.projectId,
  ])
  // get_totals() returns (cleared, required) — totals[0] is cleared.
  const totalsRow = ['Total cleared', baseUnitsToDollars(totals[0]).toFixed(2), '', '', '', '', '']
  const goalRow = ['Total required', baseUnitsToDollars(totals[1]).toFixed(2), '', '', '', '', '']
  const allRows = [header, ...body, totalsRow, goalRow]
  return allRows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
