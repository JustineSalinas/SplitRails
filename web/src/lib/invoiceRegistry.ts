// Local record of every invoice this browser has created — each one is its own deployed
// escrow contract instance (see escrow.ts deployEscrowInstance), so there's no on-chain
// "list all my invoices" query to fall back on. This registry is what lets the Dashboard
// show real created splits, and is how the Settle Link / Audit Ledger / Finance pages know
// which contract ID to read without it being in every route by hand.
export interface InvoiceRecord {
  contractId: string
  label: string
  vendor: string
  total: number
  createdAt: number
}

const STORAGE_KEY = 'splitrails.invoices'

function read(): InvoiceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as InvoiceRecord[]) : []
  } catch {
    return []
  }
}

function write(records: InvoiceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // storage unavailable — registry only lasts this session
  }
}

export function saveInvoice(record: InvoiceRecord) {
  const records = read()
  records.push(record)
  write(records)
}

export function listInvoices(): InvoiceRecord[] {
  return read().sort((a, b) => b.createdAt - a.createdAt)
}

export function getMostRecentInvoiceId(): string | null {
  const records = listInvoices()
  return records.length > 0 ? records[0].contractId : null
}
