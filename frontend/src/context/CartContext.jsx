import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { useSucursal } from "./SucursalContext";

const CartContext = createContext(null);
const OWNER_KEY = "frulex_cart_owner";

// Convierte la respuesta del carrito del servidor a la forma que usa el frontend.
function fromServer(data) {
  return data.items.map((item) => ({
    id: item.producto_id,
    nombre: item.nombre,
    categoria: item.categoria,
    imagen_url: item.imagen_url,
    precio: item.precio_base,
    quantity: item.cantidad,
  }));
}

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
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const previousUserId = useRef(userId);
  const [storedItems, setItems] = useState(readStoredItems);

  useEffect(() => {
    localStorage.setItem("frulex_cart", JSON.stringify(storedItems));
  }, [storedItems]);

  // CU-07 / CU-08: con sesión iniciada el carrito vive en el servidor.
  // Lo guardado en el navegador es solo una copia para mostrarlo al instante.
  useEffect(() => {
    const anterior = previousUserId.current;
    previousUserId.current = userId;

    if (!userId) {
      if (anterior) {
        // Cierre de sesión: el carrito pertenece al usuario, no al navegador.
        setItems([]);
        localStorage.removeItem(OWNER_KEY);
      }
      return undefined;
    }

    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/carrito/");
        let serverItems = fromServer(data);
        const local = readStoredItems();
        // Carrito anterior guardado solo en el navegador: se migra una única vez.
        if (
          serverItems.length === 0 &&
          local.length > 0 &&
          localStorage.getItem(OWNER_KEY) !== String(userId)
        ) {
          for (const item of local) {
            try {
              await api.post("/carrito/items", { producto_id: item.id, cantidad: item.quantity });
            } catch {
              /* producto que ya no existe: se omite */
            }
          }
          const { data: migrado } = await api.get("/carrito/");
          serverItems = fromServer(migrado);
        }
        localStorage.setItem(OWNER_KEY, String(userId));
        if (active) setItems(serverItems);
      } catch {
        /* sin conexión con el servidor: se conserva la copia local */
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const recargarDesdeServidor = async () => {
    try {
      const { data } = await api.get("/carrito/");
      setItems(fromServer(data));
    } catch {
      /* se mantiene la copia local */
    }
  };

  // Envía el cambio al servidor; si falla, se vuelve a cargar el carrito real.
  const sincronizar = (peticion) => {
    if (!userId) return;
    peticion().catch(recargarDesdeServidor);
  };

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
    sincronizar(() => api.post("/carrito/items", { producto_id: product.id, cantidad: safeQuantity }));
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((item) => item.id !== productId));
    sincronizar(() => api.delete(`/carrito/items/${productId}`));
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
    sincronizar(() => api.put(`/carrito/items/${productId}`, { cantidad: safeQuantity }));
  };

  const clearCart = () => {
    setItems([]);
    sincronizar(() => api.delete("/carrito/"));
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
