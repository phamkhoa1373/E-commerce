import type { ICartItem } from "@/models/type";
import { createContext } from "react";

type CartContextType = {
  currentCart: ICartItem[];
  setCurrentCart: React.Dispatch<React.SetStateAction<ICartItem[]>>;
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
