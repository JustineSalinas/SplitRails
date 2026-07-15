import { stellarExpertBase } from './config'

export interface TxLogEntry {
  label: string
  hash: string
  timestamp: number
  /** Dollar amount tied to the action (e.g. the share just cleared), when known. */
  amount?: number
  /** Which escrow contract instance this action belongs to — each invoice is its own instance. */
  contractId: string
}

const STORAGE_KEY = 'splitrails.txLog'

function read(): TxLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TxLogEntry[]) : []
  } catch {
    return []
  }
}

function write(entries: TxLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // storage unavailable — in-memory only for this session
  }
}

export function logTx(label: string, hash: string, contractId: string, amount?: number) {
  const entries = read()
  entries.push({ label, hash, timestamp: Date.now(), amount, contractId })
  write(entries)
}

export function getTxLog(contractId?: string): TxLogEntry[] {
  const entries = read().sort((a, b) => a.timestamp - b.timestamp)
  return contractId ? entries.filter((e) => e.contractId === contractId) : entries
}

export function stellarExpertTxUrl(hash: string) {
  return `${stellarExpertBase}/tx/${hash}`
}
