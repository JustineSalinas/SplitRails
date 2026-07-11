# smart-wallet contract — Theodore (HIGHEST RISK)

A Soroban contract account that verifies a **WebAuthn/passkey** signature on-chain (native
secp256r1/ES256 verification), so a fingerprint/FaceID approval authorizes a transaction — replacing
seed phrases. **This is the highest-risk piece and is gated Jul 12** — if it isn't signing a real
testnet tx by EOD, switch to the alternate approval method described in the team's internal build plan.

## Recommended path (don't build from scratch)
1. Clone the **CheesecakeLabs Soroban Smart Wallet PoC** and get it running against testnet **exactly
   as documented first** (Factory + Smart Wallet contract + Express backend + React frontend).
2. Only then strip out what SplitRails doesn't need (recovery flow, multi-passkey). Adapting a working
   thing beats debugging a new one.

References:
- CheesecakeLabs PoC: https://github.com/CheesecakeLabs/soroban-smart-wallet-poc
- Write-up: https://cheesecakelabs.com/blog/building-a-passkey-enabled-smart-wallet-on-the-stellar-network/
- Simpler tutorial (James Bachini): https://github.com/jamesbachini/WebAuthn-Passkey
- Official Stellar Smart Wallets guide: https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets

## The one detail that must be right (not just copied)
For a **transaction** (not sign-in), the WebAuthn challenge must be derived from the Soroban
transaction **simulation itself**, not a random value. That binding is what cryptographically ties the
biometric approval to *this exact settlement* — it's the actual security property the pitch claims.
Treating WebAuthn as login-only quietly breaks that claim.

## Definition of done
- [ ] Passkey creation (wallet creation) on testnet.
- [ ] A transaction-bound signature approves a real escrow settle on testnet.
- [ ] **OR** explicit go/no-go decision logged by Jul 12 EOD (see internal build plan).
