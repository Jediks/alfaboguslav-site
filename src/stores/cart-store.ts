import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, PaymentMethod } from "@/types/database";

export interface CartItem {
  productId: string;
  quantity: number;
  brandingLogoUrl?: string;
}

export interface SavedCart {
  id: string;
  name: string;
  items: CartItem[];
  savedAt: string;
}

export interface LocalOrder {
  id: string;
  status: OrderStatus;
  total_estimated_price: number;
  payment_method: PaymentMethod;
  delivery_address: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  branding_logo_url: string | null;
  created_at: string;
  items: { productId: string; quantity: number; price_at_time: number }[];
}

interface CartState {
  items: CartItem[];
  orders: LocalOrder[];
  savedCarts: SavedCart[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: LocalOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  saveCart: (name: string) => void;
  restoreCart: (id: string) => void;
  deleteSavedCart: (id: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      orders: [],
      savedCarts: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      brandingLogoUrl: item.brandingLogoUrl ?? i.brandingLogoUrl,
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        })),
      saveCart: (name) =>
        set((state) => {
          if (state.items.length === 0) return state;
          const saved: SavedCart = {
            id: `cart-${Date.now().toString(36)}`,
            name: name.trim() || new Date().toLocaleString(),
            items: state.items.map((i) => ({ ...i })),
            savedAt: new Date().toISOString(),
          };
          return { savedCarts: [saved, ...state.savedCarts] };
        }),
      restoreCart: (id) =>
        set((state) => {
          const found = state.savedCarts.find((c) => c.id === id);
          if (!found) return state;
          return { items: found.items.map((i) => ({ ...i })) };
        }),
      deleteSavedCart: (id) =>
        set((state) => ({
          savedCarts: state.savedCarts.filter((c) => c.id !== id),
        })),
    }),
    { name: "alpha-boguslav-cart" }
  )
);
