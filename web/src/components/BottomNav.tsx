import { NavLink } from 'react-router-dom'

interface Tab {
  to: string
  end?: boolean
  icon: string
  label: string
}

const TABS: Tab[] = [
  { to: '/', end: true, icon: 'pie_chart', label: 'Splits' },
  { to: '/activity', icon: 'history', label: 'Activity' },
  { to: '/vault', icon: 'account_balance', label: 'Vault' },
  { to: '/profile', icon: 'account_circle', label: 'Profile' },
]

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-xl border-t-[0.5px] border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-16 max-w-[640px] mx-auto">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `group flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] font-semibold cursor-pointer transition-colors duration-200 ${
                isActive ? 'text-info' : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`msym ${isActive ? 'fill' : ''} text-[22px] transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-90`}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
