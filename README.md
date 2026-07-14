# SplitRails

**Atomic, transaction-bound expense escrow for cross-border teams — built on Stellar.**

Three freelancers in three countries share one client's bills. Today, one person fronts the whole
cost and spends weeks chasing the others over slow, expensive bank wires. SplitRails replaces that:
one person creates a digital invoice that splits the bill automatically, each partner approves their
portion, the money is held safely by a smart contract until **everyone** has paid, and then it's
released to the vendor all at once — or refunded to everyone if someone doesn't pay in time. Every
step leaves a permanent, tamper-proof paper trail on the Stellar ledger.

> Built for the **APAC Stellar Hackathon** (Rise In × Stellar Development Foundation).

---

## 🔗 Deployed contract (Stellar Testnet)

| Contract | Testnet address | Deployed |
|---|---|---|
| Escrow | `CDENUPG5EBM6ZCTOH7UVJMDHDLS4ZWABMUJFIV42LKEPYVFVPKO2P3IH` | ☑ |
| Smart Wallet | N/A — see note below | ☐ |

Verify any transaction on [Stellar Expert (testnet)](https://stellar.expert/explorer/testnet). Every
settlement in the app links directly to its live testnet transaction from the Audit Ledger.

**On the smart wallet:** the on-chain WebAuthn contract account was out of scope to ship fully this
sprint, so live settlement uses one-tap wallet approval instead — a real signature bound to that
specific transaction, not a generic login. As a technical proof-of-concept, `/passkey-demo` in the
frontend does exercise a real browser passkey (WebAuthn) end-to-end — creating a credential and
producing a signature over a hash of a real escrow transaction, verified client-side — but it is not
wired into the contract account model and does not authorize on-chain actions.

---

## What's in this repo

| Path | What it is | Owner |
|---|---|---|
| [`contracts/`](contracts/) | Rust/Soroban escrow contract (deployed); smart-wallet notes | Theodore (+ Llarie) |
| [`web/`](web/) | React frontend — invoice, approvals, audit ledger | Earl |
| [`backend/`](backend/) | Notes only — passkey server was dropped; `AnchorAdapter` lives in `web/src/lib/anchor.ts` | Llarie |
| [`scripts/`](scripts/) | Setup & deploy helpers — **start with the toolchain guide** | Shared |
| [`docs/`](docs/) | Product pitch + architecture | PM |

## Start here (new to the repo?)

1. **Everyone:** read [`docs/product/PITCH.md`](docs/product/PITCH.md) — you must be able to explain
   SplitRails to a non-technical judge in 20 seconds.
2. **Devs:** install the toolchain via [`scripts/setup-toolchain.md`](scripts/setup-toolchain.md),
   then open your folder's README for your "definition of done."
3. **Team members:** the daily plan, task board, and your "definition of done" live in the team's
   internal build plan (shared in the team drive — not in this repo).

## Architecture (one glance)

```
React frontend (Earl)
      │ uses
Stellar JS SDK ───────────► Horizon (read ledger) + Soroban RPC (call/simulate)
      │
Escrow contract (Rust — Theodore) ── deployed to ──► Stellar testnet
      ↕
Anchors (SEP-24/31) — bridge to real-world PHP/VND/IDR bank rails (Llarie, interface only)
```

Full picture: [`docs/architecture/OVERVIEW.md`](docs/architecture/OVERVIEW.md).

## Status

🟡 **In active development** — hackathon sprint, submission **Jul 15**. Testnet only; no mainnet, no
real money.
