import type { PasskeyRegistration } from './passkey'

// Persists a passkey registration per wallet address so a returning user isn't asked to
// re-register on every visit — genuinely "passwordless" across sessions, not just per-click.
const STORAGE_PREFIX = 'splitrails.passkey.'

export function loadPasskeyRegistration(address: string): PasskeyRegistration | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + address)
    return raw ? (JSON.parse(raw) as PasskeyRegistration) : null
  } catch {
    return null
  }
}

export function savePasskeyRegistration(address: string, registration: PasskeyRegistration) {
  try {
    localStorage.setItem(STORAGE_PREFIX + address, JSON.stringify(registration))
  } catch {
    // storage unavailable — registration only lasts this session
  }
}
