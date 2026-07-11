# escrow contract — Theodore

The core of SplitRails. A neutral smart contract that holds each participant's share and releases to
the vendor **only when everyone has paid** (atomic), or refunds everyone if the deadline passes first.

## Definition of done
- [ ] `deposit` — a participant pays their share into the contract.
- [ ] Per-participant **cleared / outstanding** amounts tracked in contract storage.
- [ ] `settle` — requires all-cleared, then releases the full amount to the vendor address. Atomic:
      all-or-nothing, no half-paid state.
- [ ] `rollback` — if the deadline fires before all-cleared, return each participant's held balance.
- [ ] Deployed to testnet; address recorded in [`../README.md`](../README.md) and the root README.

## Notes
- These are standard Soroban patterns (holding funds, conditional release, multi-signer auth) — see
  the Soroban overview docs. There's no single "expense-splitting escrow" template, so this part is a
  genuine build. Keep it minimal.
- Suggested storage shape: `Map<Address, i128>` for cleared amounts, a target total, a vendor address,
  and a deadline ledger timestamp.

## TODO: scaffold
Run `stellar contract init .` here (per the toolchain guide) to generate `Cargo.toml`, `src/lib.rs`,
and a test module, then replace the sample contract with the escrow logic above.
