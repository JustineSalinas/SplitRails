import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Button, buttonBaseClasses, buttonVariantClasses } from '../components/Button'
import { SplitCard } from '../components/SplitCard'

export function Dashboard() {
  return (
    <>
      <main className="max-w-[1240px] mx-auto px-10 py-8">
        {/* Page header */}
        <section className="flex items-end justify-between gap-6 flex-wrap mb-7">
          <div>
            <h1 className="text-[34px] font-bold tracking-tight m-0 mb-1.5 leading-[1.1]">Your Splits</h1>
            <p className="text-[#414755] text-[15px] m-0">
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
        <section className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-[0.5px] border-[#c1c6d7]/50 rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-[22px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#717786]">
                You're owed
              </span>
              <span className="msym text-[#34A853] text-[18px]">trending_up</span>
            </div>
            <div className="font-mono tabular-nums text-[32px] font-bold tracking-tight leading-[1.1] accent-grad-text">
              $1,240.50
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-[#34A853] font-semibold">
              <span>+12% vs last month</span>
              <span className="text-[#717786] font-normal">· across 5 people</span>
            </div>
          </div>

          <div className="bg-white border-[0.5px] border-[#c1c6d7]/50 rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-[22px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#7c2e00]">
                Needs your action
              </span>
              <span className="msym fill text-[#C64F00] text-[18px]">notifications_active</span>
            </div>
            <div className="font-mono tabular-nums text-[32px] font-bold tracking-tight leading-[1.1] text-[#7c2e00]">
              3 splits
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <Button variant="nudge" className="px-2.5 py-1 text-[11px]">
                Review now →
              </Button>
            </div>
          </div>

          <div className="bg-white border-[0.5px] border-[#c1c6d7]/50 rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] p-[22px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#717786]">
                You owe
              </span>
              <span className="msym text-[#717786] text-[18px]">south_west</span>
            </div>
            <div className="font-mono tabular-nums text-[32px] font-bold tracking-tight leading-[1.1]">
              $284.20
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-[#414755]">
              <div className="flex">
                <Avatar initials="AS" bg="#E0E0FF" className="-mr-1.5" />
                <Avatar initials="MK" bg="#FFDBCC" />
              </div>
              <span className="ml-1">to 2 people</span>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <section className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div className="inline-flex p-[3px] bg-[#ECEDF9] rounded-[10px] gap-0.5">
            <button
              type="button"
              className="border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-1.5 px-3.5 rounded-lg text-xs font-semibold text-[#181c23] cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C64F00]" />
              Needs action (3)
            </button>
            <button
              type="button"
              className="border-none bg-transparent py-1.5 px-3.5 rounded-lg text-xs font-semibold text-[#414755] cursor-pointer"
            >
              Waiting (2)
            </button>
            <button
              type="button"
              className="border-none bg-transparent py-1.5 px-3.5 rounded-lg text-xs font-semibold text-[#414755] cursor-pointer"
            >
              All active (8)
            </button>
            <button
              type="button"
              className="border-none bg-transparent py-1.5 px-3.5 rounded-lg text-xs font-semibold text-[#414755] cursor-pointer"
            >
              Settled
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#414755]">
            <span>Sort:</span>
            <button
              type="button"
              className="border-none bg-transparent font-semibold text-[#181c23] cursor-pointer inline-flex items-center gap-0.5 text-xs"
            >
              Most urgent <span className="msym text-sm">expand_more</span>
            </button>
          </div>
        </section>

        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-4">
          <SplitCard
            ring={{ trackColor: '#F1F3FE', arc: 75.4, strokeColor: '#C64F00' }}
            icon={{ name: 'restaurant', filled: true, color: '#C64F00' }}
            chip={{ label: 'Approve split', variant: 'action' }}
            title="Aspen Ski Trip"
            subtitle="Lodging & gear · 4 of 6 paid"
            footer={
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#717786] mb-0.5">
                    Your share
                  </div>
                  <div className="font-mono text-[17px] font-semibold">$408.33</div>
                </div>
                <Button variant="nudge">Approve →</Button>
              </div>
            }
          />

          <SplitCard
            ring={{ trackColor: '#F1F3FE', arc: 90.5, strokeColor: '#C64F00' }}
            icon={{ name: 'local_dining', filled: true, color: '#C64F00' }}
            chip={{ label: 'Pay Alex', variant: 'action' }}
            title="Office Dinner"
            subtitle="Sora · settled with 5 of 6"
            footer={
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#717786] mb-0.5">
                    You owe
                  </div>
                  <div className="font-mono text-[17px] font-semibold text-[#7c2e00]">$75.33</div>
                </div>
                <Button variant="nudge">Pay now →</Button>
              </div>
            }
          />

          <SplitCard
            ring={{ trackColor: '#F1F3FE', arc: 0, strokeColor: '#C64F00', dashedTrack: true }}
            icon={{ name: 'edit_note', filled: false, color: '#C64F00' }}
            chip={{ label: 'Finish draft', variant: 'action' }}
            title="Project Setup"
            subtitle="Tool subscriptions · started 2d ago"
            footer={
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#717786] mb-0.5">
                    Est. total
                  </div>
                  <div className="font-mono text-[17px] font-semibold text-[#717786]">—</div>
                </div>
                <Button variant="nudge">Continue →</Button>
              </div>
            }
          />

          <SplitCard
            ring={{ trackColor: '#F1F3FE', arc: 37.7, strokeColor: 'gradient' }}
            icon={{ name: 'content_cut', filled: true, gradient: true }}
            chip={{ label: 'Waiting on 4', variant: 'waiting' }}
            title="Beach House"
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
          />

          <SplitCard
            ring={{ trackColor: '#F1F3FE', arc: 94.2, strokeColor: 'gradient' }}
            icon={{ name: 'shopping_cart', filled: true, gradient: true }}
            chip={{ label: 'Waiting on 1', variant: 'waiting' }}
            title="Weekly Groceries"
            subtitle="Shared pantry · 5 of 6 paid"
            footer={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Avatar initials="JD" bg="#FFDBCC" />
                  <span className="text-xs text-[#414755]">Jordan · 3d overdue</span>
                </div>
                <Button variant="nudge">Nudge →</Button>
              </div>
            }
          />

          <SplitCard
            ring={{ trackColor: '#E6F4EA', arc: 113.1, strokeColor: '#34A853' }}
            icon={{ name: 'check', filled: true, color: '#34A853' }}
            chip={{ label: 'Settled', variant: 'done' }}
            title="Concert Tickets"
            subtitle="Refund distributed · Jul 3"
            footer={
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#717786] mb-0.5">
                    Returned
                  </div>
                  <div className="font-mono text-[17px] font-semibold">$120.00</div>
                </div>
                <span className="text-xs text-[#34A853] font-semibold">Complete</span>
              </div>
            }
          />
        </div>
      </main>
    </>
  )
}
