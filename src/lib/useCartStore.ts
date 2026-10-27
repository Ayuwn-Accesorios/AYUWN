import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product_id: number;
  product_title: string;
  variant_id: number;
  color_id: number;
  selected_label: string;
  selected_color: string;
  unit_price: number;
  quantity: number;
  img_url: string | null;
  max_stock: number;
}

export type NewCartItem = Omit<CartItem, 'id'>;

interface CartStore {
  cart: CartItem[];
  lastUpdated: number | null;
  addToCart: (item: NewCartItem) => { added: number; requested: number };
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: () => number;
}

const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      lastUpdated: null,

      addToCart: (item) => {
        const state = get();
        const compositeId = `${item.variant_id}-${item.color_id}`;
        const existing = state.cart.find((c) => c.id === compositeId);
        const incomingQty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
        const itemMaxStock = Number.isFinite(item.max_stock) ? item.max_stock : 0;
        const currentQty = existing && Number.isFinite(existing.quantity) ? existing.quantity : 0;
        const room = Math.max(0, itemMaxStock - currentQty);
        const actuallyAdded = Math.min(incomingQty, room);

        if (actuallyAdded <= 0) {
          return { added: 0, requested: incomingQty };
        }

        set((currentState) => {
          const existingIndex = currentState.cart.findIndex((c) => c.id === compositeId);
          let newCart: CartItem[];

          if (existingIndex > -1) {
            const current = currentState.cart[existingIndex];
            newCart = [...currentState.cart];
            newCart[existingIndex] = {
              ...current,
              unit_price: item.unit_price,
              max_stock: itemMaxStock,
              quantity: current.quantity + actuallyAdded,
            };
          } else {
            newCart = [
              ...currentState.cart,
              { ...item, id: compositeId, quantity: actuallyAdded, max_stock: itemMaxStock },
            ];
          }

          return { cart: newCart, lastUpdated: Date.now() };
        });

        return { added: actuallyAdded, requested: incomingQty };
      },

      updateQuantity: (id, delta) => {
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.id === id) {
                const currentQty = Number.isFinite(item.quantity) ? item.quantity : 0;
                const maxStock = Number.isFinite(item.max_stock) ? item.max_stock : 0;
                const newQty = currentQty + delta;

                if (newQty <= 0) return null;
                if (delta > 0 && newQty > maxStock) return item;

                return { ...item, quantity: newQty };
              }
              return item;
            })
            .filter(Boolean) as CartItem[],
          lastUpdated: Date.now(),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
          lastUpdated: Date.now(),
        }));
      },

      clearCart: () => set({ cart: [], lastUpdated: null }),

      itemCount: () =>
        get().cart.reduce((total, item) => total + (Number.isFinite(item.quantity) ? item.quantity : 0), 0),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.cart = (state.cart || []).filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.variant_id === 'number' &&
            typeof item.color_id === 'number' &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0 &&
            Number.isFinite(item.max_stock) &&
            Number.isFinite(item.unit_price)
        );

        if (state.lastUpdated) {
          const now = Date.now();
          if (now - state.lastUpdated > THREE_DAYS_IN_MS) {
            state.clearCart();
          }
        }
      },
    }
  )
);