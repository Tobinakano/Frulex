import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Flame, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSucursal } from "../context/SucursalContext";

export default function Carrito() {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { sucursalActiva } = useSucursal();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-brand-100/90 bg-white p-6 shadow-soft md:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            <ShoppingBag size={13} /> Resumen de selección
          </span>
          <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-gray-900">
            Tu carrito de compras
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Revisa tus productos seleccionados antes de confirmar tu pedido.
          </p>
        </div>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40"
        >
          <ArrowLeft size={16} />
          <span>Seguir comprando</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-4xl border border-gray-200/80 bg-white p-12 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-sm">
            <ShoppingBag size={28} />
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-gray-900">Tu carrito está vacío</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
            Explora nuestro catálogo y agrega frutas o verduras frescas a tu carrito.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:from-brand-700 hover:to-brand-800"
          >
            <span>Ver productos del catálogo</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-soft transition hover:border-brand-200"
              >
                <div className="flex items-center gap-4">
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="h-16 w-16 rounded-2xl object-cover ring-1 ring-gray-100"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                      🍎
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-700">
                        {item.categoria || "Catálogo Frulex"}
                      </span>
                      {item.en_oferta && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600">
                          <Flame size={10} /> Oferta
                        </span>
                      )}
                    </div>
                    <h2 className="mt-0.5 text-base font-extrabold text-gray-900">{item.nombre}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.en_oferta && item.precio_original ? (
                        <>
                          <span className="mr-1.5 line-through">
                            ${Number(item.precio_original).toFixed(2)}
                          </span>
                          <span className="font-bold text-rose-600">
                            ${Number(item.precio).toFixed(2)}
                          </span>{" "}
                          por unidad
                        </>
                      ) : (
                        <>${Number(item.precio).toFixed(2)} por unidad</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-2xl border border-gray-200 bg-cream-50/70 p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-9 w-8 items-center justify-center rounded-xl text-gray-600 transition hover:bg-white hover:text-brand-700 hover:shadow-sm"
                      aria-label="Reducir cantidad"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      id={`cart-quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.id, event.target.value)}
                      className="w-11 bg-transparent text-center text-sm font-bold text-gray-900 focus:outline-none"
                      aria-label={`Cantidad de ${item.nombre}`}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-9 w-8 items-center justify-center rounded-xl text-gray-600 transition hover:bg-white hover:text-brand-700 hover:shadow-sm"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="w-20 text-right text-base font-extrabold text-gray-900">
                    ${(Number(item.precio) * item.quantity).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-4xl border border-brand-100/90 bg-white p-6 shadow-elevated">
              <h2 className="text-lg font-extrabold text-gray-900">Resumen de compra</h2>
              {sucursalActiva && (
                <p className="mt-1 text-xs font-medium text-brand-700">
                  Sucursal: <strong>{sucursalActiva.nombre}</strong>
                </p>
              )}

              <div className="mt-5 space-y-2.5 border-b border-gray-100 pb-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Productos ({items.length})</span>
                  <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío a domicilio</span>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-extrabold text-brand-700">
                    Gratis
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm font-bold text-gray-700">Subtotal</span>
                <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>

              {user ? (
                <Link
                  to="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-lg"
                >
                  <span>Proceder al pago</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <div className="mt-6 space-y-2.5">
                  <Link
                    to="/login"
                    state={{ from: "/checkout" }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:from-brand-700 hover:to-brand-800"
                  >
                    <span>Iniciar sesión para pagar</span>
                    <ArrowRight size={16} />
                  </Link>
                  <p className="text-center text-xs text-gray-500">
                    ¿Nuevo en Frulex?{" "}
                    <Link to="/registro" className="font-bold text-brand-700 hover:underline">
                      Crea tu cuenta aquí
                    </Link>
                  </p>
                </div>
              )}

              <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-gray-400">
                <ShieldCheck size={14} className="text-brand-600" />
                <span>Garantía de frescura 100% Frulex</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
