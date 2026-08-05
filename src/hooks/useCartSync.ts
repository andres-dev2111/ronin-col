/**
 * useCartSync — previously synced cart with Shopify.
 * Cart is now local-only (Zustand + localStorage), so no sync needed.
 * This hook is kept as a no-op to avoid breaking imports elsewhere.
 */
export function useCartSync() {
  // No-op: cart state lives in localStorage via Zustand persist middleware.
  // No server sync required.
}
