# Pitch

If you can't explain the paragraph below to a non-technical judge in 20 seconds, stop and re-read it
before writing code. The judges evaluate a **story** — problem → solution → proof it works → why it
matters — as much as the code.

## The 20-second version
> Three freelancers in three countries share one client's bills — one AWS account, one design tool,
> one API bill, split unevenly. Today one person fronts it all and chases the others for weeks over
> slow, 3–5% bank wires. **SplitRails** lets one person create a digital invoice that splits the bill,
> each partner approves their share with a tap, a smart contract holds the money until *everyone* has
> paid, then releases it to the vendor all at once — or refunds everyone if someone doesn't pay in
> time. Every step is a permanent, tamper-proof record.

## Problem → Solution → Proof → Why it matters
- **Problem:** multi-party, cross-border team payments are slow, expensive, and require one person to
  trust the others with real money up front.
- **Solution:** a neutral smart contract (not a person) holds funds and enforces "all or nothing"
  atomic settlement, with biometric/one-tap approval per participant.
- **Proof (the demo):** create invoice → each party approves → funds settle to vendor on testnet →
  show the live transaction on Stellar Expert. Then show the rollback path (a party doesn't pay →
  everyone refunded).
- **Why it matters:** it disrupts one painful, specific slice of cross-border payments (small-to-mid
  multi-party team bills) — not a "blockchain is decentralized so…" pitch, a concrete money problem.

## Where SplitRails sits
- **B2B fintech / expense management** — the Splitwise / QuickBooks / Expensify world ("who owes what,
  and how do we prove it"). These are competitors *and* potential integration partners.
- **Cross-border payments** — SWIFT wires, remittances, FX. SplitRails targets one use case, doesn't
  replace the whole thing.
- **Stellar / crypto payments infrastructure** — the technology layer, purpose-built for payments.

Knowing which of these three a judge's question belongs to helps you answer it precisely.

## Demo script (fill in as the build firms up)
1. _[Setup: who the three parties are, what bill they're splitting.]_
2. _[Create the invoice — show the split.]_
3. _[Each party approves — show the auth method actually used.]_
4. _[Settlement — show the vendor paid + the live Stellar Expert tx link.]_
5. _[Rollback — show the refund path.]_
6. _[One line on what's live vs. simulated-for-time, stated honestly.]_
