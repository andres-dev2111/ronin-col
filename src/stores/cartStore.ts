import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CatalogProduct } from "@/lib/catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Pick<CatalogProduct, "id" | "title" | "handle" | "images">;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;

  // Computed helpers
  subtotal: () => number;
  totalItems: () => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + parseFloat(i.price.amount) * i.quantity,
          0,
        ),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: "ronin-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
