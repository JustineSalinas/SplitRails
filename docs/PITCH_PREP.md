# 🚂 SplitRails — Hackathon Pitch & Q&A Prep Guide

This is your master preparation guide for the Rise In × Stellar hackathon pitch. 

---

## 🎨 Brand Design System & Color Guide

SplitRails uses a strict semantic color palette to direct user attention and build trust:

| Token / Layer | Color Code | Application in UI | Presentation Slide Meaning |
|---|---|---|---|
| 🔵 **Brand Gradient** | `linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)` | Organizer badges, progress bars, primary actions | **Stellar USDC & Trust** |
| 🟠 **Action (Urgent)** | `#EA580C` to `#F97316` | Warning counters, pending settle slices | **Needs Action / Time-Critical** |
| 🟢 **Success (Settled)** | `#16A34A` to `#22C55E` | Cleared statuses, receipt lock marks | **Settle Complete / Released** |
| 🔘 **Neutral (Slate)** | `#0F172A` to `#64748B` | Base layout cards, inactive borders | **On-Chain Architecture** |

---

## 🚀 The 3-Step User Journey

Here is the atomic flow of SplitRails, designed to be explained in 45 seconds:

```
[1. SETUP] Organizer inputs total and splits shares.
           └─ Custom GL Tags assigned (Cost Center & Project ID)
[2. ESCROW] isolated clone of Soroban contract is deployed on-chain.
           └─ Trustless custody of USDC contributions
[3. SETTLE] Participants approve biometrically, then sign on-chain.
           ├─ Face ID / Touch ID verifies simulated transaction hash
           └─ Freighter wallet submits USDC settlement on-chain
```

---

## ⏱️ 3-Minute Presentation Script

### **1. The Hook (0:00 - 0:25)**
> *"Three freelancers in three countries share one client's bills. Today, one person fronts the whole cost and spends weeks chasing the others over slow, expensive bank wires. **SplitRails replaces that:** one digital invoice that splits the bill automatically, held safely by a smart contract until everyone has paid, and released to the vendor all at once."*

---

### **2. Setup & Deployment (0:25 - 1:10)**
> *"Let's look at the app. We log in and click **New Split**. We want to split a $4,850.00 AWS bill. The app automatically assigns GL Accounting codes like Cost Center and Project ID."*
> 
> *"At the bottom, our connected wallet is auto-detected as the vendor address, and the testnet USDC contract is pre-loaded. We click **Review & Deploy**."*
> 
> *"This deploys a brand new instance of our Rust escrow contract from the on-chain WASM blueprint. This state isolation ensures that every invoice is fully sandboxed and secure."*

> [!TIP]
> **Slide Concept:** Show a graphic representing isolated, sandboxed smart contracts side-by-side to emphasize security.

---

### **3. Biometric Gate & Pay (1:10 - 2:00)**
> *"Now, a participant opens their pay link. They click **Approve & Settle**."*
> 
> *"Our **Approval Protocol** executes a two-step gate. First: a biometric pre-flight check prompts for Face ID or Touch ID, signing a cryptographic challenge derived from the transaction simulation hash. Second: once verified client-side, the Freighter wallet prompts for a final signature to submit the transaction to the Stellar network."*

> [!IMPORTANT]
> **Key Pitch Line:** *"This is two-factor security: biometric validation of the transaction hash first, then wallet-level signature. It prevents malicious front-running and phishing."*

---

### **4. Audits & Reconciliations (2:00 - 2:45)**
> *"As soon as the transaction lands, our on-chain status tracker updates. Once the last person clears, the contract atomically pays the vendor. If the deadline had missed, the contract would let us withdraw a full refund."*
> 
> *"Finally, the finance team checks the **Audit Ledger**. We see a live timeline of all locks and biometric verifications. With one click, we can export a GL-tagged CSV that imports straight into QuickBooks or Xero, matching our on-chain ledger."*

---

### **5. Closing (2:45 - 3:00)**
> *"No escrow company, no middleman, no trust required. The smart contract is the intermediary. That is SplitRails."*

---

## 💬 14 Judge Q&A Questions & Answers

### **Q1: Why do you deploy a contract instance per invoice instead of one central contract?**
> [!NOTE]
> **Judge Persona:** Smart Contract Auditor / Tech Specialist
* **A:** Security and state isolation. If we used one monolithic contract, a state corruption or rounding bug could lock everyone's funds globally. By using Soroban's factory pattern to deploy isolated clones, each split is sandboxed. If one split expires or has an issue, it has zero impact on the rest of the system.

---

### **Q2: How secure is the passkey pre-flight? What does it actually sign?**
> [!IMPORTANT]
> **Judge Persona:** Security / Cryptography Specialist
* **A:** It's highly secure because it's transaction-bound. Instead of signing a static login string, the passkey signs a SHA-256 hash of the actual simulated escrow transaction. This cryptographically binds their biometric approval to this exact settlement amount and vendor address before it even hits the wallet.

---

### **Q3: What happens if a participant refuses to pay or misses the deadline?**
* **A:** No one's money is trapped. The escrow contract has a strict Unix timestamp deadline set at initialization. If that deadline passes and the total required amount is not met, the contract status shifts, allowing participants to safely call the `expire` function and claim a 100% refund of their locked shares.

---

### **Q4: How do you bridge this to fiat currencies for traditional vendors?**
> [!NOTE]
> **Judge Persona:** Business / Real-World Utility Specialist
* **A:** Through Stellar's SEP-24 Anchor standard. In the payout picker, we demonstrate interactive fiat corridors (PHP, VND, IDR). A vendor doesn't need to know what USDC is—they receive local fiat currency directly in their bank account via the Stellar anchor bridge.

---

### **Q5: How do you handle rounding errors when dividing odd amounts among participants?**
* **A:** Soroban contracts require exact math, and a transaction will reject if the shares don't sum to the total down to the last stroop (7 decimal places). To prevent this, our frontend's `splitEvenly` algorithm calculates splits in integer cents and automatically distributes any remaining fractional cents to the first unlocked participants. This guarantees the shares always equal the total required on-chain.

---

### **Q6: If the passkey is verified client-side, what stops a malicious frontend from bypassing the biometric check?**
<blockquote>

[!WARNING]
**This is a tough question!** Be honest but outline the architecture roadmap.
</blockquote>

* **A:** For this MVP sprint, the biometric signature is verified using the browser's Web Crypto API as a pre-flight security gate. In our production roadmap, the public key generated during passkey registration will be stored on-chain inside a custom Soroban Smart Wallet contract, making the contract verify the signature directly before accepting the payment transaction.

---

### **Q7: How does the contract know if a participant paid? Do they transfer directly to the contract?**
* **A:** Yes. When a participant calls `settle()`, the escrow contract interacts directly with the USDC Stellar Asset Contract (SAC). It pulls the designated share amount from the participant's address and deposits it into the escrow contract's own address. If the transfer succeeds, the contract updates their status to `cleared` in its internal state.

---

### **Q8: Why is this better than Splitwise or traditional corporate card expense managers?**
* **A:** Traditional tools like Splitwise only log IOUs—they don't settle them. Card managers require one employee to front 100% of the cost on their card and wait weeks for reimbursement. SplitRails settles payment atomically: no one has to front the money, funds are held trustlessly in escrow, and the vendor gets paid only when everyone has contributed.

---

### **Q9: How does the app scale for large organizations with hundreds of shared invoices?**
* **A:** Every invoice has its own isolated contract deployment. State lookups are decentralized, and the Dashboard aggregates status updates asynchronously. Furthermore, the cost-center tags match standard General Ledger formatting, allowing finance departments to export and reconcile hundreds of splits instantly via CSV.

---

### **Q10: What are the transaction fees (gas) like for deploying a new contract per invoice?**
* **A:** On Stellar, fees are extremely low—typically less than a fraction of a cent ($0.00001 XLM per transaction). Even deploying a new contract instance costs negligible network fees, making the isolated contract architecture highly cost-effective compared to Ethereum or other L1s.

---

### **Q11: What happens if a participant pays, the invoice expires, and they forget to claim their refund?**
* **A:** The funds are never lost. The contract stores the balances securely until a refund is requested. Any participant or the organizer can trigger the `expire()` function at any point after the deadline, which immediately executes the refunds back to the respective contributors' wallets.

---

### **Q12: How does SplitRails handle privacy? Can anyone see our company's shared bills on the ledger?**
* **A:** Because it is built on a public ledger, contract interactions are visible. However, the contract only stores public keys, share amounts, and statuses. Sensitive business data—like participant email addresses and itemized line-item descriptions—remains strictly off-chain in local storage or the company's internal database.

---

### **Q13: Are participants required to have XLM to pay network fees, or is there gasless sponsorship?**
* **A:** For this testnet demo, participants sign transactions using their own Freighter wallet (which requires a tiny amount of testnet XLM for fees). For production, we can utilize Stellar's fee-sponsorship feature, allowing the company organizer to sponsor all transaction fees so employees have a completely gasless experience.

---

### **Q14: What is your go-to-market strategy? Who is the ideal customer?**
* **A:** Our initial target customers are remote-first Web3 startups, DAO contributors, and cross-border digital agencies. These groups already utilize wallets and stablecoins, frequently split shared tools (like AWS, Figma, and GitHub), and suffer the most from slow, expensive international wire transfers.
