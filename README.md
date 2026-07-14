# SplitRails

**Atomic, biometric-signed expense escrow for cross-border teams — built on Stellar.**

Three freelancers in three countries share one client's bills. Today, one person fronts the whole
cost and spends weeks chasing the others over slow, expensive bank wires. SplitRails replaces that:
one person creates a digital invoice that splits the bill automatically, each partner approves their
portion, the money is held safely by a smart contract until **everyone** has paid, and then it's
released to the vendor all at once — or refunded to everyone if someone doesn't pay in time. Every
step leaves a permanent, tamper-proof paper trail on the Stellar ledger.

> Built for the **APAC Stellar Hackathon** (Rise In × Stellar Development Foundation).

---

## 🔗 Deployed contract (Stellar Testnet)

> **⚠️ SUBMISSION REQUIREMENT — this must be filled in before Jul 15.**
> The final submission requires the deployed contract address in this README.

| Contract | Testnet address | Deployed |
|---|---|---|
| Escrow | `CCXBJ3ZDLFHO4HZN3ODZTHFLLWAEYELN6V5QMUBNFUS3PBFYLBWSZQVI` | ☑ |
| Smart Wallet | `TODO — paste C… address here (or N/A)` | ☐ |

Verify any transaction on [Stellar Expert (testnet)](https://stellar.expert/explorer/testnet).

---

## What's in this repo

| Path | What it is | Owner |
|---|---|---|
| [`contracts/`](contracts/) | Rust/Soroban smart contracts — escrow + smart wallet | Theodore (+ Llarie) |
| [`web/`](web/) | React frontend — invoice, approvals, audit ledger | Earl |
| [`backend/`](backend/) | Optional passkey server + `AnchorAdapter` interface | Llarie |
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
Escrow + smart-wallet contracts (Rust — Theodore) ── deployed to ──► Stellar testnet
      ↕
Anchors (SEP-24/31) — bridge to real-world PHP/VND/IDR bank rails (Llarie, interface only)
```

Full picture: [`docs/architecture/OVERVIEW.md`](docs/architecture/OVERVIEW.md).

## Status

🟡 **In active development** — hackathon sprint, submission **Jul 15**. Testnet only; no mainnet, no
real money.
