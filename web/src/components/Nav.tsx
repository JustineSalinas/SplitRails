import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `py-[18px] px-1 text-[13px] font-semibold tracking-wide border-b-2 cursor-pointer ${
    isActive ? 'text-[#181c23] border-[#007AFF]' : 'text-[#414755] border-transparent'
  }`

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[#f9f9ff]/85 backdrop-blur-xl border-b-[0.5px] border-[#c1c6d7]">
      <div className="flex items-center justify-between h-14 px-10 max-w-[1240px] mx-auto">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#007AFF] to-[#00C7BE] flex items-center justify-center text-white font-bold text-sm">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#ECEDF9] rounded-[10px] min-w-[240px]">
            <span className="msym text-base text-[#717786]">search</span>
            <input
              placeholder="Search splits, people, or amounts"
              className="border-none bg-transparent outline-none text-[13px] text-[#181c23] flex-1 font-sans placeholder:text-[#717786]"
            />
            <span className="text-[11px] text-[#717786] px-1.5 py-0.5 bg-white rounded border-[0.5px] border-[#C1C6D7]">
              ⌘K
            </span>
          </div>
          <button
            type="button"
            className="border-none bg-transparent p-2 rounded-full cursor-pointer text-[#414755] hover:bg-[#ECEDF9]"
          >
            <span className="msym">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#007AFF] to-[#00C7BE] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            RM
          </div>
        </div>
      </div>
    </header>
  )
}
