import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => navigate('/'), 500)
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-brand flex items-center justify-center text-white font-bold text-base">
            S
          </div>
          <span className="text-[19px] font-semibold tracking-tight">SplitRails</span>
        </div>

        <div className="bg-white border-[0.5px] border-border/50 rounded-2xl shadow-card p-8">
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
