import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Button, buttonBaseClasses, buttonVariantClasses } from '../components/Button'
import { SplitCard } from '../components/SplitCard'
import { truncateAddress } from '../lib/amounts'
import { listInvoices } from '../lib/invoiceRegistry'

type SplitCategory = 'action' | 'waiting' | 'done'
type Tab = 'needs-action' | 'waiting' | 'all-active' | 'settled'
type SortMode = 'urgent' | 'az'

const TABS: { value: Tab; label: string }[] = [
  { value: 'needs-action', label: 'Needs action (3)' },
  { value: 'waiting', label: 'Waiting (2)' },
  { value: 'all-active', label: 'All active (8)' },
  { value: 'settled', label: 'Settled' },
]

const SORT_MODES: { value: SortMode; label: string }[] = [
  { value: 'urgent', label: 'Most urgent' },
  { value: 'az', label: 'A–Z' },
]

const URGENCY_RANK: Record<SplitCategory, number> = { action: 0, waiting: 1, done: 2 }

interface SplitEntry {
  id: number
  category: SplitCategory
  to: string
  chip: { label: string; variant: SplitCategory }
  title: string
  subtitle: string
  footer: () => ReactNode
}

const SPLITS: SplitEntry[] = [
  {
    id: 1,
    category: 'action',
    to: '/pay',
    chip: { label: 'Pay Alex', variant: 'action' },
    title: 'Q3 Client Infrastructure & Tooling',
    subtitle: 'Amazon Web Services · 77% collected',
    footer: () => (
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-0.5">
            You owe
          </div>
          <div className="font-mono text-[17px] font-semibold text-action-hover">$1,080.00</div>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-action">
          Pay now <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
        </span>
      </div>
    ),
  },
  {
    id: 2,
    category: 'action',
    to: '/new',
    chip: { label: 'Finish draft', variant: 'action' },
    title: 'Project Setup',
    subtitle: 'Tool subscriptions · started 2d ago',
    footer: () => (
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-0.5">
            Est. total
          </div>
          <div className="font-mono text-[17px] font-semibold text-text-muted">—</div>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-action">
          Continue <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
        </span>
      </div>
    ),
  },
  {
    id: 3,
    category: 'waiting',
    to: '/audit',
    chip: { label: 'Waiting on 1', variant: 'waiting' },
    title: 'Figma + Linear — Team Seats',
    subtitle: 'Shared SaaS stack · 5 of 6 paid',
    footer: () => (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar initials="JD" bg="#FFDBCC" />
          <span className="text-xs text-text-secondary">Jordan · 3d overdue</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-text-secondary">
          View <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
        </span>
      </div>
    ),
  },
  {
    id: 4,
    category: 'done',
    to: '/audit-complete',
    chip: { label: 'Settled', variant: 'done' },
    title: 'Contractor Overpayment',
    subtitle: 'Refund distributed · Jul 3',
    footer: () => (
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-0.5">
            Returned
          </div>
          <div className="font-mono text-[17px] font-semibold">$820.00</div>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-success">
          Complete <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
        </span>
      </div>
    ),
  },
  {
    id: 5,
    category: 'waiting',
    to: '/expired',
    chip: { label: 'Expired', variant: 'waiting' },
    title: 'Client Retainer — Q2',
    subtitle: 'Deadline passed · all contributors refunded',
    footer: () => (
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-0.5">
            Refunded
          </div>
          <div className="font-mono text-[17px] font-semibold">$5,550.00</div>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-text-secondary">
          Auto-refunded <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
        </span>
      </div>
    ),
  },
]

function matchesTab(entry: SplitEntry, tab: Tab): boolean {
  switch (tab) {
    case 'needs-action':
      return entry.category === 'action'
    case 'waiting':
      return entry.category === 'waiting'
    case 'settled':
      return entry.category === 'done'
    case 'all-active':
      return entry.category !== 'done'
  }
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('all-active')
  const [sortMode, setSortMode] = useState<SortMode>('urgent')
  const [sortOpen, setSortOpen] = useState(false)

  // Real invoices this browser has created — each is its own live escrow contract instance
  // (see lib/invoiceRegistry). Shown alongside the demo cards so a newly created split
  // actually appears here instead of only being reachable via its Settle Link.
  const liveEntries: SplitEntry[] = useMemo(
    () =>
      listInvoices().map((inv) => ({
        id: -inv.createdAt,
        category: 'waiting',
        to: `/audit/${inv.contractId}`,
        chip: { label: 'Live invoice', variant: 'waiting' },
        title: inv.label,
        subtitle: `To ${truncateAddress(inv.vendor)} · created ${new Date(inv.createdAt).toLocaleDateString()}`,
        footer: () => (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-0.5">
                Total
              </div>
              <div className="font-mono text-[17px] font-semibold">${inv.total.toFixed(2)}</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-text-secondary">
              View <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
            </span>
          </div>
        ),
      })),
    [],
  )

  const allSplits = useMemo(() => [...liveEntries, ...SPLITS], [liveEntries])

  const visibleSplits = useMemo(() => {
    const filtered = allSplits.filter((entry) => matchesTab(entry, activeTab))
    const sorted = [...filtered]
    if (sortMode === 'urgent') {
      sorted.sort((a, b) => URGENCY_RANK[a.category] - URGENCY_RANK[b.category])
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    }
    return sorted
  }, [allSplits, activeTab, sortMode])

  const currentSortLabel = SORT_MODES.find((m) => m.value === sortMode)?.label ?? 'Most urgent'

  return (
    <>
      <main className="max-w-[1240px] mx-auto px-10 max-md:px-6 max-sm:px-4 py-8 max-sm:py-5">
        {/* Page header */}
        <section className="flex items-end justify-between gap-6 flex-wrap mb-7">
          <div>
            <h1 className="text-[34px] max-sm:text-2xl font-bold tracking-tight m-0 mb-1.5 leading-[1.1]">
              Your Splits
            </h1>
            <p className="text-text-secondary text-[15px] max-sm:text-[13px] m-0">
              3 need your attention · 2 waiting on others · 4 settled this month
            </p>
          </div>
          <div className="flex gap-2.5 items-center">
            <Button variant="ghost" onClick={() => setActiveTab('needs-action')}>
              <span className="msym text-sm">tune</span> Filter
            </Button>
            <Link to="/new" className={`${buttonBaseClasses} ${buttonVariantClasses.primary}`}>
              <span className="msym text-base">add</span> New Split
            </Link>
          </div>
        </section>

        {/* Actionable stats */}
        <section className="grid grid-cols-3 max-md:grid-cols-1 gap-4 mb-8">
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-[22px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                You're owed
              </span>
              <span className="msym text-success text-[18px]">trending_up</span>
            </div>
            <div className="font-mono tabular-nums text-[32px] font-bold tracking-tight leading-[1.1] accent-grad-text">
              $8,240.50
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-success font-semibold">
              <span>+12% vs last month</span>
              <span className="text-text-muted font-normal">· across 5 teammates</span>
            </div>
          </div>

          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-[22px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-action-hover">
                Needs your action
              </span>
              <span className="msym fill text-action text-[18px]">notifications_active</span>
            </div>
            <div className="font-mono tabular-nums text-[32px] font-bold tracking-tight leading-[1.1] text-action-hover">
              3 splits
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <Button variant="nudge" className="px-2.5 py-1 text-[11px]" onClick={() => setActiveTab('needs-action')}>
                Review now →
              </Button>
            </div>
          </div>

          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-[22px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">
                You owe
              </span>
              <span className="msym text-text-muted text-[18px]">south_west</span>
            </div>
            <div className="font-mono tabular-nums text-[32px] font-bold tracking-tight leading-[1.1]">
              $1,940.20
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-text-secondary">
              <div className="flex">
                <Avatar initials="AS" bg="#E0E0FF" className="-mr-1.5" />
                <Avatar initials="MK" bg="#FFDBCC" />
              </div>
              <span className="ml-1">to 2 teammates</span>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <section className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div className="inline-flex p-[3px] bg-neutral-light rounded-[10px] gap-0.5 max-w-full overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={
                  activeTab === tab.value
                    ? 'border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-1.5 px-3.5 rounded-lg text-xs font-semibold text-text-primary cursor-pointer inline-flex items-center gap-1.5'
                    : 'border-none bg-transparent py-1.5 px-3.5 rounded-lg text-xs font-semibold text-text-secondary cursor-pointer'
                }
              >
                {tab.value === 'needs-action' && <span className="w-1.5 h-1.5 rounded-full bg-action" />}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex items-center gap-2 text-xs text-text-secondary">
            <span>Sort:</span>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="border-none bg-transparent font-semibold text-text-primary cursor-pointer inline-flex items-center gap-0.5 text-xs"
            >
              {currentSortLabel} <span className="msym text-sm">expand_more</span>
            </button>
            {sortOpen && (
              <div className="absolute top-full right-0 mt-1.5 bg-white border-[0.5px] border-border/50 rounded-[10px] shadow-card py-1 z-10 min-w-[140px]">
                {SORT_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => {
                      setSortMode(mode.value)
                      setSortOpen(false)
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs cursor-pointer border-none bg-transparent hover:bg-neutral-light ${
                      sortMode === mode.value ? 'font-semibold text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cards grid */}
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
          {visibleSplits.map((entry) => (
            <Link key={entry.id} to={entry.to} className="contents">
              <SplitCard
                chip={entry.chip}
                title={entry.title}
                subtitle={entry.subtitle}
                footer={entry.footer()}
              />
            </Link>
          ))}

          {visibleSplits.length === 0 && (
            <div className="col-span-full text-center text-sm text-text-muted py-16">
              No splits match this filter.
            </div>
          )}
        </div>
      </main>
    </>
  )
}
