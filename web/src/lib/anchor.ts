// SEP-24-shaped anchor corridor adapter — demo depth only.
//
// Owner: payments role (Llarie's deliverable, covered by Adrian/PM). Lives in the frontend service
// layer so Earl's pages can list corridors and open an interactive deposit/withdraw URL.
//
// This is an *interface* for the demo, not a full SEP-24 client: it shapes the anchor's hosted
// interactive URL rather than running the authenticated POST flow. The PHP corridor is wired to a
// testnet anchor; VND/IDR are configured-but-not-wired so the UI can show the corridor list.

export type Corridor = 'PHP' | 'VND' | 'IDR'

export interface AnchorAdapter {
  currency: Corridor
  /** PHP: wired to a testnet sandbox. VND/IDR: configured but not wired for the demo. */
  enabled: boolean
  /** SEP-24-style interactive deposit — returns the anchor's hosted interactive URL. */
  initDeposit(amount: string): Promise<{ interactiveUrl: string }>
  /** SEP-24-style interactive withdraw — returns the anchor's hosted interactive URL. */
  initWithdraw(amount: string): Promise<{ interactiveUrl: string }>
}

// STUB pending the Jul 13 anchor-reachability gate. Replace with the live testnet anchor's
// TRANSFER_SERVER_SEP0024 URL once `curl https://<domain>/.well-known/stellar.toml` confirms it.
const PHP_ANCHOR_TRANSFER_SERVER = 'https://testanchor.stellar.org/sep24'

function makeCorridor(
  currency: Corridor,
  enabled: boolean,
  transferServer: string | null,
): AnchorAdapter {
  async function interactive(kind: 'deposit' | 'withdraw', amount: string) {
    if (!enabled || !transferServer) {
      throw new Error(`${currency} corridor is not enabled for this demo`)
    }
    // SEP-24 hands the user off to a hosted interactive URL to complete the transfer.
    const url = new URL(`${transferServer}/transactions/${kind}/interactive`)
    url.searchParams.set('asset_code', 'USDC')
    url.searchParams.set('amount', amount)
    return { interactiveUrl: url.toString() }
  }

  return {
    currency,
    enabled,
    initDeposit: (amount) => interactive('deposit', amount),
    initWithdraw: (amount) => interactive('withdraw', amount),
  }
}

export const corridors: Record<Corridor, AnchorAdapter> = {
  PHP: makeCorridor('PHP', true, PHP_ANCHOR_TRANSFER_SERVER),
  VND: makeCorridor('VND', false, null),
  IDR: makeCorridor('IDR', false, null),
}

export function getCorridor(currency: Corridor): AnchorAdapter {
  return corridors[currency]
}

export function listCorridors(): AnchorAdapter[] {
  return Object.values(corridors)
}
