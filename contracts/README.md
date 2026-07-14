# contracts/ — Soroban smart contracts

**Owner:** Theodore (+ Llarie support). Language: Rust. Platform: Soroban (Stellar smart contracts).

> **First:** install the toolchain via [`../scripts/setup-toolchain.md`](../scripts/setup-toolchain.md)
> and deploy a hello-world to testnet before touching real logic.

## Deployed addresses (testnet) — ⭐ keep in sync with root README
| Contract | Address | Deployed |
|---|---|---|
| escrow | `CCXBJ3ZDLFHO4HZN3ODZTHFLLWAEYELN6V5QMUBNFUS3PBFYLBWSZQVI` | ☑ |
| smart-wallet | `TODO / N/A` | ☐ |

## Layout
- [`escrow/`](escrow/) — the core escrow contract. **This must be 100% real on testnet — no exceptions.**
- [`smart-wallet/`](smart-wallet/) — WebAuthn/passkey smart wallet. Highest risk; gated Jul 12.

## Build & deploy (quick reference)
```bash
# from a contract folder, e.g. contracts/escrow
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/<name>.wasm \
  --source <your-identity> --network testnet
# → prints the C… contract address. Paste it into both README tables above and the root README.
```

## Design guardrails
- Keep it **small**: deposit → per-participant cleared/outstanding tracking → all-cleared-before-release
  → atomic settle → deadline rollback. Nothing more for the hackathon.
- Deployed contracts can't be edited — test carefully before deploy.
- Testnet only. Never mainnet.
