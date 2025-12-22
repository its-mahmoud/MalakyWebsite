"use client";

import { createContext, useContext, useState } from "react";

type CartUIContextType = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartUIContext = createContext<CartUIContextType | null>(null);

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <CartUIContext.Provider
      value={{
        open,
        openCart: () => setOpen(true),
        closeCart: () => setOpen(false),
      }}
    >
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) {
    throw new Error("useCartUI must be used inside CartUIProvider");
  }
  return ctx;
}
