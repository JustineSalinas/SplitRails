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
  atomic settlement, with one-tap wallet approval per participant.
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

## Demo script
1. **Setup:** three teammates share one vendor bill — say a $1,850 dinner or a shared AWS invoice.
   One organizer, two other participants, split unevenly by what each actually owes.
2. **Create the invoice:** organizer opens SplitRails, enters the vendor and total, and the app splits
   it into each participant's share. Review screen shows the split balances exactly to the total before
   anything is sent.
3. **Each party approves:** every participant gets a link, connects their wallet, and locks their share
   with one tap — a wallet approval bound to that specific transaction, not a generic login.
4. **Settlement:** once all shares are locked, the contract releases the full amount to the vendor in
   one atomic transaction. Open the Audit Ledger and click through to the live Stellar Expert tx link
   for that settlement — the judges see a real testnet transaction, not a mockup.
5. **Rollback:** show a split where a participant hasn't paid by the deadline — the contract refunds
   everyone who already locked funds instead of releasing early. Same live-link proof on Stellar Expert.
6. **What's live vs. simulated:** the escrow contract, settlement, and rollback are 100% real testnet
   transactions — say so plainly. Wallet approval uses one-tap wallet signing; any UI still in mock
   data (e.g. demo participant avatars/names) should be called out honestly rather than passed off as
   live.
