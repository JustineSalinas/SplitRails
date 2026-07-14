import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress as freighterGetAddress,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'
import { networkPassphrase } from './config'

function unwrap<T extends { error?: { message: string } }>(result: T): Omit<T, 'error'> {
  if (result.error) {
    throw new Error(result.error.message)
  }
  return result
}

export async function isWalletAvailable(): Promise<boolean> {
  const result = await freighterIsConnected()
  return unwrap(result).isConnected
}

export async function connect(): Promise<string> {
  const result = await requestAccess()
  return unwrap(result).address
}

export async function getAddress(): Promise<string> {
  const result = await freighterGetAddress()
  return unwrap(result).address
}

export async function signTransaction(transactionXdr: string, address: string): Promise<string> {
  const result = await freighterSignTransaction(transactionXdr, { networkPassphrase, address })
  return unwrap(result).signedTxXdr
}
