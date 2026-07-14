import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Button, buttonBaseClasses, buttonVariantClasses } from '../components/Button'
import { SplitCard } from '../components/SplitCard'

export function Dashboard() {
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
            <Button variant="ghost">
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
              <Button variant="nudge" className="px-2.5 py-1 text-[11px]">
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
            <button
              type="button"
              className="border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-1.5 px-3.5 rounded-lg text-xs font-semibold text-text-primary cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-action" />
              Needs action (3)
            </button>
            <button
              type="button"
              className="border-none bg-transparent py-1.5 px-3.5 rounded-lg text-xs font-semibold text-text-secondary cursor-pointer"
            >
              Waiting (2)
            </button>
            <button
              type="button"
              className="border-none bg-transparent py-1.5 px-3.5 rounded-lg text-xs font-semibold text-text-secondary cursor-pointer"
            >
              All active (8)
            </button>
            <button
              type="button"
              className="border-none bg-transparent py-1.5 px-3.5 rounded-lg text-xs font-semibold text-text-secondary cursor-pointer"
            >
              Settled
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span>Sort:</span>
            <button
              type="button"
              className="border-none bg-transparent font-semibold text-text-primary cursor-pointer inline-flex items-center gap-0.5 text-xs"
            >
              Most urgent <span className="msym text-sm">expand_more</span>
            </button>
          </div>
        </section>

        {/* Cards grid */}
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
          {/* <SplitCard
            chip={{ label: 'Approve split', variant: 'action' }}
            title="Client Retainer — Q3"
            subtitle="Contractor payout · 4 of 6 paid"
            footer={
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-0.5">
                    Your share
                  </div>
                  <div className="font-mono text-[17px] font-semibold">$2,408.33</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-action">
                  Approve <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                </span>
              </div>
            }
          /> */}

          <Link to="/pay" className="contents">
            <SplitCard
              chip={{ label: 'Pay Alex', variant: 'action' }}
              title="AWS + Design Tools — Q3"
              subtitle="Amazon Web Services · settled with 5 of 6"
              footer={
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted mb-0.5">
                      You owe
                    </div>
                    <div className="font-mono text-[17px] font-semibold text-action-hover">$1,410.00</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-action">
                    Pay now <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                  </span>
                </div>
              }
            />
          </Link>

          <SplitCard
            chip={{ label: 'Finish draft', variant: 'action' }}
            title="Project Setup"
            subtitle="Tool subscriptions · started 2d ago"
            footer={
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
            }
          />

          {/* <SplitCard
            chip={{ label: 'Waiting on 4', variant: 'waiting' }}
            title="Client Onboarding Sprint"
            subtitle="2 of 6 confirmed splits"
            footer={
              <div className="flex items-center justify-between">
                <div className="flex">
                  <Avatar initials="MK" bg="#FFDBCC" className="-mr-2" />
                  <Avatar initials="TR" bg="#E0E0FF" className="-mr-2" />
                  <Avatar initials="+2" bg="#E3E2E7" />
                </div>
                <Button variant="ghost">Nudge</Button>
              </div>
            }
          /> */}

          <Link to="/audit" className="contents">
            <SplitCard
              chip={{ label: 'Waiting on 1', variant: 'waiting' }}
              title="Figma + Linear — Team Seats"
              subtitle="Shared SaaS stack · 5 of 6 paid"
              footer={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Avatar initials="JD" bg="#FFDBCC" />
                    <span className="text-xs text-text-secondary">Jordan · 3d overdue</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-text-secondary">
                    View <span className="msym text-base transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
                  </span>
                </div>
              }
            />
          </Link>

          <Link to="/audit-complete" className="contents">
            <SplitCard
              chip={{ label: 'Settled', variant: 'done' }}
              title="Contractor Overpayment"
              subtitle="Refund distributed · Jul 3"
              footer={
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
              }
            />
          </Link>

          <Link to="/expired" className="contents">
            <SplitCard
              chip={{ label: 'Expired', variant: 'waiting' }}
              title="Client Retainer — Q2"
              subtitle="Deadline passed · all contributors refunded"
              footer={
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
              }
            />
          </Link>
        </div>
      </main>
    </>
  )
}
