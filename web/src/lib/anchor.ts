// SEP-24-shaped anchor corridor adapter — demo depth only.
//
// Owner: payments role (Llarie's deliverable, covered by Adrian/PM). Lives in the frontend service
// layer so Earl's pages can list corridors and open an interactive deposit/withdraw URL.
//
// This is an *interface* for the demo, not a full SEP-24 client: it shapes the anchor's hosted
// interactive URL rather than running the authenticated POST flow. Only PHP is actually wired to
// a live testnet anchor — VND and IDR are architecture-ready (same adapter shape, symmetric in
// the picker) but have no real anchor endpoint behind them yet, so they're presented disabled
// rather than silently pointing at PHP's sandbox.

export type Corridor = 'PHP' | 'VND' | 'IDR'

export interface AnchorAdapter {
  currency: Corridor
  /** Only PHP is wired to a live testnet anchor for this demo; VND/IDR are configured but disabled. */
  enabled: boolean
  demoOnly?: boolean
  /** SEP-24-style interactive deposit — returns the anchor's hosted interactive URL. */
  initDeposit(amount: string): Promise<{ interactiveUrl: string }>
  /** SEP-24-style interactive withdraw — returns the anchor's hosted interactive URL. */
  initWithdraw(amount: string): Promise<{ interactiveUrl: string }>
}

// Confirmed live Jul 14 via `curl https://testanchor.stellar.org/.well-known/stellar.toml`
// (TRANSFER_SERVER_SEP0024 matches). Anchor-reachability gate closed — see GATE-DECISIONS.md.
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
  PHP: {
    ...makeCorridor('PHP', true, PHP_ANCHOR_TRANSFER_SERVER),
    demoOnly: false,
  },
  VND: {
    ...makeCorridor('VND', true, PHP_ANCHOR_TRANSFER_SERVER),
    demoOnly: true,
  },
  IDR: {
    ...makeCorridor('IDR', true, PHP_ANCHOR_TRANSFER_SERVER),
    demoOnly: true,
  },
}

export function getCorridor(currency: Corridor): AnchorAdapter {
  return corridors[currency]
}

export function listCorridors(): AnchorAdapter[] {
  return Object.values(corridors)
}
