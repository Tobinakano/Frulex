import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useSucursal } from "./SucursalContext";

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
  const { ofertasPorProducto } = useSucursal();
  const [storedItems, setItems] = useState(readStoredItems);

  useEffect(() => {
    localStorage.setItem("frulex_cart", JSON.stringify(storedItems));
  }, [storedItems]);

  // Lo guardado conserva el precio de catálogo; el precio efectivo aplica la
  // oferta vigente de la sucursal activa (el backend la aplica igual al pagar).
  const items = useMemo(
    () =>
      storedItems.map((item) => {
        const oferta = ofertasPorProducto[item.id];
        return oferta
          ? { ...item, precio_original: Number(item.precio), precio: oferta.precio_oferta, en_oferta: true }
          : item;
      }),
    [storedItems, ofertasPorProducto],
  );

  const addToCart = (product, quantity = 1) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    setItems((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item,
        );
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
    setItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + Number(item.precio) * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
