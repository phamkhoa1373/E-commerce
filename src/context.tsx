import React, { useState, type ReactNode } from "react";
import { CartContext } from "@/context/cartContext";
import type { ICartItem } from "./models/type";

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentCart, setCurrentCart] = useState<ICartItem[]>([]);

  return (
    <CartContext.Provider value={{ currentCart, setCurrentCart }}>
      {children}
    </CartContext.Provider>
  );
};
