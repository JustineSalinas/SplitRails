import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/finalsplitrailsicon.webp'
import { isWalletAvailable } from '../lib/wallet'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [freighterMissing, setFreighterMissing] = useState(false)

  useEffect(() => {
    isWalletAvailable().then((available) => {
      if (!available) setFreighterMissing(true)
    })
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => navigate('/'), 500)
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">

        {/* Freighter install notice — shown to online viewers without the extension */}
        {freighterMissing && (
          <div className="mb-5 rounded-2xl border-[0.5px] border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
            <span className="msym text-[22px] text-amber-500 shrink-0 mt-0.5">extension</span>
            <div>
              <div className="text-[13px] font-bold text-amber-900 mb-0.5">Freighter wallet required</div>
              <p className="text-[12px] text-amber-800 m-0 mb-2 leading-relaxed">
                SplitRails uses the <strong>Freighter browser extension</strong> to sign Stellar transactions.
                Install it to interact with the live escrow demo.
              </p>
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full px-3 py-1.5 no-underline transition-colors"
              >
                <span className="msym text-sm">download</span>
                Install Freighter — freighter.app
                <span className="msym text-sm">open_in_new</span>
              </a>
              <p className="text-[11px] text-amber-700 m-0 mt-2">
                After installing, set it to <strong>Testnet</strong> and fund your wallet at{' '}
                <a
                  href="https://laboratory.stellar.org/account-creator?network=testnet"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-amber-900 underline"
                >
                  Stellar Laboratory
                </a>.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-8">
          <img src={logo} alt="SplitRails" className="w-8 h-8 rounded-[9px] object-cover" />
          <span className="text-[19px] font-semibold tracking-tight">SplitRails</span>
        </div>

        <div className="bg-white border-[0.5px] border-border/50 rounded-2xl shadow-card p-8 max-sm:p-6">
          <h1 className="text-2xl font-bold tracking-tight m-0 mb-1.5 text-center">Welcome back</h1>
          <p className="text-sm text-text-secondary m-0 mb-6 text-center">Log in to manage your splits</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full box-border py-3 px-3.5 rounded-[10px] border-[0.5px] border-border text-sm font-sans text-text-primary outline-none focus:border-info focus:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="password" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full box-border py-3 px-3.5 rounded-[10px] border-[0.5px] border-border text-sm font-sans text-text-primary outline-none focus:border-info focus:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]"
              />
            </div>
            <div className="text-right mb-5">
              <span className="text-[13px] font-semibold text-info cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center bg-gradient-brand text-white border-none py-3.5 px-5 rounded-full text-[15px] font-bold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-text-primary hover:text-info">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
