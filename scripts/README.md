# scripts/ — setup & deploy helpers

Shared helper scripts and setup guides for the team.

## Files
- **[setup-toolchain.md](setup-toolchain.md)** — ⭐ **start here.** Install Rust + Stellar CLI, create a
  funded testnet identity, deploy a hello-world. Every dev runs this on Jul 11.

## To add as the build firms up
- `deploy-escrow.ps1` / `.sh` — one-command build + deploy of the escrow contract to testnet, echoing
  the resulting address to paste into the READMEs.
- `fund.ps1` — top up a testnet identity from friendbot.
- `seed-demo.ps1` — set up the three demo participants + a sample invoice for the walkthrough.

Keep these thin — they exist to make the demo repeatable, not to be production infra.
