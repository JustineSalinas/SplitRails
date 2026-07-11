# Toolchain setup — do this FIRST (Jul 11)

Goal: every dev can build and deploy a Soroban contract to testnet **today**. This removes the #1
blocker (Rust/Stellar CLI aren't installed yet). If anyone can't finish this by end of Jul 11, that's
the signal to simplify scope — flag it to the PM.

Commands below are for **Windows (PowerShell)**, matching this team's machines. Theodore & Llarie need
all of it; Earl only needs Node (already installed) but can do this too to deploy hello-world.

---

## 1. Install Rust
Download and run the installer from https://rustup.rs (or via winget):
```powershell
winget install --id Rustlang.Rustup -e
```
Close and reopen PowerShell, then verify + add the WebAssembly target Soroban compiles to:
```powershell
rustc --version
rustup target add wasm32v1-none
```
> Note: on older Rust/CLI combos the target is `wasm32-unknown-unknown`. If `stellar contract build`
> complains about the target, add that one too: `rustup target add wasm32-unknown-unknown`.

## 2. Install the Stellar CLI
```powershell
winget install --id Stellar.StellarCLI -e
# or, if you prefer cargo (slower): cargo install --locked stellar-cli
stellar --version
```

## 3. Create & fund a testnet identity
```powershell
stellar keys generate --global alice --network testnet --fund
stellar keys address alice
```
This creates a testnet keypair named `alice` and funds it with test XLM from friendbot. (Use your own
name instead of `alice`.) **Testnet only — never put a real/mainnet key here.**

## 4. Deploy a hello-world (the Jul 9 checkpoint — do it today)
```powershell
# make a scratch project OUTSIDE the repo, or in a temp folder
stellar contract init hello-soroban
cd hello-soroban
stellar contract build
stellar contract deploy `
  --wasm target/wasm32v1-none/release/hello_world.wasm `
  --source alice --network testnet
```
The deploy prints a `C…` contract address. Invoke it to confirm it's live:
```powershell
stellar contract invoke --id <C...address> --source alice --network testnet -- hello --to World
# → ["Hello", "World"]
```

## 5. You're unblocked ✅
When you see `["Hello","World"]` back from testnet, your toolchain works end-to-end. Report it in the
morning standup (tracked in the team's internal task board). Real contract work starts in
[`../contracts/`](../contracts/).

---

### Troubleshooting
- **`stellar` not found after install** → reopen the terminal so PATH refreshes.
- **build fails on wasm target** → run both `rustup target add` lines in step 1.
- **deploy fails "account not found"** → the identity wasn't funded; re-run step 3 with `--fund`, or
  fund the address at https://friendbot.stellar.org.
- **Docs:** CLI install — https://developers.stellar.org/docs/tools/cli/install-cli ·
  Soroban overview — https://developers.stellar.org/docs/build/smart-contracts/overview
