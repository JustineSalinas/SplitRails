import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `py-[18px] px-1 text-[13px] font-semibold tracking-wide border-b-2 cursor-pointer ${
    isActive ? 'text-text-primary border-info' : 'text-text-secondary border-transparent'
  }`

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-xl border-b-[0.5px] border-border">
      <div className="flex items-center justify-between h-14 px-10 max-w-[1240px] mx-auto">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="text-[17px] font-semibold tracking-tight">SplitRails</span>
          </div>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Splits
            </NavLink>
            <NavLink to="/activity" className={navLinkClass}>
              Activity
            </NavLink>
            <NavLink to="/vault" className={navLinkClass}>
              Vault
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-light rounded-[10px] min-w-[240px]">
            <span className="msym text-base text-text-muted">search</span>
            <input
              placeholder="Search splits, people, or amounts"
              className="border-none bg-transparent outline-none text-[13px] text-text-primary flex-1 font-sans placeholder:text-text-muted"
            />
            <span className="text-[11px] text-text-muted px-1.5 py-0.5 bg-white rounded border-[0.5px] border-border">
              ⌘K
            </span>
          </div>
          <button
            type="button"
            className="border-none bg-transparent p-2 rounded-full cursor-pointer text-text-secondary hover:bg-neutral-light"
          >
            <span className="msym">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            RM
          </div>
        </div>
      </div>
    </header>
  )
}
