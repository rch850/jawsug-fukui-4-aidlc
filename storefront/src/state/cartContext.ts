import { createContext, useContext } from 'react';
import type { CartItemRef, CartLine } from '../domain/cart';

export type CartContextValue = {
  lines: readonly CartLine[];
  /** ヘッダーのカート件数（数量の合計） */
  totalQuantity: number;
  /** 合計金額（税込） */
  totalAmount: number;
  /** 1 個追加する。上限 10 個で追加できなかったときは false */
  addItem: (item: CartItemRef) => boolean;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  /** 注文を確定する。注文番号を作ってカートを空にし、注文番号を返す */
  placeOrder: () => string;
  /** 直前に確定した注文番号。React の状態にだけ持ち、ブラウザには保存しない */
  lastOrderNumber: string | null;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error('useCart は CartProvider の内側で使ってください');
  }
  return value;
}
