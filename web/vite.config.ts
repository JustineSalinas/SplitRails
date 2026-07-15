/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    env: {
      VITE_ESCROW_CONTRACT_ID: 'CDENUPG5EBM6ZCTOH7UVJMDHDLS4ZWABMUJFIV42LKEPYVFVPKO2P3IH',
      VITE_ESCROW_WASM_HASH: 'a692db0285872cc85e8af15e2b83fc4f919ba6c7aa18475ac11c91dccfc884ff',
      VITE_SOROBAN_RPC_URL: 'https://soroban-testnet.stellar.org',
      VITE_NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
      VITE_STELLAR_NETWORK: 'TESTNET',
    },
  },
})
