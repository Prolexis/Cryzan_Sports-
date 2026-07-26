import { create } from 'zustand';

export interface CartItem {
  id: string; // CartItem ID
  productVariantId: string;
  productId: string;
  name: string;
  price: number;
  priceSnapshot: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  weightGrams: number;
  volumeCm3: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  savedForLater: CartItem[];
  totalPrice: number;
  shippingCost: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (item: string | { id: string; name?: string; price?: number; image?: string }, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  saveForLater: (cartItemId: string) => Promise<void>;
  moveToCart: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  savedForLater: [],
  totalPrice: 0,
  shippingCost: 0,
  loading: false,
  error: null,
  isDrawerOpen: false,
  setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error('Error al cargar el carrito');
      const data = await res.json();
      set({
        items: data.items || [],
        savedForLater: data.savedForLater || [],
        totalPrice: data.totalPrice || 0,
        shippingCost: data.shippingCost || 0,
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (item: string | { id: string }, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const isString = typeof item === 'string';
      const body = {
        productVariantId: isString ? item : undefined,
        productId: !isString ? item.id : undefined,
        quantity,
      };

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al agregar al carrito');
      }
      await get().fetchCart();
      set({ isDrawerOpen: true });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (cartItemId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/cart/item', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });
      if (!res.ok) throw new Error('Error al eliminar el artículo');
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await get().removeItem(cartItemId);
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/cart/item', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar la cantidad');
      }
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  saveForLater: async (cartItemId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/cart/save-for-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, toStatus: 'SAVED_FOR_LATER' }),
      });
      if (!res.ok) throw new Error('Error al guardar para después');
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  moveToCart: async (cartItemId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/cart/save-for-later', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, toStatus: 'ACTIVE' }),
      });
      if (!res.ok) throw new Error('Error al mover al carrito');
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  clearCart: () => {
    // Local clear for UI responsive feel
    set({ items: [], totalPrice: 0, shippingCost: 0 });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));
