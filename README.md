# SplitRails

**Atomic, transaction-bound expense escrow for cross-border teams — built on Stellar.**

Three freelancers in three countries share one client's bills. Today, one person fronts the whole cost and spends weeks chasing the others over slow, expensive bank wires. 

SplitRails replaces that: one person creates a digital invoice that splits the bill automatically, each partner approves their portion, the money is held safely by a smart contract until **everyone** has paid, and then it is released to the vendor all at once — or refunded to everyone if someone doesn't pay in time. Every step leaves a permanent, tamper-proof paper trail on the Stellar ledger.

> Built for the **APAC Stellar Hackathon** (Rise In × Stellar Development Foundation).
> Deployed Live on Stellar Testnet: [splitrails.vercel.app](https://splitrails.vercel.app)

---

## Smart Contract Architecture

Every invoice created gets its own **isolated, sandboxed contract instance** deployed from our on-chain WASM blueprint. This state-isolation guarantees maximum security.

### **On-Chain Contract Functions (`contracts/escrow/src/lib.rs`)**

| Function | Parameters | Description |
|---|---|---|
| **`init`** | `vendor: Address`, `token: Address`, `deadline: u64`, `total_required: i128`, `shares: Map<Address, i128>` | Deploys a new clone and registers the vendor, stablecoin token address, expiration Unix timestamp, total required amount, and per-participant share amounts. |
| **`settle`** | `participant: Address` | Called by a participant to lock their designated share amount in the escrow. Automatically checks if the transaction is still open and not overdue. |
| **`expire`** | None | If the deadline timestamp is reached and the total required amount is not met, any participant can trigger `expire` to automatically refund their locked shares back to their wallet. |

---

## Tech Stack & Integrations

* **Smart Contracts:** Rust & Soroban, compiled to WebAssembly.
* **Frontend:** React (TypeScript) + Vite, styled using a TailwindCSS (v4) glassmorphic system.
* **Biometrics:** WebAuthn API (Face ID, Touch ID, Windows Hello) performing client-side signature generation over simulated transaction hashes, verified using the Web Crypto API.
* **Wallet:** Freighter Extension integration via `@stellar/freighter-api` and `@stellar/stellar-sdk`.
* **General Ledger:** Custom GL Exporter generating structured, cost-center tagged CSVs for **QuickBooks** and **Xero**.

---

## Demo Restrictions & Product Constraints

To review our submission properly, please keep the following hackathon MVP scope constraints in mind:

1. **Freighter Wallet Extension Required:** To interact with the live smart contract, you must be using a desktop browser (Chrome, Firefox, or Brave) with the **Freighter Extension** installed and set to **Testnet**.
2. **Biometric Pre-Flight Check:** The biometric signature is validated client-side via the Web Crypto API as a pre-flight safety gate before the Freighter wallet submits the transaction. On-chain validation of `secp256r1` passkey signatures (Soroban custom account contract) is on our production roadmap.
3. **Anchor Currency Corridors:** The payment UI displays localized off-ramp picker choices (PHP, VND, IDR) utilizing the SEP-24 interactive anchor API architecture. The fiat payout rails behind the anchors are mock implementations.

---

## Step-by-Step Live Walkthrough Flow

To experience the full end-to-end on-chain lifecycle:

1. **Go to New Split (`/new`):** Connect your Freighter wallet. Note that your connected wallet address automatically populates the **Vendor** and first participant address.
2. **Review & Deploy:** Click **Review & Deploy** → **Deploy Escrow & Send**. Approve the Freighter pop-up to initialize the clone contract on the testnet.
3. **Settle Share:** Copy the share link from the success page and navigate to it. Connect your wallet, click **Approve & Settle**, approve the Touch ID/Face ID prompt, and confirm the Freighter transfer.
4. **Audit & Export:** Navigate to the **Audit Ledger** to view the live timeline and click **Export Ledger** to download a GL-tagged CSV.
