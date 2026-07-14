import { NavLink } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `py-[18px] px-1 text-[13px] font-semibold tracking-wide border-b-2 cursor-pointer ${
    isActive ? 'text-text-primary border-info' : 'text-text-secondary border-transparent'
  }`

function truncateAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

export function Nav() {
  const { address, connecting, error, connect } = useWallet()

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
          {address ? (
            <div
              title={address}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-light text-success text-[13px] font-mono font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {truncateAddress(address)}
            </div>
          ) : (
            <button
              type="button"
              onClick={connect}
              disabled={connecting}
              title={error ?? undefined}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-brand text-white text-[13px] font-semibold cursor-pointer disabled:opacity-60"
            >
              <span className="msym text-base">account_balance_wallet</span>
              {connecting ? 'Connecting…' : 'Connect wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
