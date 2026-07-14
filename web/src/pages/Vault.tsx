import { useEffect, useRef, useState, type FormEvent } from 'react'
import { buttonBaseClasses, buttonVariantClasses } from '../components/Button'

interface EscrowPosition {
  id: number
  icon: string
  iconFilled?: boolean
  iconBgClass: string
  iconColorClass: string
  title: string
  chip: { label: string; className: string; dotIcon?: string }
  hash: string
  amount: string
  meta: string
  metaClass: string
}

const ESCROWS: EscrowPosition[] = [
  {
    id: 1,
    icon: 'content_cut',
    iconFilled: true,
    iconBgClass: 'bg-gradient-brand',
    iconColorClass: 'text-white',
    title: 'Aspen Ski Trip',
    chip: { label: 'Pay now', className: 'bg-action text-white' },
    hash: '0x71c4…a4f2',
    amount: '$204.00',
    meta: 'Closes in 3h 12m',
    metaClass: 'text-action font-bold',
  },
  {
    id: 2,
    icon: 'shopping_cart',
    iconBgClass: 'bg-neutral-light',
    iconColorClass: 'text-text-secondary',
    title: 'Weekly Groceries',
    chip: { label: 'Waiting on 2', className: 'bg-neutral-light text-text-secondary' },
    hash: '0x0a5d…3e91',
    amount: '$42.10',
    meta: 'Closes in 2d 6h',
    metaClass: 'text-text-muted',
  },
  {
    id: 3,
    icon: 'restaurant',
    iconFilled: true,
    iconBgClass: 'bg-success-light',
    iconColorClass: 'text-success',
    title: 'Dinner at Nobu',
    chip: { label: 'Settled', className: 'bg-success-light text-success', dotIcon: 'check_circle' },
    hash: '0x7a2c…f8e1',
    amount: '$470.00',
    meta: 'Released to vendor',
    metaClass: 'text-text-muted',
  },
]

interface PaymentMethod {
  id: number
  icon: string
  label: string
  sublabel: string
}

interface NewCardForm {
  cardholderName: string
  cardNumber: string
  expiry: string
  cvc: string
  zip: string
}

const EMPTY_CARD_FORM: NewCardForm = { cardholderName: '', cardNumber: '', expiry: '', cvc: '', zip: '' }

const fieldInputClasses =
  'w-full box-border py-3 px-3.5 rounded-[10px] border-[0.5px] border-border text-sm font-sans text-text-primary outline-none focus:border-info focus:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]'

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 1, icon: 'credit_card', label: 'Chase Visa •••• 4471', sublabel: 'Debit card' },
  { id: 2, icon: 'account_balance', label: 'Chime Checking •••• 8890', sublabel: 'Bank account' },
]

function OnChainLink({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-info border-none bg-transparent cursor-pointer p-0"
    >
      <span className="msym text-sm">{copied ? 'check' : 'link'}</span>
      <span className="font-mono">{hash}</span>
      {copied ? 'Copied' : 'View on-chain'}
    </button>
  )
}

export function Vault() {
  const [defaultMethodId, setDefaultMethodId] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [cardForm, setCardForm] = useState<NewCardForm>(EMPTY_CARD_FORM)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  function handleCancelAddCard() {
    setShowAddForm(false)
    setCardForm(EMPTY_CARD_FORM)
  }

  function handleSaveCard(e: FormEvent) {
    e.preventDefault()
    setShowAddForm(false)
    setCardForm(EMPTY_CARD_FORM)
    setShowToast(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      {showToast && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[100] bg-text-primary text-white py-3 px-5 rounded-full flex items-center gap-2 text-[13px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <span className="msym fill text-success text-[17px]">check_circle</span>Payment method added
          successfully
        </div>
      )}
      <main className="max-w-[1120px] mx-auto px-10 pt-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight m-0 mb-1.5">Vault</h1>
            <p className="text-text-secondary text-[15px] m-0">
              Where your money is right now — always linked to a live escrow
            </p>
          </div>
          <button type="button" className={`${buttonBaseClasses} ${buttonVariantClasses.ghost}`}>
            <span className="msym text-base">filter_list</span>Filter
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-5">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Currently locked
            </div>
            <span className="font-mono accent-grad-text text-[28px] font-bold tracking-tight">$1,712.00</span>
          </div>
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-5">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Pending payment
            </div>
            <span className="font-mono text-action text-[28px] font-bold tracking-tight">$204.00</span>
          </div>
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-5">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Closest deadline
            </div>
            <span className="font-mono text-action text-[28px] font-bold tracking-tight">3h 12m</span>
          </div>
        </div>

        {/* Active escrows */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold m-0">Active escrows</h2>
          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
            {ESCROWS.length} positions
          </span>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {ESCROWS.map((e) => (
            <div
              key={e.id}
              className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-5 flex items-center gap-4 flex-wrap"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${e.iconBgClass}`}>
                <span className={`msym ${e.iconFilled ? 'fill' : ''} text-xl ${e.iconColorClass}`}>{e.icon}</span>
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-[15px] font-bold">{e.title}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.02em] ${e.chip.className}`}
                  >
                    {e.chip.dotIcon && <span className="msym fill text-[13px]">{e.chip.dotIcon}</span>}
                    {e.chip.label}
                  </span>
                </div>
                <OnChainLink hash={e.hash} />
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-bold">{e.amount}</div>
                <div className={`text-xs mt-0.5 ${e.metaClass}`}>{e.meta}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-lg font-bold m-0">Payment methods</h2>
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className={`${buttonBaseClasses} ${buttonVariantClasses.ghost}`}
            >
              <span className="msym text-base">add</span>Add payment method
            </button>
          </div>
          <p className="text-[13px] text-text-muted m-0 mb-1">
            Used to fund escrows — SplitRails never stores a balance here.
          </p>

          {showAddForm && (
            <form
              onSubmit={handleSaveCard}
              className="bg-neutral-light/60 border-[0.5px] border-border rounded-xl p-5 mt-3 mb-1"
            >
              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <div>
                  <label htmlFor="cardholderName" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                    Cardholder name
                  </label>
                  <input
                    id="cardholderName"
                    type="text"
                    required
                    value={cardForm.cardholderName}
                    onChange={(e) => setCardForm((f) => ({ ...f, cardholderName: e.target.value }))}
                    placeholder="John Doe"
                    className={fieldInputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="cardNumber" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                    Card number
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    required
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm((f) => ({ ...f, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    className={fieldInputClasses}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3.5 mb-4">
                <div>
                  <label htmlFor="expiry" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                    Expiry
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    required
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm((f) => ({ ...f, expiry: e.target.value }))}
                    placeholder="MM/YY"
                    className={fieldInputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="cvc" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    type="text"
                    inputMode="numeric"
                    required
                    value={cardForm.cvc}
                    onChange={(e) => setCardForm((f) => ({ ...f, cvc: e.target.value }))}
                    placeholder="123"
                    className={fieldInputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                    ZIP code
                  </label>
                  <input
                    id="zip"
                    type="text"
                    inputMode="numeric"
                    required
                    value={cardForm.zip}
                    onChange={(e) => setCardForm((f) => ({ ...f, zip: e.target.value }))}
                    placeholder="94103"
                    className={fieldInputClasses}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelAddCard}
                  className={`${buttonBaseClasses} ${buttonVariantClasses.ghost}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full cursor-pointer bg-gradient-brand text-white border-none py-2.5 px-4.5 text-[13px] font-bold shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98"
                >
                  Save payment method
                </button>
              </div>
            </form>
          )}

          {PAYMENT_METHODS.map((m, i) => (
            <div key={m.id}>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-neutral-light flex items-center justify-center shrink-0">
                    <span className="msym text-text-secondary text-lg">{m.icon}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{m.label}</div>
                    <div className="text-xs text-text-muted">{m.sublabel}</div>
                  </div>
                </div>
                {m.id === defaultMethodId ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-success-light text-success">
                    Default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDefaultMethodId(m.id)}
                    className={`${buttonBaseClasses} ${buttonVariantClasses.ghost}`}
                  >
                    Make default
                  </button>
                )}
              </div>
              {i < PAYMENT_METHODS.length - 1 && <hr className="h-[0.5px] bg-border/50 border-none" />}
            </div>
          ))}
        </div>

        {/* Trust callout */}
        <div className="bg-neutral/[0.04] border-[0.5px] border-neutral/[0.12] rounded-[14px] p-5.5 flex items-start gap-3">
          <span className="msym fill text-neutral text-xl shrink-0">shield</span>
          <p className="text-[13px] text-text-secondary leading-[1.5] m-0">
            <strong className="text-text-primary">SplitRails never holds your funds.</strong> Every amount above is
            secured in its own escrow contract, verifiable on-chain.
          </p>
        </div>
      </main>
    </div>
  )
}
