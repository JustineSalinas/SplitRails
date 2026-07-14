import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DatePicker } from '../components/DatePicker'
import { DonutChart } from '../components/DonutChart'
import { ParticipantRow } from '../components/ParticipantRow'
import { Select } from '../components/Select'
import { useWallet } from '../context/WalletContext'
import { isValidStellarAddress } from '../lib/amounts'
import type { EscrowDraft } from '../lib/escrowDraft'

type SplitMethod = 'equal' | 'percent' | 'amount'

interface Participant {
  id: number
  name: string
  subtitle: string
  avatarBg: string
  donutColor?: string
  initials: string
  address: string
  amount: number
  locked: boolean
  paid?: boolean
  isPayer?: boolean
  removable: boolean
}

const GRADIENT = 'var(--gradient-brand)'
// Avatar identity colors: arbitrary per-person swatches, not part of the
// semantic token system (not flagged as "action" even though C64F00 is
// orange-ish — this is a person's identity color, not a status signal).
const PALETTE = ['#C64F00', '#263143', '#5c5f61', '#7A5AF8', '#0E7C61', '#B23A48']
// Chart-only palette: kept deliberately separate from --color-action so the
// donut reads as neutral data viz. 6 curated hues, wider than the 4-color
// chart-1..4 token set — see refactor summary for why this wasn't force-fit.
const DONUT_PALETTE = ['#5E5CE6', '#0EA5A5', '#8E8E93', '#8B5CF6', '#0A84FF', '#4C6FFF']

const initialParticipants: Participant[] = [
  {
    id: 1,
    name: 'Riya (you)',
    subtitle: '',
    avatarBg: GRADIENT,
    isPayer: true,
    initials: 'RM',
    address: '',
    amount: 113,
    locked: false,
    paid: true,
    removable: false,
  },
  {
    id: 2,
    name: 'Alex Suarez',
    subtitle: 'alex@rails.co',
    avatarBg: '#C64F00',
    donutColor: '#5E5CE6',
    initials: 'AS',
    address: '',
    amount: 113,
    locked: false,
    removable: true,
  },
  {
    id: 3,
    name: 'Mia Kwon',
    subtitle: 'mia.k@rails.co',
    avatarBg: '#263143',
    donutColor: '#0EA5A5',
    initials: 'MK',
    address: '',
    amount: 113,
    locked: false,
    removable: true,
  },
  {
    id: 4,
    name: 'Theo Rowe',
    subtitle: 'theo@rails.co',
    avatarBg: '#5c5f61',
    donutColor: '#8E8E93',
    initials: 'TR',
    address: '',
    amount: 113,
    locked: false,
    removable: true,
  },
]

function splitEvenly(list: Participant[], total: number): Participant[] {
  const lockedSum = list.filter((p) => p.locked).reduce((sum, p) => sum + p.amount, 0)
  const unlocked = list.filter((p) => !p.locked)
  const remaining = Math.max(total - lockedSum, 0)
  const share = unlocked.length > 0 ? remaining / unlocked.length : 0
  return list.map((p) => (p.locked ? p : { ...p, amount: Math.round(share * 100) / 100 }))
}

export function SplitCreator() {
  const navigate = useNavigate()
  const { address: myAddress, connect } = useWallet()
  const [totalInput, setTotalInput] = useState('452.00')
  const [method, setMethod] = useState<SplitMethod>('equal')
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [label, setLabel] = useState('Office Dinner')
  const [category, setCategory] = useState('Food & drink')
  const [dueDate, setDueDate] = useState('2026-07-20')
  const [autoNudge, setAutoNudge] = useState('After 3 days overdue')
  const [vendorAddress, setVendorAddress] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')

  // The payer's own address defaults to the connected wallet unless they
  // override it, so we never need to sync wallet state into participant state.
  function participantAddress(p: Participant): string {
    return p.isPayer && !p.address ? (myAddress ?? '') : p.address
  }

  const total = Number(totalInput) || 0
  const payer = participants.find((p) => p.isPayer)
  const sum = participants.reduce((s, p) => s + p.amount, 0)
  const balanced = Math.abs(total - sum) < 0.01
  const dueDateLabel = dueDate
    ? new Date(`${dueDate}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  function updateParticipant(id: number, patch: Partial<Participant>) {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function handleSetMethod(next: SplitMethod) {
    setMethod(next)
    if (next === 'equal') {
      setParticipants((prev) => splitEvenly(prev, total))
    }
  }

  function handlePercentChange(id: number, pct: number) {
    updateParticipant(id, { amount: Math.round(((pct / 100) * total) * 100) / 100 })
  }

  function handleQuickAdd(amount: number) {
    setTotalInput((prev) => ((Number(prev) || 0) + amount).toFixed(2))
  }

  function handleAddParticipant() {
    setParticipants((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
        name: 'New participant',
        subtitle: '',
        avatarBg: PALETTE[prev.length % PALETTE.length],
        donutColor: DONUT_PALETTE[prev.length % DONUT_PALETTE.length],
        initials: '??',
        address: '',
        amount: 0,
        locked: false,
        removable: true,
      },
    ])
  }

  function handleDeleteParticipant(id: number) {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
  }

  function handleUndoSplit() {
    setMethod('equal')
    setParticipants(initialParticipants.map((p) => ({ ...p })))
  }

  const isSplitDefault =
    method === 'equal' &&
    participants.length === initialParticipants.length &&
    participants.every((p, i) => {
      const original = initialParticipants[i]
      return original && p.id === original.id && p.amount === original.amount && p.locked === original.locked
    })

  const reviewError = !balanced
    ? `Shares must add up to $${total.toFixed(2)}`
    : !isValidStellarAddress(vendorAddress)
      ? 'Enter a valid vendor address'
      : !isValidStellarAddress(tokenAddress)
        ? 'Enter a valid token contract address'
        : participants.some((p) => !isValidStellarAddress(participantAddress(p)))
          ? 'Every participant needs a valid Stellar address'
          : !dueDate
            ? 'Set a payment due date'
            : null
  const reviewReady = reviewError === null

  function handleReview() {
    if (!reviewReady) return
    const deadlineUnix = Math.floor(new Date(`${dueDate}T23:59:59Z`).getTime() / 1000)
    const draft: EscrowDraft = {
      label,
      vendorAddress: vendorAddress.trim(),
      tokenAddress: tokenAddress.trim(),
      dueDate,
      deadlineUnix,
      total,
      participants: participants.map((p) => ({
        id: p.id,
        name: p.name,
        initials: p.initials,
        avatarBg: p.avatarBg,
        donutColor: p.donutColor,
        address: participantAddress(p).trim(),
        amount: p.amount,
        isPayer: p.isPayer,
      })),
    }
    navigate('/review', { state: draft })
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
          <span className="text-text-primary font-semibold">New split</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <div className="w-[22px] h-[22px] rounded-full bg-info text-white flex items-center justify-center text-[11px] font-bold">
                1
              </div>
              <span className="font-semibold text-text-primary">Set up</span>
            </div>
            <div className="w-6 h-px bg-border" />
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-[22px] h-[22px] rounded-full bg-white border-[0.5px] border-border flex items-center justify-center text-[11px] font-bold">
                2
              </div>
              <span>Review</span>
            </div>
            <div className="w-6 h-px bg-border" />
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-[22px] h-[22px] rounded-full bg-white border-[0.5px] border-border flex items-center justify-center text-[11px] font-bold">
                3
              </div>
              <span>Send</span>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 bg-transparent text-text-secondary border-[0.5px] border-border hover:bg-info-light px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer"
          >
            Save draft
          </button>
        </div>
      </div>

      <main className="max-w-[1240px] mx-auto px-10 pt-6 pb-20">
        {/* Hero: total amount */}
        <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card py-9 px-6 mb-6 text-center">
          <div className="text-sm font-extrabold tracking-[0.08em] uppercase text-action mb-3">
            Total amount
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-[32px] font-medium text-text-secondary">$</span>
            <input
              type="text"
              value={totalInput}
              onChange={(e) => setTotalInput(e.target.value)}
              placeholder="0.00"
              className="text-[72px] font-bold tracking-tight leading-none border-none bg-transparent outline-none text-center w-full max-w-[420px] text-text-primary font-sans"
            />
          </div>
          <div className="flex gap-2 justify-center mt-5 flex-wrap items-center">
            <span className="text-base text-text-secondary font-bold mr-1">Quick add:</span>
            {[25, 50, 100, 250].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAdd(amount)}
                className="px-3 py-1.5 rounded-full bg-white border-[0.5px] border-border text-xs font-semibold text-text-secondary cursor-pointer font-mono transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-action hover:border-action hover:text-white hover:scale-110 hover:shadow-[0_4px_12px_rgba(224,124,0,0.35)] active:scale-95"
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_420px] gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Split method */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <div className="text-[15px] font-semibold tracking-tight">How should it split?</div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    Change any share and the rest auto-balance.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndoSplit}
                    disabled={isSplitDefault}
                    title="Revert to the default split"
                    className="px-3 py-1.5 rounded-full bg-transparent text-text-secondary border-[0.5px] border-border text-xs font-semibold cursor-pointer inline-flex items-center gap-1 hover:bg-info-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <span className="msym text-sm">undo</span> Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipants((prev) => splitEvenly(prev, total))}
                    className="px-3 py-1.5 rounded-full bg-transparent text-text-secondary border-[0.5px] border-border text-xs font-semibold cursor-pointer inline-flex items-center gap-1 hover:bg-info-light"
                  >
                    <span className="msym text-sm">auto_fix_high</span> Split evenly
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                {(
                  [
                    { key: 'equal', label: 'Equal', icon: 'balance' },
                    { key: 'percent', label: 'Percent', icon: 'percent' },
                    { key: 'amount', label: 'Amount', icon: 'attach_money' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => handleSetMethod(m.key)}
                    className={`flex-1 py-2.5 px-3 border-[0.5px] rounded-[10px] text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 ${
                      method === m.key
                        ? 'border-info bg-info-light text-info shadow-[0_0_0_2px_rgba(0,122,255,0.1)]'
                        : 'border-border bg-white text-text-secondary'
                    }`}
                  >
                    <span className="msym text-base">{m.icon}</span> {m.label}
                    {m.key !== 'equal' && <span className="msym text-base ml-0.5">expand_more</span>}
                  </button>
                ))}
              </div>

              {method === 'percent' && (
                <div className="mt-3 border-[0.5px] border-border rounded-xl bg-bg overflow-hidden">
                  <div className="p-3.5 border-b-[0.5px] border-border bg-white">
                    <div className="text-[13px] font-semibold text-text-primary">Set each share as a percent</div>
                    <div className="text-xs text-text-secondary">Must add up to 100%</div>
                  </div>
                  <div className="flex flex-col">
                    {participants.map((p) => {
                      const pct = total > 0 ? Math.round((p.amount / total) * 1000) / 10 : 0
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-3.5 py-2.5 border-b-[0.5px] border-border/40 last:border-b-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                              style={{ background: p.avatarBg }}
                            >
                              {p.initials}
                            </div>
                            <span className="text-[13px] font-semibold">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-0.5 px-2.5 py-1.5 bg-white border-[0.5px] border-border rounded-lg min-w-[90px] focus-within:border-info focus-within:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]">
                            <input
                              value={pct}
                              onChange={(e) => handlePercentChange(p.id, parseFloat(e.target.value) || 0)}
                              className="w-full border-none bg-transparent outline-none text-sm font-semibold text-text-primary font-mono tabular-nums text-right"
                            />
                            <span className="text-[13px] text-text-muted font-mono">%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-t-[0.5px] border-border">
                    <span className="text-xs text-text-secondary">Total</span>
                    <span
                      className={`font-mono text-[13px] font-bold ${
                        balanced ? 'text-success' : 'text-[#93000a]'
                      }`}
                    >
                      {total > 0 ? Math.round((sum / total) * 1000) / 10 : 0}%
                    </span>
                  </div>
                </div>
              )}

              {method === 'amount' && (
                <div className="mt-3 border-[0.5px] border-border rounded-xl bg-bg overflow-hidden">
                  <div className="p-3.5 border-b-[0.5px] border-border bg-white">
                    <div className="text-[13px] font-semibold text-text-primary">Set each share as an amount</div>
                    <div className="text-xs text-text-secondary">Must add up to ${total.toFixed(2)}</div>
                  </div>
                  <div className="flex flex-col">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3.5 py-2.5 border-b-[0.5px] border-border/40 last:border-b-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                            style={{ background: p.avatarBg }}
                          >
                            {p.initials}
                          </div>
                          <span className="text-[13px] font-semibold">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 px-2.5 py-1.5 bg-white border-[0.5px] border-border rounded-lg min-w-[90px] focus-within:border-info focus-within:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]">
                          <span className="text-[13px] text-text-muted font-mono">$</span>
                          <input
                            value={p.amount}
                            onChange={(e) => updateParticipant(p.id, { amount: parseFloat(e.target.value) || 0 })}
                            className="w-full border-none bg-transparent outline-none text-sm font-semibold text-text-primary font-mono tabular-nums text-right"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-t-[0.5px] border-border">
                    <span className="text-xs text-text-secondary">Total</span>
                    <span
                      className={`font-mono text-[13px] font-bold ${
                        balanced ? 'text-success' : 'text-[#93000a]'
                      }`}
                    >
                      ${sum.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <div className="text-[15px] font-semibold tracking-tight">Participants</div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {participants.length} people
                    {method === 'equal' &&
                      participants.length > 0 &&
                      ` · $${(total / participants.length).toFixed(2)} each`}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    balanced ? 'bg-success-light text-success' : 'bg-[#FFDAD6] text-[#93000a]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${balanced ? 'bg-success' : 'bg-[#BA1A1A]'}`} />
                  {balanced ? `Balances to $${total.toFixed(2)}` : `Off by $${Math.abs(total - sum).toFixed(2)}`}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {participants.map((p) => (
                  <ParticipantRow
                    key={p.id}
                    name={p.name}
                    subtitle={p.isPayer ? `Fronted $${total.toFixed(2)}` : p.subtitle}
                    avatarColor={p.avatarBg}
                    initials={p.initials}
                    amount={p.amount}
                    locked={p.locked}
                    paid={p.paid}
                    removable={p.removable}
                    address={participantAddress(p)}
                    onAddressChange={(address) => updateParticipant(p.id, { address })}
                    onNameChange={(name) => updateParticipant(p.id, { name })}
                    onAmountChange={(amount) => updateParticipant(p.id, { amount })}
                    onToggleLock={() => updateParticipant(p.id, { locked: !p.locked })}
                    onDelete={() => handleDeleteParticipant(p.id)}
                  />
                ))}

                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="p-3.5 border border-dashed border-border bg-transparent rounded-xl text-[13px] font-semibold text-text-secondary cursor-pointer flex items-center justify-center gap-2 hover:bg-info-light"
                >
                  <span className="msym text-lg">person_add</span>
                  Add participant
                  <span className="text-[11px] text-text-muted font-medium ml-2">or paste emails</span>
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
              <div className="text-[15px] font-semibold tracking-tight mb-3.5">Details</div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-4.5">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                    Label
                  </div>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Dinner at Sora"
                    className="w-full py-2.5 px-3 border-[0.5px] border-border rounded-lg text-sm font-sans outline-none"
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                    Category
                  </div>
                  <Select
                    value={category}
                    onChange={setCategory}
                    options={['Food & drink', 'Travel', 'Housing', 'Entertainment']}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                    Payment due
                  </div>
                  <DatePicker value={dueDate} onChange={setDueDate} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                    Auto-nudge
                  </div>
                  <Select
                    value={autoNudge}
                    onChange={setAutoNudge}
                    options={['After 3 days overdue', 'After 1 day overdue', 'Never']}
                  />
                </div>
              </div>
            </div>

            {/* On-chain settlement details */}
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-5">
              <div className="text-[15px] font-semibold tracking-tight mb-1">Escrow settlement</div>
              <div className="text-xs text-text-secondary mb-3.5">
                Real values used to open the on-chain escrow — this contract only holds one invoice at a
                time, so double-check these before sending.
              </div>
              <div className="grid grid-cols-2 gap-x-10 gap-y-4.5">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                    Vendor address
                  </div>
                  <input
                    type="text"
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    placeholder="G… (who gets paid)"
                    spellCheck={false}
                    className="w-full py-2.5 px-3 border-[0.5px] border-border rounded-lg text-sm font-mono outline-none"
                  />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-secondary mb-1.5">
                    Token contract
                  </div>
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="C… (testnet USDC SAC)"
                    spellCheck={false}
                    className="w-full py-2.5 px-3 border-[0.5px] border-border rounded-lg text-sm font-mono outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: sticky preview */}
          <div className="sticky top-20">
            <div className="bg-white border-[0.5px] border-border/60 rounded-[14px] shadow-card p-6 flex flex-col items-center">
              <div className="mb-5">
                <DonutChart
                  variant="pie"
                  total={total}
                  slices={participants.map((p) => ({
                    id: p.id,
                    color: p.isPayer ? 'gradient' : (p.donutColor ?? p.avatarBg),
                    amount: p.amount,
                  }))}
                />
              </div>

              <div className="w-full flex flex-col gap-2 mb-5">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-1 py-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: p.isPayer ? GRADIENT : (p.donutColor ?? p.avatarBg) }}
                      />
                      <span className="text-[13px] font-semibold">{p.name}</span>
                      {p.locked && <span className="msym text-xs text-action">lock</span>}
                    </div>
                    <span className="font-mono text-[13px] font-semibold">${p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="w-full h-[0.5px] bg-border/60 border-none mb-4" />

              <div className="w-full flex flex-col gap-2 mb-5">
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>You're collecting</span>
                  <span className="font-mono font-semibold text-text-primary">
                    ${(total - (payer?.amount ?? 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>Your share</span>
                  <span className="font-mono font-semibold text-text-primary">
                    ${(payer?.amount ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] text-text-secondary">
                  <span>Due by</span>
                  <span className="font-semibold text-text-primary">{dueDateLabel}</span>
                </div>
              </div>

              {!myAddress ? (
                <button
                  type="button"
                  onClick={connect}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-brand text-white border-none py-3.5 px-5 rounded-full text-sm font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98"
                >
                  <span className="msym text-base">account_balance_wallet</span> Connect wallet to continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!reviewReady}
                  onClick={handleReview}
                  title={reviewError ?? undefined}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-brand text-white border-none py-3.5 px-5 rounded-full text-sm font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review split <span className="msym text-lg">arrow_forward</span>
                </button>
              )}
              {myAddress && reviewError && (
                <div className="mt-2 text-[11px] text-[#93000a] text-center">{reviewError}</div>
              )}

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted">
                <span className="msym text-sm">lock</span>
                Held in SplitRails until settled
              </div>
            </div>

            {participants.some((p) => p.locked) && (
              <div className="mt-3 py-3.5 px-4 bg-action rounded-xl flex gap-2.5 items-start shadow-[0_2px_8px_rgba(255,149,0,0.2)]">
                <span className="msym text-white text-lg shrink-0">lightbulb</span>
                <div>
                  <div className="text-[13px] font-bold text-white">
                    {participants.find((p) => p.locked)?.name}'s share is locked
                  </div>
                  <div className="text-xs font-medium text-white/95 mt-0.5">
                    Other participants will auto-balance around it.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
