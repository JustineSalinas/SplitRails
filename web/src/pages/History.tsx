import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'

type Category = 'all' | 'created' | 'approved' | 'settled' | 'rollback' | 'reminder'

interface DetailParticipant {
  initials: string
  bg: string
  textColor?: string
}

interface ActivityEvent {
  id: number
  section: 'Today' | 'Yesterday'
  icon: string
  filled?: boolean
  iconBgClass: string
  iconColorClass: string
  titleText: string
  amount?: string
  amountClass?: string
  tag: string
  timeAgo: string
  hash: string
  category: Exclude<Category, 'all'>
  detail: {
    participants: DetailParticipant[]
    costCenters: string[]
  }
}

const FILTERS: { label: string; value: Category }[] = [
  { label: 'All events', value: 'all' },
  { label: 'Created', value: 'created' },
  { label: 'Approved', value: 'approved' },
  { label: 'Settled', value: 'settled' },
  { label: 'Rolled back', value: 'rollback' },
  { label: 'Reminders', value: 'reminder' },
]

const EVENTS: ActivityEvent[] = [
  {
    id: 1,
    section: 'Today',
    icon: 'check_circle',
    filled: true,
    iconBgClass: 'bg-info/10',
    iconColorClass: 'text-info',
    titleText: 'Maya approved her share — ',
    amount: '$204.16',
    amountClass: 'accent-grad-text font-bold',
    tag: 'Aspen Ski Trip',
    timeAgo: '2h ago',
    hash: '0x4a7c…9f2',
    category: 'approved',
    detail: {
      participants: [
        { initials: 'MC', bg: '#007AFF', textColor: 'white' },
        { initials: 'JD', bg: '#00C7BE', textColor: 'white' },
        { initials: '+4', bg: '#ECEDF9', textColor: 'var(--color-text-secondary)' },
      ],
      costCenters: ['Travel & Leisure', 'Q4 Budget'],
    },
  },
  {
    id: 2,
    section: 'Today',
    icon: 'shopping_cart',
    iconBgClass: 'bg-neutral-light',
    iconColorClass: 'text-text-secondary',
    titleText: 'New split created by Marcus — $1,450.00',
    tag: 'Office Supplies',
    timeAgo: '5h ago',
    hash: '0x88e1…3f9',
    category: 'created',
    detail: {
      participants: [
        { initials: 'MR', bg: '#00C7BE', textColor: 'white' },
        { initials: '+3', bg: '#ECEDF9', textColor: 'var(--color-text-secondary)' },
      ],
      costCenters: ['Operations'],
    },
  },
  {
    id: 3,
    section: 'Yesterday',
    icon: 'restaurant',
    iconBgClass: 'bg-neutral-light',
    iconColorClass: 'text-text-secondary',
    titleText: 'Settlement finalized for Team Dinner',
    tag: 'Operations',
    timeAgo: '1d ago',
    hash: '0xf2b9…11a',
    category: 'settled',
    detail: {
      participants: [
        { initials: 'JD', bg: '#007AFF', textColor: 'white' },
        { initials: 'AR', bg: '#00C7BE', textColor: 'white' },
        { initials: '+2', bg: '#ECEDF9', textColor: 'var(--color-text-secondary)' },
      ],
      costCenters: ['Operations', 'Team Events'],
    },
  },
  {
    id: 4,
    section: 'Yesterday',
    icon: 'history',
    iconBgClass: 'bg-action/[0.12]',
    iconColorClass: 'text-action',
    titleText: 'Transaction rolled back — ',
    amount: '$52.00',
    amountClass: 'text-action font-bold',
    tag: 'Marketing Subs',
    timeAgo: '1d ago',
    hash: '0xdd43…e42',
    category: 'rollback',
    detail: {
      participants: [{ initials: 'LT', bg: '#FFDBCC', textColor: 'var(--color-text-secondary)' }],
      costCenters: ['Marketing'],
    },
  },
]

export function History() {
  const [activeFilter, setActiveFilter] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set([1]))

  function toggleRow(id: number) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return EVENTS.filter((e) => {
      const matchesFilter = activeFilter === 'all' || e.category === activeFilter
      const matchesSearch =
        !query || `${e.titleText}${e.amount ?? ''} ${e.tag}`.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [activeFilter, search])

  const sections = useMemo(() => {
    const order: ActivityEvent['section'][] = ['Today', 'Yesterday']
    return order
      .map((section) => ({ section, events: filteredEvents.filter((e) => e.section === section) }))
      .filter((group) => group.events.length > 0)
  }, [filteredEvents])

  function handleDownloadLedger() {
    const rows = [
      ['Section', 'Event', 'Amount', 'Tag', 'When', 'Hash'],
      ...EVENTS.map((e) => [e.section, e.titleText.trim(), e.amount ?? '', e.tag, e.timeAgo, e.hash]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'splitrails-activity.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      <main className="max-w-[1120px] mx-auto px-10 pt-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight m-0 mb-1.5">Activity</h1>
            <p className="text-text-secondary text-[15px] m-0">
              Full transaction history across all your splits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="border-none bg-action text-white py-2 px-3.5 rounded-full cursor-pointer text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_2px_8px_rgba(232,99,10,0.25)]"
            >
              <span className="msym text-base">filter_list</span>Filter
            </button>
            <button
              type="button"
              onClick={handleDownloadLedger}
              className="border-none bg-gradient-brand text-white py-2.5 px-4.5 rounded-full cursor-pointer text-[13px] font-bold inline-flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)]"
            >
              <span className="msym text-base">download</span>Download ledger
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-5">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Transactions this month
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[28px] font-bold tracking-tight">1,284</span>
              <span className="text-xs font-bold text-info bg-info-light px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                <span className="msym text-sm">trending_up</span>+12%
              </span>
            </div>
          </div>
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-5">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Total settled
            </div>
            <span className="font-mono accent-grad-text text-[28px] font-bold tracking-tight">$42,901.50</span>
          </div>
          <div className="bg-info-light/60 border-[0.5px] border-border/50 rounded-[14px] shadow-card p-5">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5">
              Rollbacks
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[28px] font-bold opacity-60">14</span>
              <span className="text-[11px] font-semibold text-text-secondary bg-neutral-light px-2 py-0.5 rounded-full">
                Stable
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFilter(f.value)}
                className={`border-none py-2 px-4 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  activeFilter === f.value
                    ? 'bg-gradient-brand text-white'
                    : 'bg-neutral-light text-text-secondary hover:bg-border/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-2 py-2.5 px-3.5 bg-white border-[0.5px] border-border rounded-[10px] min-w-[220px]">
              <span className="msym text-base text-text-muted">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity…"
                className="border-none bg-transparent outline-none text-[13px] text-text-primary flex-1 font-sans placeholder:text-text-muted"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 py-2.5 px-3.5 bg-white border-[0.5px] border-border rounded-[10px] text-xs font-semibold text-text-primary cursor-pointer"
            >
              Date<span className="msym text-[15px]">expand_more</span>
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-6">
          {sections.map((group) => (
            <div key={group.section}>
              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2.5 pl-1">
                {group.section}
              </div>
              <div className="flex flex-col gap-2">
                {group.events.map((event) => {
                  const isOpen = openIds.has(event.id)
                  return (
                    <div key={event.id}>
                      <div
                        onClick={() => toggleRow(event.id)}
                        className={`bg-white border-[0.5px] border-border/50 p-4 flex items-center gap-3.5 cursor-pointer hover:bg-bg transition-colors duration-150 ${
                          isOpen ? 'rounded-t-[14px]' : 'rounded-[14px]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${event.iconBgClass}`}
                        >
                          <span className={`msym ${event.filled ? 'fill' : ''} text-lg ${event.iconColorClass}`}>
                            {event.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold">
                            {event.titleText}
                            {event.amount && <span className={event.amountClass}>{event.amount}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.03em] bg-neutral-light text-text-muted px-2 py-0.5 rounded-full">
                              {event.tag}
                            </span>
                            <span className="text-xs text-text-muted">{event.timeAgo}</span>
                          </div>
                        </div>
                        <span className="hidden md:inline font-mono text-xs text-text-muted">{event.hash}</span>
                        <span className="msym text-text-muted text-xl">
                          {isOpen ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                      {isOpen && (
                        <div className="bg-bg border-[0.5px] border-t-0 border-border/50 rounded-b-[14px] px-5 pt-4.5 pb-5">
                          <div className="grid grid-cols-3 gap-5">
                            <div>
                              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2">
                                Participants
                              </div>
                              <div className="flex">
                                {event.detail.participants.map((p, i) => (
                                  <Avatar
                                    key={i}
                                    initials={p.initials}
                                    bg={p.bg}
                                    textColor={p.textColor}
                                    size={28}
                                    className={i < event.detail.participants.length - 1 ? '-mr-2' : ''}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-2">
                                Cost center
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                {event.detail.costCenters.map((c) => (
                                  <span
                                    key={c}
                                    className="text-[10px] font-bold uppercase tracking-[0.03em] bg-neutral-light text-text-muted px-2 py-0.5 rounded-full"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <Link
                                to="/audit-ledger"
                                className="text-[13px] font-semibold text-info inline-flex items-center gap-1"
                              >
                                View on ledger<span className="msym text-sm">open_in_new</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {sections.length === 0 && (
            <div className="text-center text-sm text-text-muted py-16">No activity matches your filters.</div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="button"
            className="border-[0.5px] border-border bg-neutral-light text-info py-3 px-7 rounded-[10px] text-[13px] font-bold cursor-pointer"
          >
            Load older activity
          </button>
        </div>
      </main>
    </div>
  )
}
