"use client";

import { createContext, useContext, useState } from "react";

/* ===== Types ===== */

export type CartOption = {
  optionId: string;
  value: string;
};

export type CartItem = {
  id: number;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  options: CartOption[];
  notes: string;
  totalPrice: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
};

/* ===== Context ===== */

const CartContext = createContext<CartContextType | null>(null);

/* ===== Provider ===== */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart }}
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
