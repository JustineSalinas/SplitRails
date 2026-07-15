import { signTransaction } from '@stellar/freighter-api'
import type { Result } from '@stellar/stellar-sdk/contract'
import { baseUnitsToDollars } from './amounts'
import { escrowContractId, escrowWasmHash, networkPassphrase, sorobanRpcUrl } from './config'
import { Client as EscrowClient } from './escrow-bindings'
import { logTx } from './txLog'

export type { Status as EscrowStatus } from './escrow-bindings'

export function getEscrowClient(publicKey?: string, contractId: string = escrowContractId): EscrowClient {
  return new EscrowClient({
    contractId,
    networkPassphrase,
    rpcUrl: sorobanRpcUrl,
    publicKey,
    signTransaction,
  })
}

// Contract methods that return Rust's Result<T, Error> don't throw on a
// contract-level Err — the transaction still submits successfully; only the
// *return value* encodes the failure. Left unchecked, callers would treat a
// rejected invoice/payment as a success. This unwraps that Result and turns
// an Err into a real thrown error so existing try/catch call sites work.
function unwrapResult<T>(result: Result<T>): T {
  if (result.isErr()) {
    throw new Error(result.unwrapErr().message)
  }
  return result.unwrap()
}

// The fixed contract at `escrowContractId` only ever supports one invoice for its whole
// lifetime — its `init()` is one-shot and permanently rejects a second call. Every new
// invoice deploys its own independent contract instance from the same installed wasm
// (the "factory" pattern Soroban supports natively), so creating invoice #2, #3, ... never
// collides with #1. Returns the new instance's contract ID.
export async function deployEscrowInstance(publicKey: string): Promise<string> {
  const deployTx = await EscrowClient.deploy({
    wasmHash: escrowWasmHash,
    networkPassphrase,
    rpcUrl: sorobanRpcUrl,
    publicKey,
    signTransaction,
  })
  const sent = await deployTx.signAndSend()
  const newContractId = sent.result.options.contractId
  const hash = sent.sendTransactionResponse?.hash
  if (hash) logTx('New escrow instance deployed', hash, newContractId)
  return newContractId
}

export async function initEscrow(
  publicKey: string,
  contractId: string,
  params: {
    vendor: string
    token: string
    deadline: bigint
    totalRequired: bigint
    shares: Array<readonly [string, bigint]>
  },
) {
  const client = getEscrowClient(publicKey, contractId)
  const tx = await client.init({
    creator: publicKey,
    vendor: params.vendor,
    token: params.token,
    deadline: params.deadline,
    total_required: params.totalRequired,
    shares: params.shares,
  })
  const sent = await tx.signAndSend()
  const result = unwrapResult(sent.result)
  const hash = sent.sendTransactionResponse?.hash
  if (hash) logTx('Split created', hash, contractId, baseUnitsToDollars(params.totalRequired))
  return result
}

export async function settleShare(publicKey: string, participant: string, contractId: string = escrowContractId) {
  const client = getEscrowClient(publicKey, contractId)
  const tx = await client.settle({ participant })
  const sent = await tx.signAndSend()
  const result = unwrapResult(sent.result)
  const hash = sent.sendTransactionResponse?.hash
  if (hash) {
    // Query the just-cleared share so the log carries a real dollar amount —
    // used to compute burn rate / cumulative spend on the Audit Ledger timeline.
    let amount: number | undefined
    try {
      amount = baseUnitsToDollars(await getParticipantShare(participant, contractId))
    } catch {
      // amount is a nice-to-have for the timeline; don't fail the settle over it
    }
    logTx(`${participant.slice(0, 4)}…${participant.slice(-4)} locked their share`, hash, contractId, amount)
  }
  return result
}

export async function expireEscrow(publicKey: string, contractId: string = escrowContractId) {
  const client = getEscrowClient(publicKey, contractId)
  const tx = await client.expire()
  const sent = await tx.signAndSend()
  const result = unwrapResult(sent.result)
  const hash = sent.sendTransactionResponse?.hash
  if (hash) logTx('Escrow expired · refunds issued', hash, contractId)
  return result
}

export async function getEscrowStatus(contractId: string = escrowContractId) {
  const client = getEscrowClient(undefined, contractId)
  const tx = await client.status()
  return tx.result
}

export async function getParticipantShare(participant: string, contractId: string = escrowContractId) {
  const client = getEscrowClient(undefined, contractId)
  const tx = await client.get_share({ participant })
  return tx.result
}

export async function getEscrowTotals(contractId: string = escrowContractId) {
  const client = getEscrowClient(undefined, contractId)
  const tx = await client.get_totals()
  return tx.result
}

export async function isParticipantCleared(participant: string, contractId: string = escrowContractId) {
  const client = getEscrowClient(undefined, contractId)
  const tx = await client.is_cleared({ participant })
  return tx.result
}

export async function getEscrowParticipants(contractId: string = escrowContractId) {
  const client = getEscrowClient(undefined, contractId)
  const tx = await client.get_participants()
  return tx.result
}
