import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/finalsplitrailsicon.webp'
import { useWallet } from '../context/WalletContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-[18px] px-1 text-[13px] font-semibold tracking-wide cursor-pointer transition-colors duration-200 after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:-translate-x-1/2 after:h-0.5 after:rounded-full after:transition-all after:duration-300 after:ease-out ${
    isActive
      ? 'text-text-primary after:w-full after:bg-info'
      : 'text-text-secondary hover:text-text-primary after:w-0 after:bg-text-secondary/50 hover:after:w-full'
  }`

function truncateAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

export function Nav() {
  const { address, connecting, error, connect } = useWallet()

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-xl border-b-[0.5px] border-border">
      <div className="flex items-center justify-between h-14 px-10 max-md:px-6 max-sm:px-4 max-w-[1240px] mx-auto">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="SplitRails"
              className="w-7 h-7 rounded-lg object-cover transition-transform duration-300 ease-out hover:-rotate-6 hover:scale-110"
            />
            <span className="text-[17px] font-semibold tracking-tight max-sm:hidden">SplitRails</span>
          </div>
          <nav className="flex gap-1 max-lg:hidden">
            <NavLink to="/" end className={navLinkClass}>
              Splits
            </NavLink>
            <NavLink to="/activity" className={navLinkClass}>
              Activity
            </NavLink>
            <NavLink to="/vault" className={navLinkClass}>
              Vault
            </NavLink>
            <NavLink to="/finance" className={navLinkClass}>
              Finance
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 max-sm:gap-2">
          <div className="max-lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-light rounded-[10px] min-w-[240px]">
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
            className="lg:hidden border-none bg-transparent p-2 rounded-full cursor-pointer text-text-secondary hover:bg-neutral-light hover:text-text-primary transition-colors duration-150 [&_.msym]:inline-block [&_.msym]:transition-transform [&_.msym]:duration-200 hover:[&_.msym]:rotate-12"
          >
            <span className="msym">search</span>
          </button>
          <button
            type="button"
            className="border-none bg-transparent p-2 rounded-full cursor-pointer text-text-secondary hover:bg-neutral-light hover:text-text-primary transition-colors duration-150 max-sm:hidden [&_.msym]:inline-block [&_.msym]:transition-transform [&_.msym]:duration-200 hover:[&_.msym]:-rotate-12 hover:[&_.msym]:scale-110"
          >
            <span className="msym">notifications</span>
          </button>
          {address ? (
            <div
              title={address}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-light text-success text-[13px] font-mono font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="max-sm:hidden">{truncateAddress(address)}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={connect}
              disabled={connecting}
              title={error ?? undefined}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 max-sm:px-2.5 rounded-full bg-gradient-brand text-white text-[13px] font-semibold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.15)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] transition-shadow duration-200 active:scale-97 disabled:opacity-60"
            >
              <span className="msym text-base">account_balance_wallet</span>
              <span className="max-sm:hidden">{connecting ? 'Connecting…' : 'Connect wallet'}</span>
            </button>
          )}
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold cursor-pointer shrink-0 max-lg:hidden transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            RM
          </Link>
        </div>
      </div>
    </header>
  )
}
