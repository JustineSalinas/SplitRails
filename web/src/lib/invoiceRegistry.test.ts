import { beforeEach, describe, expect, it } from 'vitest'
import { getMostRecentInvoiceId, listInvoices, saveInvoice } from './invoiceRegistry'

describe('invoiceRegistry', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('lists saved invoices newest-first', () => {
    saveInvoice({ contractId: 'c1', label: 'First', vendor: 'GVENDOR1', total: 100, createdAt: 1000 })
    saveInvoice({ contractId: 'c2', label: 'Second', vendor: 'GVENDOR2', total: 200, createdAt: 2000 })

    const invoices = listInvoices()
    expect(invoices.map((i) => i.contractId)).toEqual(['c2', 'c1'])
  })

  it('returns null when no invoice has been created yet', () => {
    expect(getMostRecentInvoiceId()).toBeNull()
  })

  it('returns the most recently created invoice’s contract ID', () => {
    saveInvoice({ contractId: 'c1', label: 'First', vendor: 'GVENDOR1', total: 100, createdAt: 1000 })
    saveInvoice({ contractId: 'c2', label: 'Second', vendor: 'GVENDOR2', total: 200, createdAt: 2000 })
    expect(getMostRecentInvoiceId()).toBe('c2')
  })
})
