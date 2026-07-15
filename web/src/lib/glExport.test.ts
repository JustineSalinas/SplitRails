import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getEscrowParticipants: vi.fn(),
  getParticipantShare: vi.fn(),
  isParticipantCleared: vi.fn(),
  getEscrowTotals: vi.fn(),
  getTxLog: vi.fn(),
}))

vi.mock('./escrow', () => ({
  getEscrowParticipants: mocks.getEscrowParticipants,
  getParticipantShare: mocks.getParticipantShare,
  isParticipantCleared: mocks.isParticipantCleared,
  getEscrowTotals: mocks.getEscrowTotals,
}))

vi.mock('./txLog', () => ({
  getTxLog: mocks.getTxLog,
}))

const { buildLedgerCsv, buildLedgerRows } = await import('./glExport')

const PARTICIPANT = 'GDDUC3PNY63T67JHVOZIXXABMIWUQHPKLLNM3YA3Z6KA3TPKPJJSPJ7G'

describe('buildLedgerRows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws instead of silently returning an empty/mock row set when there is no live escrow', async () => {
    mocks.getEscrowParticipants.mockResolvedValue([])
    await expect(buildLedgerRows({ costCenter: 'Ops', projectId: 'P-1' })).rejects.toThrow(
      /no live escrow participants/i,
    )
  })

  it('builds one row per live participant with the tx hash matched from the log', async () => {
    mocks.getEscrowParticipants.mockResolvedValue([PARTICIPANT])
    mocks.getParticipantShare.mockResolvedValue(14100000000n) // 1410.00 at 7 decimals
    mocks.isParticipantCleared.mockResolvedValue(true)
    mocks.getTxLog.mockReturnValue([
      { label: 'GDDU…PJ7G locked their share', hash: 'deadbeef', timestamp: 1700000000000, contractId: 'c1' },
    ])

    const rows = await buildLedgerRows({ costCenter: 'Ops', projectId: 'P-1' })
    expect(rows).toEqual([
      {
        participant: PARTICIPANT,
        amount: 1410,
        cleared: true,
        txHash: 'deadbeef',
        clearedAt: new Date(1700000000000).toISOString(),
        costCenter: 'Ops',
        projectId: 'P-1',
      },
    ])
  })
})

describe('buildLedgerCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('quotes every cell and appends cleared/required totals rows', async () => {
    mocks.getEscrowParticipants.mockResolvedValue([PARTICIPANT])
    mocks.getParticipantShare.mockResolvedValue(5000000n) // 0.5
    mocks.isParticipantCleared.mockResolvedValue(false)
    mocks.getTxLog.mockReturnValue([])
    mocks.getEscrowTotals.mockResolvedValue([5000000n, 20000000n]) // (cleared, required) = (0.5, 2.0)

    const csv = await buildLedgerCsv({ costCenter: 'Ops', projectId: 'P-1' })
    const lines = csv.split('\n')

    expect(lines[0]).toBe('"Participant","Amount (USD)","Cleared","Tx Hash","Cleared At","Cost Center","Project ID"')
    expect(lines[1]).toBe(`"${PARTICIPANT}","0.50","No","","","Ops","P-1"`)
    expect(lines[2]).toBe('"Total cleared","0.50","","","","",""')
    expect(lines[3]).toBe('"Total required","2.00","","","","",""')
  })
})
