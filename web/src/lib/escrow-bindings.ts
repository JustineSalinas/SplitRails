import { Buffer } from "buffer";
import {
  Client as ContractClient,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  AssembledTransaction,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  u64,
  i128,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDENUPG5EBM6ZCTOH7UVJMDHDLS4ZWABMUJFIV42LKEPYVFVPKO2P3IH",
  }
} as const

export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"UnknownParticipant"},
  4: {message:"InvalidAmount"},
  5: {message:"SharesDoNotSumToTotal"},
  6: {message:"AlreadyCleared"},
  7: {message:"NotOpen"},
  8: {message:"DeadlineNotReached"}
}

export type Status = {tag: "Open", values: void} | {tag: "Released", values: void} | {tag: "RolledBack", values: void};

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Opens an invoice: vendor, token (USDC SAC), deadline, and each
   * participant's exact share. `total_required` must equal the sum of
   * `shares` — a mismatch means the off-chain split has a rounding bug.
   * `creator` must authorize this call — without it, anyone who knows the
   * (not-yet-initialized) contract ID could front-run the real invoice
   * setup, and since `init` is one-shot that would permanently brick the
   * instance.
   */
  init: ({creator, vendor, token, deadline, total_required, shares}: {creator: string, vendor: string, token: string, deadline: u64, total_required: i128, shares: Array<readonly [string, i128]>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a expire transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Anyone may call this once the deadline has passed. Refunds every
   * participant who had cleared their share.
   */
  expire: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a settle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * A participant deposits their exact required share. Once every share
   * is cleared this fires the release internally, in the same call.
   */
  settle: ({participant}: {participant: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  status: (options?: MethodOptions) => Promise<AssembledTransaction<Status>>

  /**
   * Construct and simulate a get_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_share: ({participant}: {participant: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_totals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_totals: (options?: MethodOptions) => Promise<AssembledTransaction<readonly [i128, i128]>>

  /**
   * Construct and simulate a is_cleared transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Has this specific participant paid their share yet? Lets the
   * frontend/sync worker show "locked vs required" per row without
   * replaying events.
   */
  is_cleared: ({participant}: {participant: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_participants transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The full roster of participant addresses on this invoice, in the
   * order they were passed to `init`. Lets the frontend enumerate rows
   * to query with `get_share`/`is_cleared` instead of needing them
   * hardcoded off-chain.
   */
  get_participants: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  public readonly options: ContractClientOptions;
  constructor(options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAaBPcGVucyBhbiBpbnZvaWNlOiB2ZW5kb3IsIHRva2VuIChVU0RDIFNBQyksIGRlYWRsaW5lLCBhbmQgZWFjaApwYXJ0aWNpcGFudCdzIGV4YWN0IHNoYXJlLiBgdG90YWxfcmVxdWlyZWRgIG11c3QgZXF1YWwgdGhlIHN1bSBvZgpgc2hhcmVzYCDigJQgYSBtaXNtYXRjaCBtZWFucyB0aGUgb2ZmLWNoYWluIHNwbGl0IGhhcyBhIHJvdW5kaW5nIGJ1Zy4KYGNyZWF0b3JgIG11c3QgYXV0aG9yaXplIHRoaXMgY2FsbCDigJQgd2l0aG91dCBpdCwgYW55b25lIHdobyBrbm93cyB0aGUKKG5vdC15ZXQtaW5pdGlhbGl6ZWQpIGNvbnRyYWN0IElEIGNvdWxkIGZyb250LXJ1biB0aGUgcmVhbCBpbnZvaWNlCnNldHVwLCBhbmQgc2luY2UgYGluaXRgIGlzIG9uZS1zaG90IHRoYXQgd291bGQgcGVybWFuZW50bHkgYnJpY2sgdGhlCmluc3RhbmNlLgAAAARpbml0AAAABgAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAZ2ZW5kb3IAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAAAAAA50b3RhbF9yZXF1aXJlZAAAAAAACwAAAAAAAAAGc2hhcmVzAAAAAAPqAAAD7QAAAAIAAAATAAAACwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAGlBbnlvbmUgbWF5IGNhbGwgdGhpcyBvbmNlIHRoZSBkZWFkbGluZSBoYXMgcGFzc2VkLiBSZWZ1bmRzIGV2ZXJ5CnBhcnRpY2lwYW50IHdobyBoYWQgY2xlYXJlZCB0aGVpciBzaGFyZS4AAAAAAAAGZXhwaXJlAAAAAAAAAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAINBIHBhcnRpY2lwYW50IGRlcG9zaXRzIHRoZWlyIGV4YWN0IHJlcXVpcmVkIHNoYXJlLiBPbmNlIGV2ZXJ5IHNoYXJlCmlzIGNsZWFyZWQgdGhpcyBmaXJlcyB0aGUgcmVsZWFzZSBpbnRlcm5hbGx5LCBpbiB0aGUgc2FtZSBjYWxsLgAAAAAGc2V0dGxlAAAAAAABAAAAAAAAAAtwYXJ0aWNpcGFudAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAAAAAAAGc3RhdHVzAAAAAAAAAAAAAQAAB9AAAAAGU3RhdHVzAAA=",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAASVW5rbm93blBhcnRpY2lwYW50AAAAAAADAAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAABAAAAAAAAAAVU2hhcmVzRG9Ob3RTdW1Ub1RvdGFsAAAAAAAABQAAAAAAAAAOQWxyZWFkeUNsZWFyZWQAAAAAAAYAAAAAAAAAB05vdE9wZW4AAAAABwAAAAAAAAASRGVhZGxpbmVOb3RSZWFjaGVkAAAAAAAI",
        "AAAAAgAAAAAAAAAAAAAABlN0YXR1cwAAAAAAAwAAAAAAAAAAAAAABE9wZW4AAAAAAAAAAAAAAAhSZWxlYXNlZAAAAAAAAAAAAAAAClJvbGxlZEJhY2sAAA==",
        "AAAAAAAAAAAAAAAJZ2V0X3NoYXJlAAAAAAAAAQAAAAAAAAALcGFydGljaXBhbnQAAAAAEwAAAAEAAAAL",
        "AAAAAAAAAAAAAAAKZ2V0X3RvdGFscwAAAAAAAAAAAAEAAAPtAAAAAgAAAAsAAAAL",
        "AAAAAAAAAI1IYXMgdGhpcyBzcGVjaWZpYyBwYXJ0aWNpcGFudCBwYWlkIHRoZWlyIHNoYXJlIHlldD8gTGV0cyB0aGUKZnJvbnRlbmQvc3luYyB3b3JrZXIgc2hvdyAibG9ja2VkIHZzIHJlcXVpcmVkIiBwZXIgcm93IHdpdGhvdXQKcmVwbGF5aW5nIGV2ZW50cy4AAAAAAAAKaXNfY2xlYXJlZAAAAAAAAQAAAAAAAAALcGFydGljaXBhbnQAAAAAEwAAAAEAAAAB",
        "AAAAAAAAANdUaGUgZnVsbCByb3N0ZXIgb2YgcGFydGljaXBhbnQgYWRkcmVzc2VzIG9uIHRoaXMgaW52b2ljZSwgaW4gdGhlCm9yZGVyIHRoZXkgd2VyZSBwYXNzZWQgdG8gYGluaXRgLiBMZXRzIHRoZSBmcm9udGVuZCBlbnVtZXJhdGUgcm93cwp0byBxdWVyeSB3aXRoIGBnZXRfc2hhcmVgL2Bpc19jbGVhcmVkYCBpbnN0ZWFkIG9mIG5lZWRpbmcgdGhlbQpoYXJkY29kZWQgb2ZmLWNoYWluLgAAAAAQZ2V0X3BhcnRpY2lwYW50cwAAAAAAAAABAAAD6gAAABM=" ]),
      options
    )
    this.options = options
  }
  public readonly fromJSON = {
    init: this.txFromJSON<Result<void>>,
        expire: this.txFromJSON<Result<void>>,
        settle: this.txFromJSON<Result<void>>,
        status: this.txFromJSON<Status>,
        get_share: this.txFromJSON<i128>,
        get_totals: this.txFromJSON<readonly [i128, i128]>,
        is_cleared: this.txFromJSON<boolean>,
        get_participants: this.txFromJSON<Array<string>>
  }
}