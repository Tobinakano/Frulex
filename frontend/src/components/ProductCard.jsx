import { Check, Minus, Plus, ShoppingBasket, Store } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGES = {
  manzanas: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
  naranjas: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80",
  tomates: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
  cebollas: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80",
};

function resolveProductImage(product) {
  const url = product.imagen_url || "";
  if (url && !url.includes("placehold.co")) {
    return url;
  }
  const key = (product.nombre || "").toLowerCase();
  for (const [k, img] of Object.entries(FALLBACK_IMAGES)) {
    if (key.includes(k)) return img;
  }
  return url;
}

export default function ProductCard({ product, onRequireAuth }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const imageUrl = resolveProductImage(product);

  const addProduct = () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    addToCart(product, quantity);
    setQuantity(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-brand-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nombre}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🍎</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
          {product.categoria}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Store size={13} className="text-brand-600" />
            <span>Disponible en tienda</span>
          </div>
          <h2 className="mt-1.5 text-lg font-bold text-gray-900">{product.nombre}</h2>
          <p className="mt-1 text-xs text-gray-500">
            Producto fresco seleccionado · Venta por unidad / kg
          </p>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-gray-500">Precio</span>
            <span className="text-xl font-extrabold text-gray-900">
              ${Number(product.precio).toFixed(2)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2.5 py-2 text-gray-600 transition hover:text-brand-700"
                aria-label="Disminuir cantidad"
              >
                <Minus size={14} />
              </button>
              <input
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="w-10 bg-transparent text-center text-sm font-semibold text-gray-900 focus:outline-none"
                aria-label={`Cantidad de ${product.nombre}`}
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2.5 py-2 text-gray-600 transition hover:text-brand-700"
                aria-label="Aumentar cantidad"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={addProduct}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                added
                  ? "bg-emerald-700"
                  : "bg-brand-600 hover:bg-brand-700 active:scale-[0.99]"
              }`}
            >
              {added ? (
                <>
                  <Check size={16} /> ¡Añadido!
                </>
              ) : (
                <>
                  <ShoppingBasket size={16} /> Añadir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
