// Stellar Asset Contract tokens (SACs) — including the native XLM SAC and
// most testnet USDC issuances — use 7 decimal places. If the vendor's token
// uses a different `decimals()`, adjust this constant to match.
export const TOKEN_DECIMALS = 7

export function dollarsToBaseUnits(amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** TOKEN_DECIMALS))
}

export function baseUnitsToDollars(amount: bigint): number {
  return Number(amount) / 10 ** TOKEN_DECIMALS
}

const STELLAR_ADDRESS_RE = /^[GC][A-Z2-7]{55}$/

export function isValidStellarAddress(value: string): boolean {
  return STELLAR_ADDRESS_RE.test(value.trim())
}
