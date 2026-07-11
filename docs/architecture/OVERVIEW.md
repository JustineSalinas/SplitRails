# Architecture overview

Everything in this repo is *how* we build SplitRails, not *what* it is. The "what" is in
[../product/PITCH.md](../product/PITCH.md).

## The stack, and how the pieces fit

```
Your React frontend (Earl)
        │ uses
Stellar JS SDK ───────────────► Horizon (query/read the ledger)
        │                        and Soroban RPC (call/simulate contracts)
Escrow + smart-wallet contracts (Rust — Theodore)
        │ deployed to
The Stellar network (testnet during the hackathon)
        ↕
Anchors (SEP-24/31) — the bridge to real-world PHP/VND/IDR bank rails (Llarie, interface only)
```

## What each layer does
- **Frontend (React, Earl):** creates invoices, collects per-party approvals, shows settlement status
  and an Audit Ledger with live [Stellar Expert](https://stellar.expert/explorer/testnet) tx links.
- **Stellar JS SDK:** the frontend's connection to the chain — reads via Horizon, calls/simulates
  contracts via Soroban RPC.
- **Escrow contract (Rust/Soroban, Theodore):** holds funds, tracks per-participant cleared/outstanding
  balances, releases to the vendor only when all-cleared (atomic settlement), and rolls back (refunds
  everyone) if the deadline fires first.
- **Smart-wallet contract (Rust/Soroban, Theodore):** binds a WebAuthn/passkey approval to a *specific*
  transaction. This is the highest-risk piece; the approval method is kept swappable by design.
- **Anchors (Llarie):** the on/off-ramp between USDC and real bank currency. For the hackathon this is
  an `AnchorAdapter` **interface** shaped like a SEP-24 client — PHP corridor pointed at a testnet
  sandbox, VND/IDR configured-but-not-wired.

## Key facts that shape design decisions
- **The ledger is public and permanent.** No admin panel to quietly fix a mistake — this is *why* the
  escrow pitch is trustworthy (not even our team can move held funds).
- **Deployed contracts generally can't be edited.** So the escrow logic must be small and carefully
  tested before deploy. Resist scope creep.
- **Every action costs a tiny fee and must be signed.** That's the entire reason wallets and biometric
  signing exist — something must prove *you* authorized *this specific action*.
- **Testnet exists to be reckless on.** Fake money, resets periodically. The answer to "am I on
  testnet?" should always be yes until the hackathon is over. **Never touch mainnet.**

## Tools worth knowing by name
- **Stellar CLI** — build/deploy contracts.
- **Stellar Laboratory** (lab.stellar.org) — test calls without writing code.
- **Stellar Expert** — block explorer; look up any testnet tx hash. Powers the Audit Ledger's live links.
