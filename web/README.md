# web/ — React frontend

**Owner:** Earl. Node 24 / npm 11 are already installed on the machine.

## Definition of done
- [ ] **Invoice creation** — split a bill across parties, set amounts + deadline + vendor.
- [ ] **Approve & Settle** — per-party approval that signs & submits via the Stellar JS SDK.
      (The current approval method is set in the team's internal build plan; keep this piece modular so
      it can swap without rewriting the flow.)
- [ ] **Settlement status** — shows cleared/outstanding per party, and settled/refunded state.
- [ ] **Audit Ledger** — a list of every action with **live Stellar Expert testnet tx links**. This is
      the visible tamper-proof trail; it's a key pitch moment, don't skip it.

## TODO: scaffold
```bash
# from repo root
npm create vite@latest web -- --template react-ts   # then merge into this folder
cd web && npm install
npm install @stellar/stellar-sdk
npm run dev
```

## Env vars this app expects (create web/.env.local — never commit it)
```
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_ESCROW_CONTRACT_ID=          # paste after Theodore deploys
VITE_STELLAR_EXPERT_BASE=https://stellar.expert/explorer/testnet
```

## References
- Stellar JS SDK: https://stellar.github.io/js-stellar-sdk/
- The React frontend in the CheesecakeLabs PoC is a good starting point for wallet + signing UI.
