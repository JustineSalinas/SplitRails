# web/ — React frontend

React + Vite + TypeScript frontend for SplitRails, talking to the Soroban escrow contract in
`contracts/escrow` over the Stellar JS SDK, signed via the Freighter wallet extension.

## Setup

```bash
cd web
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

## Env vars (`web/.env` — gitignored, never commit real values)

```
VITE_ESCROW_CONTRACT_ID=      # a deployed escrow contract instance (see contracts/escrow)
VITE_ESCROW_WASM_HASH=        # the wasm hash from `stellar contract upload` — used to deploy new invoices
VITE_STELLAR_NETWORK=TESTNET
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_STELLAR_EXPERT_BASE=https://stellar.expert/explorer/testnet
```

## Architecture: one contract instance per invoice

The escrow contract's `init()` is one-shot — a given deployed instance only ever supports a
single invoice for its whole lifetime. Rather than reuse one fixed contract for every split
(which would make the second invoice ever created fail outright), every new split deploys its
own fresh instance from the same installed wasm (`VITE_ESCROW_WASM_HASH`) via Soroban's
"factory" pattern — see `deployEscrowInstance()` in `src/lib/escrow.ts`.

- `src/lib/invoiceRegistry.ts` — a local (per-browser) record of every invoice this browser has
  created, since there's no on-chain "list all my invoices" query. Powers the Dashboard's list
  of real created splits.
- Routes that read a specific invoice's on-chain state accept an optional `:contractId` param
  (`/pay/:contractId`, `/audit/:contractId`, `/audit-ledger/:contractId`, `/finance/:contractId`).
  The bare route (no param) falls back to `VITE_ESCROW_CONTRACT_ID`, which is what the
  Dashboard's built-in demo cards point at.
- `src/lib/txLog.ts` tags every logged on-chain action with the contract ID it belongs to, so
  one invoice's Audit Ledger never shows another invoice's activity.

## Redeploying the contract

If you need a fresh wasm (e.g. after a contract code change):

```bash
cd contracts/escrow
stellar contract build
stellar contract upload --wasm target/wasm32v1-none/release/escrow.wasm --source-account <your-identity> --network testnet
# paste the printed hash into VITE_ESCROW_WASM_HASH
```

New invoices immediately start deploying instances from the new hash — no redeploy of the
frontend's fixed demo contract (`VITE_ESCROW_CONTRACT_ID`) is required unless you want the
Dashboard's built-in demo cards to point at a new instance too, in which case also run:

```bash
stellar contract deploy --wasm-hash <hash> --source-account <your-identity> --network testnet
# paste the printed contract ID into VITE_ESCROW_CONTRACT_ID
```

## Testing

```bash
npm test        # vitest — unit tests for lib/ (amounts, anchor, txLog, invoiceRegistry, glExport, wallet)
npm run lint
npm run build   # tsc -b && vite build
```

## Key features

- **Invoice creation** (`SplitCreator` → `ReviewSplit`) — form-based split creation with
  percent/exact-dollar modes, deploying + initializing a live escrow contract.
- **Approve & Settle** (`PaySlice`) — WebAuthn passkey approval gate, then Freighter-signed
  on-chain settlement. Includes a USDC/PHP/VND/IDR payout picker with a live SEP-24 hand-off
  to the PHP testnet anchor (VND/IDR are configured but not wired to a live anchor).
- **Audit Ledger** (`AuditLedger`) — live on-chain totals, participant status, tx-linked
  activity, burn-rate/variance, and a GL-tagged CSV export built from live contract state.
- **Finance** (`Finance`) — the same live CSV export as its own dedicated view, plus an
  explicitly labeled roadmap section (QuickBooks/Xero/NetSuite sync, approval roles) that is
  not implemented.

## References

- Stellar JS SDK: https://stellar.github.io/js-stellar-sdk/
- Soroban contract client docs: https://developers.stellar.org/docs/build/guides/dapps/frontend-guide
