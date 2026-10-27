'use client';

// ==============================================================================
// KAMINI COLLECTIONS - CLIENT CART CONTEXT & LOCAL STORAGE PERSISTENCE
// ==============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalPaise: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kamini_collections_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    const handleHydrate = () => {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to parse stored cart:', err);
      } finally {
        setIsHydrated(true);
      }
    };

    queueMicrotask(handleHydrate);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.warn('Failed to persist cart:', err);
      }
    }
  }, [items, isHydrated]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      const primaryImage =
        product.images?.find((img) => img.is_primary)?.image_url ||
        product.images?.[0]?.image_url ||
        '/saree.jfif';

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock_quantity);
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty, maxStock: product.stock_quantity } : i
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          pricePaise: product.price_paise,
          compareAtPricePaise: product.compare_at_price_paise,
          imageUrl: primaryImage,
          quantity: Math.min(quantity, product.stock_quantity),
          maxStock: product.stock_quantity,
          fabric: product.fabric,
          color: product.color,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalPaise,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
