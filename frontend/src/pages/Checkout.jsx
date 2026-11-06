import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CreditCard, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../services/api";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pago contra entrega");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    confirmed: false,
    orderId: null,
    confirmedTotal: null,
  });

  if (status.confirmed) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-gray-900">¡Pedido confirmado!</h1>
          {status.orderId && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
              Orden #{status.orderId}
            </p>
          )}
          <p className="mt-3 text-sm text-gray-600">
            Tu compra fue procesada y registrada exitosamente por un total de{" "}
            <strong className="text-gray-900">
              ${Number(status.confirmedTotal ?? total).toFixed(2)}
            </strong>
            .
          </p>
          <Link
            className="mt-8 inline-flex rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            to="/catalogo"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-base font-semibold text-gray-800">
            No tienes productos en el carrito para procesar el pago.
          </p>
          <Link
            className="mt-5 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
            to="/catalogo"
          >
            Ir al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", confirmed: false, orderId: null, confirmedTotal: null });
    try {
      const { data } = await api.post("/checkout/", {
        productos: items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          cantidad: item.quantity,
          precio: Number(item.precio),
        })),
        direccion_entrega: direccionEntrega.trim(),
        metodo_pago: paymentMethod,
        total: Number(total.toFixed(2)),
      });
      clearCart();
      setStatus({
        loading: false,
        error: "",
        confirmed: true,
        orderId: data.pedido_id,
        confirmedTotal: data.total,
      });
    } catch (err) {
      setStatus({
        loading: false,
        error:
          err.response?.data?.detail ||
          "No se pudo procesar el pago. Verifica tu sesión e inténtalo nuevamente.",
        confirmed: false,
        orderId: null,
        confirmedTotal: null,
      });
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Finalizar compra
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Completa tu dirección de entrega a domicilio y confirma tu pedido.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <form
          className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-7"
          onSubmit={submit}
        >
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <MapPin size={16} className="text-brand-600" />
              <span>Dirección de entrega</span>
            </label>
            <input
              required
              minLength={3}
              value={direccionEntrega}
              onChange={(e) => setDireccionEntrega(e.target.value)}
              placeholder="Ej: Calle 15 # 120-34, Cali"
              className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <CreditCard size={16} className="text-brand-600" />
              <span>Método de pago</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option>Pago contra entrega</option>
              <option>Tarjeta simulada</option>
              <option>Transferencia PSE simulada</option>
            </select>
          </div>

          {status.error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              {status.error}
            </p>
          )}

          <button
            disabled={status.loading}
            className="w-full rounded-xl bg-brand-600 p-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
          >
            {status.loading ? "Procesando pedido..." : "Confirmar pedido"}
          </button>
        </form>

        <aside className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-5 h-fit">
          <h2 className="text-lg font-bold text-gray-900">Resumen de compra</h2>
          <ul className="mt-4 space-y-3 border-b border-gray-100 pb-4 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-gray-700">
                <span>
                  {item.nombre} <strong className="text-gray-900">× {item.quantity}</strong>
                </span>
                <span className="font-semibold">
                  ${(Number(item.precio) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline justify-between text-lg font-extrabold text-gray-900">
            <span>Total a pagar</span>
            <span>${total.toFixed(2)}</span>
          </p>
        </aside>
      </div>
    </main>
  );
}
