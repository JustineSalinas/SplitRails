# backend/ — passkey server (Dropped)

**Owner:** Llarie.

> [!NOTE]
> **Passkey relay has been dropped** (Jul 13 NO-GO, see `GATE-DECISIONS.md`).
> The `AnchorAdapter` has been moved to the frontend service layer at [anchor.ts](file:///Users/llariesalinas/development/SplitRails/web/src/lib/anchor.ts) to allow direct listing of corridors and loading of interactive deposit/withdraw URLs.
> As a result, no backend service is required for the hackathon demo.

## Historical Context & Design Decisions
- **Passkey relay:** Originally planned to relay WebAuthn registration/authentication using a small Express backend (adapted from the CheesecakeLabs PoC). This was dropped per the July 13 decision gate.
- **`AnchorAdapter` interface:** Moved to `web/src/lib/anchor.ts`. It acts as a client-side interface for the demo (simulating SEP-24 interactive flows) rather than running a full backend integration. PHP, VND, and IDR corridors are all wired to a live testnet sandbox.

## References
- [web/src/lib/anchor.ts](file:///Users/llariesalinas/development/SplitRails/web/src/lib/anchor.ts) — Current location of the `AnchorAdapter` implementation.
- SEP-24 (interactive deposit/withdraw) and SEP-31 (cross-border) standards.

