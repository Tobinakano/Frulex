import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Carrito() {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Tu carrito de compras
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Revisa tus productos seleccionados antes de confirmar tu pedido.
          </p>
        </div>
        <Link
          to="/catalogo"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          ← Seguir comprando
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <ShoppingBag size={26} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Tu carrito está vacío</h2>
          <p className="mt-1 text-sm text-gray-500">
            Explora nuestro catálogo y agrega frutas o verduras frescas a tu carrito.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
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
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div>
                  <span className="text-xs font-semibold text-brand-700">
                    {item.categoria || "Catálogo Frulex"}
                  </span>
                  <h2 className="text-base font-bold text-gray-900">{item.nombre}</h2>
                  <p className="text-xs text-gray-500">
                    ${Number(item.precio).toFixed(2)} por unidad
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-gray-600 hover:text-brand-700"
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
                      className="w-12 bg-transparent text-center text-sm font-semibold text-gray-900 focus:outline-none"
                      aria-label={`Cantidad de ${item.nombre}`}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-gray-600 hover:text-brand-700"
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
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Resumen de compra</h2>
              <div className="mt-4 space-y-2 border-b border-gray-100 pb-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Productos ({items.length})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío a domicilio</span>
                  <span className="font-medium text-brand-700">Gratis</span>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-700">Subtotal</span>
                <span className="text-2xl font-extrabold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>

              {user ? (
                <Link
                  to="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  <span>Proceder al pago</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <div className="mt-6 space-y-2.5">
                  <Link
                    to="/login"
                    state={{ from: "/checkout" }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                  >
                    <span>Iniciar sesión para pagar</span>
                    <ArrowRight size={16} />
                  </Link>
                  <p className="text-center text-xs text-gray-500">
                    ¿Nuevo en Frulex?{" "}
                    <Link to="/registro" className="font-semibold text-brand-700">
                      Crea tu cuenta aquí
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
