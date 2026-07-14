import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const inputClasses =
  'w-full box-border py-3 px-3.5 rounded-[10px] border-[0.5px] border-border text-sm font-sans text-text-primary outline-none focus:border-info focus:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]'

export function SignUp() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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
          <h1 className="text-2xl font-bold tracking-tight m-0 mb-1.5 text-center">Create your account</h1>
          <p className="text-sm text-text-secondary m-0 mb-6 text-center">
            Split bills, settled instantly on Stellar
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="firstName" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className={inputClasses}
                />
              </div>
            </div>
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
                className={inputClasses}
              />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="text-[13px] font-semibold text-text-primary mb-1.5 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClasses}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center bg-gradient-brand text-white border-none py-3.5 px-5 rounded-full text-[15px] font-bold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
            <p className="text-xs text-text-muted text-center m-0 mt-4">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-text-primary hover:text-info">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
