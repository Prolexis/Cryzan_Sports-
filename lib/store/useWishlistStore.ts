import { create } from 'zustand';

interface WishlistItem {
  id: string;
  productId: string;
  variantId: string | null;
  priceAtAdd: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
  variant?: {
    id: string;
    size: string;
    color: string | null;
    stock: number;
  } | null;
  createdAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  shareId: string | null;
  loading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string, variantId?: string | null) => Promise<void>;
  moveToCart: (wishlistId: string) => Promise<void>;
  isInWishlist: (productId: string, variantId?: string | null) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  shareId: null,
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/wishlist');
      if (!res.ok) {
        if (res.status === 401) {
          // Unauthenticated user: clear favorites silently
          set({ items: [], shareId: null, loading: false });
          return;
        }
        throw new Error('Error al obtener lista de favoritos');
      }
      const data = await res.json();
      set({ items: data.items || [], shareId: data.shareId || null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId: string, variantId: string | null = null) => {
    const previousItems = get().items;
    const isTargetInWishlist = previousItems.some(
      (item) => item.productId === productId && item.variantId === variantId
    );

    // Optimistic Update
    if (isTargetInWishlist) {
      set({
        items: previousItems.filter(
          (item) => !(item.productId === productId && item.variantId === variantId)
        ),
      });
    } else {
      // Mock an optimistic item before fetch finishes
      const mockItem: WishlistItem = {
        id: `temp_${Date.now()}`,
        productId,
        variantId,
        priceAtAdd: 0,
        product: {
          id: productId,
          name: '',
          slug: '',
          price: 0,
          image: '',
          stock: 0,
        },
        createdAt: new Date().toISOString(),
      };
      set({ items: [mockItem, ...previousItems] });
    }

    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId }),
      });

      if (!res.ok) {
        throw new Error('No se pudo actualizar favoritos');
      }

      // Refresh list to sync correct database states
      await get().fetchWishlist();
    } catch (err: any) {
      // Rollback on error
      set({ items: previousItems, error: err.message });
    }
  },

  moveToCart: async (wishlistId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/wishlist/move-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlistId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al mover al carrito');
      }

      // Remove item from state
      set({
        items: get().items.filter((item) => item.id !== wishlistId),
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  isInWishlist: (productId: string, variantId: string | null = null) => {
    return get().items.some(
      (item) =>
        item.productId === productId &&
        (variantId === null ? true : item.variantId === variantId)
    );
  },
}));
