import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemType = "GENERATOR" | "PART";

export interface CartItem {
  id: string;
  itemType: CartItemType;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getItem: (productId: string, itemType: CartItemType) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.itemType === item.itemType
        );

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + item.quantity,
            item.maxStock
          );
          set({
            items: items.map((i) =>
              i.id === existingItem.id ? { ...i, quantity: newQuantity } : i
            ),
          });
        } else {
          const newItem: CartItem = {
            ...item,
            id: `${item.itemType}-${item.productId}-${Date.now()}`,
            quantity: Math.min(item.quantity, item.maxStock),
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.id === id);
        
        if (item) {
          const validQuantity = Math.max(1, Math.min(quantity, item.maxStock));
          set({
            items: items.map((i) =>
              i.id === id ? { ...i, quantity: validQuantity } : i
            ),
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItem: (productId, itemType) => {
        return get().items.find(
          (item) => item.productId === productId && item.itemType === itemType
        );
      },
    }),
    {
      name: "pakautose-cart",
      partialize: (state) => ({ items: state.items }),
      // Sanitize items on load to remove invalid image URLs
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          state.items = state.items.map((item) => ({
            ...item,
            // Only keep images that look like valid image URLs
            image: item.image && isValidImageUrl(item.image) ? item.image : undefined,
          }));
        }
      },
    }
  )
);

// Helper to validate image URLs
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  // Check for common image extensions or CDN patterns
  const imagePatterns = [
    /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i,
    /cloudinary\.com/i,
    /amazonaws\.com/i,
    /unsplash\.com/i,
    /placeholder/i,
    /res\.cloudinary\.com/i,
  ];
  return imagePatterns.some((pattern) => pattern.test(url));
}
