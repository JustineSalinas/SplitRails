# backend/ — passkey server + AnchorAdapter (optional)

**Owner:** Llarie. Optional — only needed for the passkey/biometric path, where the CheesecakeLabs
PoC uses a small Express backend to relay WebAuthn registration/authentication. Depending on the
approval method the team lands on (see the internal build plan), this may not be needed at all.

## Responsibilities
- [ ] **Passkey relay** (if using the passkey path) — WebAuthn registration/auth endpoints, adapted from the PoC.
- [ ] **`AnchorAdapter` interface** — shaped like a SEP-24 client. PHP corridor pointed at a testnet
      anchor sandbox; VND/IDR as configured-but-not-wired entries in the same interface.

## The AnchorAdapter shape (interface, not a full integration for the demo)
```ts
interface AnchorAdapter {
  currency: 'PHP' | 'VND' | 'IDR';
  enabled: boolean;                 // PHP: true (wired to sandbox); VND/IDR: false (configured only)
  initDeposit(amount: string): Promise<{ interactiveUrl: string }>;   // SEP-24-style
  initWithdraw(amount: string): Promise<{ interactiveUrl: string }>;
}
```

## Do this early
Verify a **testnet anchor sandbox is reachable** by **Jul 13** — availability changes; check the
Stellar anchor directory before committing to one, not on deploy day.

## References
- SEP-24 (interactive deposit/withdraw) and SEP-31 (cross-border) — the standards anchors implement.
- developers.stellar.org anchor section for currently listed testnet anchors.
