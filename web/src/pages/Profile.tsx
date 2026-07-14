import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'

interface ProfileFields {
  name: string
  email: string
  phone: string
}

const inputClasses =
  'text-sm font-semibold text-text-primary text-right bg-neutral-light rounded-lg px-2.5 py-1.5 border-none outline-none focus:ring-2 focus:ring-info/30 font-sans w-[220px] max-sm:w-[140px]'

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={`w-10 h-6 rounded-full relative shrink-0 border-none cursor-pointer transition-colors duration-150 ${
        on ? 'bg-gradient-brand' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-[left] duration-150 ${
          on ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export function Profile() {
  const navigate = useNavigate()
  const { disconnect } = useWallet()
  const [saved, setSaved] = useState<ProfileFields>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 019-3382',
  })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileFields>(saved)
  const [showToast, setShowToast] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  function startEdit() {
    setDraft(saved)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  function saveEdit() {
    setSaved(draft)
    setEditing(false)
    setShowToast(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <div className="text-text-primary font-sans pb-20">
      {showToast && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[100] bg-text-primary text-white py-3 px-5 rounded-full flex items-center gap-2 text-[13px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <span className="msym fill text-success text-[17px]">check_circle</span>Profile updated successfully
        </div>
      )}

      <main className="max-w-[1120px] mx-auto px-10 max-md:px-6 max-sm:px-4 pt-10 max-sm:pt-6">
        <h1 className="text-[32px] font-bold tracking-tight m-0 mb-6">Profile</h1>

        <div className="grid grid-cols-[1fr_1.6fr] gap-5 items-start max-[900px]:grid-cols-1">
          {/* Left: identity card */}
          <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-7 text-center">
            <div className="w-[84px] h-[84px] rounded-full bg-gradient-brand flex items-center justify-center text-white text-[28px] font-bold mx-auto mb-4">
              JD
            </div>
            <h2 className="text-[19px] font-bold m-0 mb-0.5">{saved.name}</h2>
            <p className="text-[13px] text-text-muted m-0 mb-3">{saved.email}</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-success-light text-success">
              <span className="msym fill text-[13px]">verified</span>Identity verified
            </span>
            <hr className="h-[0.5px] bg-border/50 border-none my-5" />
            <div className="flex justify-around text-center">
              <div>
                <div className="font-mono text-lg font-bold">12</div>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">Splits</div>
              </div>
              <div>
                <div className="font-mono accent-grad-text text-lg font-bold">$4,812</div>
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted">Settled</div>
              </div>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={startEdit}
                className="w-full mt-5 box-border bg-transparent text-text-primary border-[0.5px] border-border py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer hover:bg-neutral-light"
              >
                Edit profile
              </button>
            ) : (
              <div className="flex gap-2.5 mt-5">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 box-border bg-transparent text-text-primary border-[0.5px] border-border py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer hover:bg-neutral-light"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="flex-1 box-border bg-gradient-brand text-white border-none py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)]"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-6">
              <h3 className="text-base font-bold m-0 mb-1">Account details</h3>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">Full name</span>
                {editing ? (
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className={inputClasses}
                  />
                ) : (
                  <span className="text-sm font-semibold">{saved.name}</span>
                )}
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">Email</span>
                {editing ? (
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                    className={inputClasses}
                  />
                ) : (
                  <span className="text-sm font-semibold">{saved.email}</span>
                )}
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">Phone</span>
                {editing ? (
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    className={inputClasses}
                  />
                ) : (
                  <span className="text-sm font-semibold">{saved.phone}</span>
                )}
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">Member since</span>
                <span className="text-sm font-semibold">March 2023</span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm text-text-secondary">Country</div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Determines the local currency Stellar settles your payments in
                  </div>
                </div>
                <span className="text-sm font-semibold inline-flex items-center gap-1.5 shrink-0 ml-4">
                  United States (USD)<span className="msym text-base text-text-muted">expand_more</span>
                </span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm text-text-secondary">Organization</div>
                  <div className="text-[11px] text-text-muted mt-0.5">Optional</div>
                </div>
                <span className="text-sm text-text-muted">Add organization</span>
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm text-text-secondary">Role</div>
                  <div className="text-[11px] text-text-muted mt-0.5">Optional</div>
                </div>
                <span className="text-sm text-text-muted">Add role</span>
              </div>
            </div>

            <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-6">
              <h3 className="text-base font-bold m-0 mb-1">Preferences</h3>
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-semibold">Push notifications</div>
                  <div className="text-xs text-text-muted">Get notified on split activity</div>
                </div>
                <Switch on={pushNotifications} onToggle={() => setPushNotifications((v) => !v)} />
              </div>
              <hr className="h-[0.5px] bg-border/50 border-none" />
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-semibold">Marketing emails</div>
                  <div className="text-xs text-text-muted">Product news and tips</div>
                </div>
                <Switch on={marketingEmails} onToggle={() => setMarketingEmails((v) => !v)} />
              </div>
            </div>

            <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card p-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-sm font-bold text-action">Disconnect wallet</div>
                <div className="text-xs text-text-muted">Forget this wallet on this device</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  disconnect()
                  navigate('/')
                }}
                className="bg-action text-white border-none py-2.5 px-4.5 rounded-full text-[13px] font-bold cursor-pointer shadow-[0_2px_8px_rgba(232,99,10,0.25)] hover:shadow-[0_4px_14px_rgba(232,99,10,0.35)]"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
