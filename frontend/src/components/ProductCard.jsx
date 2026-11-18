import { Check, Flame, Minus, Plus, ShoppingBasket, Sparkles, Store } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSucursal } from "../context/SucursalContext";

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
<<<<<<< HEAD
  const { ofertasPorProducto } = useSucursal();
=======
  const { ofertasPorProducto, sucursalActiva } = useSucursal();
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
  const oferta = ofertasPorProducto[product.id];
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const imageUrl = resolveProductImage(product);

  const precioOriginal = Number(product.precio);
  const descuentoPct =
    oferta && precioOriginal > 0
      ? Math.round(((precioOriginal - oferta.precio_oferta) / precioOriginal) * 100)
      : 0;

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
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200/75 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300/80 hover:shadow-elevated">
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-brand-50 via-cream-50 to-brand-100/50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nombre}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🍎</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-800 shadow-sm ring-1 ring-black/5 backdrop-blur-md">
          <Sparkles size={11} className="text-brand-600" />
          {product.categoria}
        </span>
<<<<<<< HEAD
        {oferta && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            Oferta
=======

        {oferta && (
          <span className="absolute right-3.5 top-3.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-3 py-1 text-xs font-extrabold text-white shadow-md">
            <Flame size={12} />
            <span>Oferta{descuentoPct > 0 ? ` -${descuentoPct}%` : ""}</span>
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Store size={13} className="text-brand-600" />
              <span>{sucursalActiva ? sucursalActiva.nombre : "Disponible en tienda"}</span>
            </span>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
              Fresco
            </span>
          </div>

          <h2 className="mt-2 text-lg font-extrabold tracking-tight text-gray-900 group-hover:text-brand-700 transition-colors">
            {product.nombre}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Producto fresco seleccionado · Venta por unidad / kg
          </p>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <div className="flex items-baseline justify-between">
<<<<<<< HEAD
            <span className="text-xs font-medium text-gray-500">Precio</span>
            {oferta ? (
              <span>
                <span className="mr-2 text-sm font-medium text-gray-400 line-through">
                  ${Number(product.precio).toFixed(2)}
                </span>
                <span className="text-xl font-extrabold text-red-600">
                  ${oferta.precio_oferta.toFixed(2)}
                </span>
              </span>
            ) : (
              <span className="text-xl font-extrabold text-gray-900">
                ${Number(product.precio).toFixed(2)}
=======
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Precio
            </span>
            {oferta ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-gray-400 line-through">
                  ${precioOriginal.toFixed(2)}
                </span>
                <span className="text-2xl font-extrabold tracking-tight text-rose-600">
                  ${oferta.precio_oferta.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                ${precioOriginal.toFixed(2)}
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
              </span>
            )}
          </div>

          <div className="mt-3.5 flex items-center gap-2.5">
            <div className="flex items-center rounded-2xl border border-gray-200 bg-cream-50/70 p-0.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-8 items-center justify-center rounded-xl text-gray-600 transition hover:bg-white hover:text-brand-700 hover:shadow-sm"
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
                className="w-9 bg-transparent text-center text-sm font-bold text-gray-900 focus:outline-none"
                aria-label={`Cantidad de ${product.nombre}`}
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-8 items-center justify-center rounded-xl text-gray-600 transition hover:bg-white hover:text-brand-700 hover:shadow-sm"
                aria-label="Aumentar cantidad"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={addProduct}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${
                added
                  ? "bg-emerald-700 ring-2 ring-emerald-500/30"
                  : "bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 hover:shadow-md active:scale-[0.98]"
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
