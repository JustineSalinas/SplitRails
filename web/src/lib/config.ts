function requireEnv(key: string): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return value
}

export const escrowContractId = requireEnv('VITE_ESCROW_CONTRACT_ID')
export const sorobanRpcUrl = requireEnv('VITE_SOROBAN_RPC_URL')
export const networkPassphrase = requireEnv('VITE_NETWORK_PASSPHRASE')
export const stellarNetwork = requireEnv('VITE_STELLAR_NETWORK')
