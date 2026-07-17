# SplitRails Live Demo Transactions Cheatsheet

This document outlines the actual on-chain transaction hashes, contract addresses, and operations executed on the Stellar Testnet during the SplitRails demo flow. Use this as a reference script/cheatsheet when recording your demo video to showcase the real blockchain validation occurring under the hood.

---

## 🔑 Key Addresses & Contracts

| Entity | Address / ID | Role in Demo |
|---|---|---|
| **Your Wallet** | `GADEOEKSVARYURMLWJ4NTATTD66AO733MA3DNI33RS7VFS7IFCBEMGWN` | Payer & Organizer (Riya) |
| **Escrow Contract Instance** | `CD5YYLXK3VH3AKQAMTUYVOYDM34E4IQM7CMKGTGKYKIQW7SMFBGLGNBM` | Isolated smart contract instance deployed dynamically to hold the funds |
| **USDC Token Contract (SAC)** | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` | Token contract wrapper representing official testnet USDC (Issuer: `GBBD47IF...`) |

---

## 🚂 The 3-Step On-Chain Journey

Below is the chronological order of the transactions that were executed, including their ledger numbers, timestamps, and Explorer links.

### Step 1: Deploy Escrow Contract Instance
* **What happened:** Clicking **Review & Deploy** dynamically instantiated a fresh clone contract sandbox from the pre-installed WASM blueprint on testnet, ensuring state isolation.
* **Transaction Hash:** `2bdb61b94f35a829f878fd343653957207e4a058471a733930e16432bd4cb819`
* **Ledger Number:** `3658982`
* **Timestamp:** `2026-07-17 18:12:44 UTC`
* **Explorer Link:** [Stellar.expert Deployment Tx](https://stellar.expert/explorer/testnet/tx/2bdb61b94f35a829f878fd343653957207e4a058471a733930e16432bd4cb819)
* **Resulting Contract ID:** `CD5YYLXK3VH3AKQAMTUYVOYDM34E4IQM7CMKGTGKYKIQW7SMFBGLGNBM`

---

### Step 2: Initialize Escrow Contract (`init`)
* **What happened:** Instantly following the deployment, the app invoked the `init` function of the contract to register the split's details.
  * **Vendor:** `GADEOEKS...`
  * **Token Contract:** `CBIELTK6...` (Official USDC)
  * **Total Required:** `$50.00` (`500,000,000` stroops)
  * **Roster of Shares:** 4 participants at `$12.50` (`125,000,000` stroops) each.
* **Transaction Hash:** `fd11f9c9248465a4e4c3c5110151069340a42b4037427b88e4fc920f20fedeef`
* **Ledger Number:** `3658984`
* **Timestamp:** `2026-07-17 18:12:55 UTC`
* **Explorer Link:** [Stellar.expert Initialization Tx](https://stellar.expert/explorer/testnet/tx/fd11f9c9248465a4e4c3c5110151069340a42b4037427b88e4fc920f20fedeef)

---

### Step 3: Approve & Settle (`settle`)
* **What happened:** Riya opened the payment link, verified client-side via Face ID/Touch ID, and signed the transaction using Freighter. The contract transferred `$12.50` USDC from her wallet to the escrow's custody.
* **Transaction Hash:** `45809738e59405f978a03da4fb2360b3bf0614fe6fdfc09612857b4458f18825`
* **Ledger Number:** `3658996`
* **Timestamp:** `2026-07-17 18:13:55 UTC`
* **Explorer Link:** [Stellar.expert Settlement Tx](https://stellar.expert/explorer/testnet/tx/45809738e59405f978a03da4fb2360b3bf0614fe6fdfc09612857b4458f18825)

---

## 📹 Notes for the Demo Video Voiceover

When recording the screen capture, you can use these talking points to highlight the security and architecture of SplitRails:

1. **"Dynamic Security" (During Step 1/2):**
   * *Voiceover script:* *"Instead of dumping all transactions into a single pool, SplitRails deploys an isolated, sandboxed smart contract instance specifically for this invoice. You can see the Freighter popup prompting us to authorize the creation of contract `CD5YY...` and initialize it with our specific USDC rules."*
2. **"Passkey Pre-Flight Gate" (During Step 3):**
   * *Voiceover script:* *"Before submitting the settlement transaction to the ledger, SplitRails triggers a WebAuthn pre-flight check. This secures the transaction with Face ID/Touch ID, binding the signature to this specific settlement hash before Freighter initiates the transfer."*
3. **"Trustless Custody" (After Step 3):**
   * *Voiceover script:* *"Once settled, the $12.50 USDC is held in trustless escrow under the contract's address. If all participants settle, the funds are automatically released to the vendor. If the deadline expires and the split isn't complete, any participant can trigger the `expire` function to get a full refund directly back to their wallet."*
