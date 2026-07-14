import { signTransaction } from '@stellar/freighter-api'
import { Client as EscrowClient } from './escrow-bindings'
import { escrowContractId, networkPassphrase, sorobanRpcUrl } from './config'
import { logTx } from './txLog'

export type { Status as EscrowStatus } from './escrow-bindings'

export function getEscrowClient(publicKey?: string): EscrowClient {
  return new EscrowClient({
    contractId: escrowContractId,
    networkPassphrase,
    rpcUrl: sorobanRpcUrl,
    publicKey,
    signTransaction,
  })
}

export async function initEscrow(
  publicKey: string,
  params: {
    vendor: string
    token: string
    deadline: bigint
    totalRequired: bigint
    shares: Array<readonly [string, bigint]>
  },
) {
  const client = getEscrowClient(publicKey)
  const tx = await client.init({
    vendor: params.vendor,
    token: params.token,
    deadline: params.deadline,
    total_required: params.totalRequired,
    shares: params.shares,
  })
  const sent = await tx.signAndSend()
  const hash = sent.sendTransactionResponse?.hash
  if (hash) logTx('Split created', hash)
  return sent
}

export async function settleShare(publicKey: string, participant: string) {
  const client = getEscrowClient(publicKey)
  const tx = await client.settle({ participant })
  const sent = await tx.signAndSend()
  const hash = sent.sendTransactionResponse?.hash
  if (hash) logTx(`${participant.slice(0, 4)}…${participant.slice(-4)} locked their share`, hash)
  return sent
}

export async function expireEscrow(publicKey: string) {
  const client = getEscrowClient(publicKey)
  const tx = await client.expire()
  const sent = await tx.signAndSend()
  const hash = sent.sendTransactionResponse?.hash
  if (hash) logTx('Escrow expired · refunds issued', hash)
  return sent
}

export async function getEscrowStatus() {
  const client = getEscrowClient()
  const tx = await client.status()
  return tx.result
}

export async function getParticipantShare(participant: string) {
  const client = getEscrowClient()
  const tx = await client.get_share({ participant })
  return tx.result
}

export async function getEscrowTotals() {
  const client = getEscrowClient()
  const tx = await client.get_totals()
  return tx.result
}

export async function isParticipantCleared(participant: string) {
  const client = getEscrowClient()
  const tx = await client.is_cleared({ participant })
  return tx.result
}
