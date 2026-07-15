function requireEnv(key: string): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return value
}

export const escrowContractId = requireEnv('VITE_ESCROW_CONTRACT_ID')
// The wasm hash already installed on-chain for the escrow contract — used to deploy a
// fresh, independent instance per invoice (see lib/escrow.ts deployEscrowInstance) instead
// of reusing the single fixed contract above, whose one-shot init() only ever supports one
// invoice for the lifetime of that instance.
export const escrowWasmHash = requireEnv('VITE_ESCROW_WASM_HASH')
export const sorobanRpcUrl = requireEnv('VITE_SOROBAN_RPC_URL')
export const networkPassphrase = requireEnv('VITE_NETWORK_PASSPHRASE')
export const stellarNetwork = requireEnv('VITE_STELLAR_NETWORK')
export const stellarExpertBase =
  import.meta.env.VITE_STELLAR_EXPERT_BASE || 'https://stellar.expert/explorer/testnet'
