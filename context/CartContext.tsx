"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* ===== Types ===== */

export type CartOption = {
  optionId: string;
  value: string;
  label: string;

};

export type CartItem = {
  id: number;
  mealId: number;
  name: string;
  image: string;
  quantity: number;
  options: CartOption[];
  notes: string;

  basePrice: number;
  optionsPrice: number;
  unitPrice: number;
  totalPrice: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id" | "unitPrice" | "totalPrice">) => void;
  updateQuantity: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
};

/* ===== Context ===== */

const CartContext = createContext<CartContextType | null>(null);

/* ===== Helpers ===== */

const normalizeOptions = (options: CartOption[]) =>
  [...options].sort((a, b) =>
    (a.optionId + a.value).localeCompare(b.optionId + b.value)
  );

const optionsKey = (options: CartOption[]) =>
  JSON.stringify(normalizeOptions(options));

/* ===== Provider ===== */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  /* ===== Add / Merge ===== */
  const addToCart = (
    item: Omit<CartItem, "id" | "unitPrice" | "totalPrice">
  ) => {
    const base = Number(item.basePrice) || 0;
    const options = Number(item.optionsPrice) || 0;
    const qty = Number(item.quantity) || 1;

    const unitPrice = base + options;

    setItems((prev) => {
      const key = optionsKey(item.options);

      const existingIndex = prev.findIndex(
        (p) =>
          p.mealId === item.mealId &&
          p.notes === item.notes &&
          optionsKey(p.options) === key
      );

      if (existingIndex !== -1) {
        const copy = [...prev];
        const existing = copy[existingIndex];

        const newQty = existing.quantity + qty;

        copy[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: existing.unitPrice * newQty,
        };

        return copy;
      }

      return [
        {
          ...item,
          id: Date.now(),
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        },
        ...prev,
      ];
    });
  };

  /* ===== Quantity Control ===== */
  const updateQuantity = (id: number, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, qty),
              totalPrice: item.unitPrice * Math.max(1, qty),
            }
          : item
      )
    );
  };

  /* ===== Persist ===== */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const removeFromCart = (id: number) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ===== Hook ===== */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
