import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

function readStoredItems() {
  try {
    const storedItems = localStorage.getItem("frulex_cart");
    return storedItems ? JSON.parse(storedItems) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredItems);

  useEffect(() => {
    localStorage.setItem("frulex_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    setItems((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) => item.id === product.id
          ? { ...item, quantity: item.quantity + safeQuantity }
          : item);
      }
      return [...current, { ...product, quantity: safeQuantity }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const safeQuantity = Math.floor(Number(quantity));
    if (safeQuantity <= 0 || !Number.isFinite(safeQuantity)) {
      removeFromCart(productId);
      return;
    }
    setItems((current) => current.map((item) => item.id === productId
      ? { ...item, quantity: safeQuantity }
      : item));
  };

  const clearCart = () => setItems([]);
  const total = items.reduce((sum, item) => sum + Number(item.precio) * item.quantity, 0);
  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, total }),
    [items, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
