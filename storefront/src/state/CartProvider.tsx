import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PRODUCTS } from '../data/products';
import {
  addToCart,
  loadCart,
  removeLine,
  saveCart,
  totalAmount,
  totalQuantity,
  updateQuantity,
  type CartItemRef,
  type CartLine,
} from '../domain/cart';
import { generateOrderNumber } from '../domain/order';
import { CartContext, type CartContextValue } from './cartContext';

/**
 * localStorage を取り出す。プライベートモードやサイトデータのブロックで
 * アクセス自体が例外になることがあるので、そのときは保存なしで動かす。
 */
function getStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('localStorage を使えないため、カートは再読み込みで消えます。', error);
    return undefined;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart(getStorage(), PRODUCTS));
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  // カートが変わるたびに保存する（中身の 4 項目だけ。配送先は保存しない: NFR-2）
  useEffect(() => {
    saveCart(getStorage(), lines);
  }, [lines]);

  const addItem = useCallback(
    (item: CartItemRef) => {
      const result = addToCart(lines, item);
      if (result.ok) setLines(result.lines);
      return result.ok;
    },
    [lines],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) => updateQuantity(current, key, quantity));
  }, []);

  const removeItem = useCallback((key: string) => {
    setLines((current) => removeLine(current, key));
  }, []);

  const placeOrder = useCallback(() => {
    const orderNumber = generateOrderNumber();
    setLastOrderNumber(orderNumber);
    setLines([]);
    return orderNumber;
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totalQuantity: totalQuantity(lines),
      totalAmount: totalAmount(lines, PRODUCTS),
      addItem,
      setQuantity,
      removeItem,
      placeOrder,
      lastOrderNumber,
    }),
    [lines, addItem, setQuantity, removeItem, placeOrder, lastOrderNumber],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
