import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Hash,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import DireccionSelector from "../components/DireccionSelector";
import SucursalSelector from "../components/SucursalSelector";
import { useCart } from "../context/CartContext";
import { useSucursal } from "../context/SucursalContext";
import api, { formatCOP } from "../services/api";

const COSTO_DOMICILIO_EXPRESS = 4500;

const PASARELAS_SANDBOX = [
  {
    id: "Nequi",
    label: "Nequi",
    desc: "Pago inmediato desde tu celular (Sandbox)",
    icon: Smartphone,
  },
  {
    id: "PSE",
    label: "PSE",
    desc: "Débito bancario ACH Colombia (Sandbox)",
    icon: Building2,
  },
  {
    id: "Tarjeta",
    label: "Tarjeta",
    desc: "Crédito o Débito Visa / Mastercard (Sandbox)",
    icon: CreditCard,
  },
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { sucursalActiva } = useSucursal();
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [barrio, setBarrio] = useState("Granada");
  const [paymentMethod, setPaymentMethod] = useState("Nequi");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    confirmed: false,
    orderId: null,
    trackingCode: null,
    orderState: "Pendiente de despacho",
    sucursalNombre: null,
    confirmedTotal: null,
    confirmedSubtotal: null,
    confirmedDelivery: null,
    confirmedMethod: null,
    confirmedAddress: null,
  });

  const costoDomicilio = total >= 100 ? COSTO_DOMICILIO_EXPRESS : 0;
  const totalConDomicilio = total + costoDomicilio;

  if (status.confirmed) {
    return (
      <main className="mx-auto max-w-xl px-6 py-14">
        <div className="rounded-4xl border border-brand-100 bg-white p-8 text-center shadow-elevated">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-sm">
            <CheckCircle2 size={34} />
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-700">
            <PackageCheck size={14} /> {status.orderState}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900">
            ¡Orden de despacho generada!
          </h1>
          {status.orderId && (
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              Orden #{status.orderId} {status.sucursalNombre ? `· ${status.sucursalNombre}` : ""}
            </p>
          )}

          {status.trackingCode && (
            <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-left">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                <Hash size={13} /> Código único de seguimiento (UUID)
              </p>
              <p className="mt-1 font-mono text-sm font-extrabold text-gray-900 break-all">
                {status.trackingCode}
              </p>
            </div>
          )}

          <div className="mt-5 space-y-2 rounded-2xl border border-gray-100 bg-cream-50/50 p-4 text-left text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Pasarela Sandbox:</span>
              <strong className="text-gray-900">{status.confirmedMethod}</strong>
            </div>
            <div className="flex justify-between">
              <span>Dirección en Cali:</span>
              <strong className="text-gray-900">{status.confirmedAddress}</strong>
            </div>
            <div className="flex justify-between border-t border-gray-200/70 pt-2 text-sm">
              <span className="font-bold text-gray-800">Total pagado:</span>
              <strong className="text-base font-extrabold text-brand-700">
                {formatCOP(status.confirmedTotal ?? totalConDomicilio)}
              </strong>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Las unidades fueron descontadas del inventario de la sede y tu pedido está listo para
            alistamiento y despacho express.
          </p>

          <Link
            className="mt-7 inline-flex rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:from-brand-700 hover:to-brand-800"
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
        <div className="rounded-4xl border border-gray-200/80 bg-white p-8 shadow-soft">
          <p className="text-base font-extrabold text-gray-800">
            No tienes productos en el carrito para procesar el pago.
          </p>
          <Link
            className="mt-5 inline-block rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
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
    if (direccionEntrega.trim().length < 3) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Selecciona o escribe una dirección de entrega válida en Cali.",
      }));
      return;
    }
    setStatus((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const { data } = await api.post("/checkout/", {
        productos: items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          cantidad: item.quantity,
          precio: Number(item.precio),
        })),
        barrio,
        direccion_entrega: direccionEntrega.trim(),
        metodo_pago: paymentMethod,
        costo_domicilio: costoDomicilio,
        sucursal_id: sucursalActiva?.id ?? null,
        total: Number(totalConDomicilio.toFixed(2)),
      });
      clearCart();
      setStatus({
        loading: false,
        error: "",
        confirmed: true,
        orderId: data.pedido_id,
        trackingCode: data.codigo_seguimiento,
        orderState: data.estado || "Pendiente de despacho",
        sucursalNombre: data.sucursal_nombre || sucursalActiva?.nombre,
        confirmedTotal: data.total,
        confirmedSubtotal: data.subtotal,
        confirmedDelivery: data.costo_domicilio,
        confirmedMethod: data.metodo_pago || paymentMethod,
        confirmedAddress: data.direccion_entrega || direccionEntrega,
      });
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error:
          err.response?.data?.detail ||
          "No se pudo procesar el pago. Verifica el stock disponible e inténtalo nuevamente.",
      }));
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-4xl border border-brand-100/90 bg-white p-6 shadow-soft md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          <Truck size={13} /> Checkout Sandbox & Orden de Despacho
        </span>
        <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-gray-900">
          Finalizar compra
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Completa tu dirección y barrio en Cali, elige tu pasarela Sandbox y genera tu orden de
          despacho con seguimiento único.
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <form
          className="space-y-6 rounded-4xl border border-gray-200/80 bg-white p-6 shadow-soft md:col-span-7 md:p-8"
          onSubmit={submit}
        >
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <MapPin size={16} className="text-brand-600" />
              <span>Sucursal de despacho en Cali</span>
            </p>
            <div className="mt-2">
              <SucursalSelector variant="full" />
            </div>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
              <MapPin size={16} className="text-brand-600" />
              <span>Dirección y barrio de entrega en Cali</span>
            </p>
            <DireccionSelector onChange={setDireccionEntrega} onBarrioChange={setBarrio} />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-bold text-gray-800">
              <span className="flex items-center gap-1.5">
                <CreditCard size={16} className="text-brand-600" />
                <span>Pasarela de pago (Modo Sandbox)</span>
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
                Sandbox Activo
              </span>
            </label>

            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {PASARELAS_SANDBOX.map((gw) => {
                const Icon = gw.icon;
                const active = paymentMethod === gw.id;
                return (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setPaymentMethod(gw.id)}
                    className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all ${
                      active
                        ? "border-brand-600 bg-brand-50/80 shadow-sm ring-2 ring-brand-500/20"
                        : "border-gray-200 bg-white hover:border-brand-300"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon size={18} className={active ? "text-brand-700" : "text-gray-500"} />
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          active ? "bg-brand-600" : "bg-gray-200"
                        }`}
                      />
                    </div>
                    <span className="mt-2 text-sm font-extrabold text-gray-900">{gw.label}</span>
                    <span className="mt-0.5 text-[11px] leading-tight text-gray-500">{gw.desc}</span>
                  </button>
                );
              })}
            </div>

            <select
              aria-label="Método de pago"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-2.5 w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Nequi">Nequi (Sandbox)</option>
              <option value="PSE">PSE - Débito Bancario (Sandbox)</option>
              <option value="Tarjeta">Tarjeta de Crédito / Débito (Sandbox)</option>
              <option value="Pago contra entrega">Pago contra entrega</option>
            </select>
          </div>

          {status.error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600">
              {status.error}
            </p>
          )}

          <button
            disabled={status.loading}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition-all hover:from-brand-700 hover:to-brand-800 disabled:opacity-50"
          >
            {status.loading ? "Procesando pago y orden..." : "Confirmar pedido"}
          </button>
        </form>

        <aside className="h-fit rounded-4xl border border-brand-100/90 bg-white p-6 shadow-elevated md:col-span-5">
          <h2 className="text-lg font-extrabold text-gray-900">Resumen de compra</h2>
          {sucursalActiva && (
            <p className="mt-1 text-xs font-semibold text-brand-700">
              Despachado desde: <strong>{sucursalActiva.nombre}</strong>
            </p>
          )}
          <ul className="mt-4 space-y-3 border-b border-gray-100 pb-4 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-gray-700">
                <span>
                  {item.nombre}{" "}
                  <strong className="text-gray-900">
                    × {item.quantity} {item.unidad || "lb"}
                  </strong>
                </span>
                <span className="font-bold text-gray-900">
                  {formatCOP(Number(item.precio) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-b border-gray-100 pb-4 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal productos</span>
              <span className="font-semibold text-gray-900">{formatCOP(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Domicilio Express Cali ({barrio})</span>
              <span className="font-semibold text-brand-700">{formatCOP(costoDomicilio)}</span>
            </div>
          </div>

          <p className="mt-4 flex items-baseline justify-between text-lg font-extrabold text-gray-900">
            <span>Total a pagar</span>
            <span className="text-2xl text-brand-700">{formatCOP(totalConDomicilio)}</span>
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-50/70 p-3 text-xs font-medium text-brand-800">
            <ShieldCheck size={16} className="shrink-0 text-brand-600" />
            <span>
              Genera orden en estado <strong>Pendiente de despacho</strong> con código UUID y
              descuento atómico de stock.
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
