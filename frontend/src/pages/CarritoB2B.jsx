import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, CreditCard, MapPin, Minus, Package, Plus, Trash2 } from "lucide-react";
import DireccionSelector from "../components/DireccionSelector";
import SucursalSelector from "../components/SucursalSelector";
import { useSucursal } from "../context/SucursalContext";
import api from "../services/api";

const money = (value) => `$${Number(value).toFixed(2)}`;

function mensajeError(err, fallback) {
  const detail = err.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

function CantidadInput({ value, onCommit, label }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (next) => {
    const parsed = Math.floor(Number(next));
    if (Number.isFinite(parsed) && parsed > 0 && parsed !== value) onCommit(parsed);
    else setDraft(String(value));
  };

  return (
    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={() => commit(value - 1)}
        className="px-2.5 py-1.5 text-gray-600 hover:text-brand-700"
        aria-label="Reducir cantidad"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        min="1"
        value={draft}
        aria-label={label}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        className="w-16 bg-transparent text-center text-sm font-semibold text-gray-900 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => commit(value + 1)}
        className="px-2.5 py-1.5 text-gray-600 hover:text-brand-700"
        aria-label="Aumentar cantidad"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function CarritoB2B() {
  const { sucursalActiva } = useSucursal();
  const sucursalId = sucursalActiva?.id ?? null;

  const [carrito, setCarrito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [metodoPago, setMetodoPago] = useState("Pago contra entrega");
  const [enviando, setEnviando] = useState(false);
  const [confirmado, setConfirmado] = useState(null);

  const params = { sucursal_id: sucursalId };

  // CU-15: ver carrito (se recalcula si cambia la sucursal por las ofertas)
  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/carrito-b2b/", { params: { sucursal_id: sucursalId } })
      .then(({ data }) => {
        if (!active) return;
        setCarrito(data);
        setError("");
      })
      .catch((err) => active && setError(mensajeError(err, "No se pudo cargar el carrito B2B.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [sucursalId]);

  useEffect(() => {
    api
      .get("/productos/")
      .then(({ data }) => setProductos(data))
      .catch(() => {});
  }, []);

  const ejecutar = async (peticion, fallback) => {
    setError("");
    try {
      const { data } = await peticion();
      setCarrito(data);
    } catch (err) {
      setError(mensajeError(err, fallback));
    }
  };

  const agregar = (producto) =>
    ejecutar(
      () =>
        api.post(
          "/carrito-b2b/items",
          { producto_id: producto.id, cantidad: Math.max(1, Number(cantidades[producto.id]) || 10) },
          { params },
        ),
      "No se pudo agregar el producto.",
    );
  const actualizar = (productoId, cantidad) =>
    ejecutar(
      () => api.put(`/carrito-b2b/items/${productoId}`, { cantidad }, { params }),
      "No se pudo actualizar la cantidad.",
    );
  const eliminar = (productoId) =>
    ejecutar(() => api.delete(`/carrito-b2b/items/${productoId}`, { params }), "No se pudo eliminar el producto.");
  const vaciar = () =>
    ejecutar(() => api.delete("/carrito-b2b/", { params }), "No se pudo vaciar el carrito.");

  const confirmar = async (event) => {
    event.preventDefault();
    if (direccionEntrega.trim().length < 3) {
      setError("Selecciona o escribe una dirección de entrega.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const { data } = await api.post("/carrito-b2b/confirmar", {
        sucursal_id: sucursalId,
        direccion_entrega: direccionEntrega.trim(),
        metodo_pago: metodoPago,
      });
      setConfirmado(data);
    } catch (err) {
      setError(mensajeError(err, "No se pudo confirmar el pedido B2B."));
    } finally {
      setEnviando(false);
    }
  };

  if (confirmado) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-gray-900">¡Pedido B2B confirmado!</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Orden #{confirmado.pedido_id}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Tu pedido mayorista fue registrado por un total de{" "}
            <strong className="text-gray-900">{money(confirmado.total)}</strong>.
          </p>
          <Link
            to="/catalogo"
            className="mt-8 inline-flex rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const items = carrito?.items ?? [];
  const faltante = carrito ? Number(carrito.minimo_pedido) - Number(carrito.total) : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Package size={13} /> Compras mayoristas
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">Carrito B2B</h1>
          <p className="mt-1 text-sm text-gray-600">
            Arma tu pedido por volumen: a mayor cantidad por producto, mayor descuento.
          </p>
        </div>
        <div className="w-full md:w-64">
          <SucursalSelector variant="full" />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Tu pedido</h2>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={vaciar}
                  className="text-xs font-semibold text-gray-500 transition hover:text-red-600"
                >
                  Vaciar carrito
                </button>
              )}
            </div>

            {loading ? (
              <div className="mt-4 h-24 animate-pulse rounded-2xl border border-gray-100 bg-white" />
            ) : items.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                Tu carrito B2B está vacío. Agrega productos desde la lista de abajo.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.producto_id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div>
                      <span className="text-xs font-semibold text-brand-700">{item.categoria}</span>
                      <h3 className="text-base font-bold text-gray-900">{item.nombre}</h3>
                      <p className="text-xs text-gray-500">
                        {(item.precio_oferta !== null || item.descuento_volumen_pct > 0) && (
                          <span className="mr-1.5 line-through">{money(item.precio_base)}</span>
                        )}
                        <span className="font-semibold text-gray-700">
                          {money(item.precio_unitario_final)}
                        </span>{" "}
                        por unidad
                        {item.precio_oferta !== null && (
                          <span className="ml-1.5 rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-600">
                            Oferta
                          </span>
                        )}
                        {item.descuento_volumen_pct > 0 && (
                          <span className="ml-1.5 rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                            -{item.descuento_volumen_pct}% volumen
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <CantidadInput
                        value={item.cantidad}
                        label={`Cantidad de ${item.nombre}`}
                        onCommit={(cantidad) => actualizar(item.producto_id, cantidad)}
                      />
                      <span className="w-24 text-right text-base font-extrabold text-gray-900">
                        {money(item.subtotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminar(item.producto_id)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Eliminar ${item.nombre}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900">Agregar productos</h2>
            <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">{producto.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {producto.categoria} · {money(producto.precio)} por unidad
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={cantidades[producto.id] ?? 10}
                      onChange={(event) =>
                        setCantidades({ ...cantidades, [producto.id]: event.target.value })
                      }
                      aria-label={`Cantidad a agregar de ${producto.nombre}`}
                      className="w-20 rounded-xl border border-gray-200 bg-gray-50 p-2 text-center text-sm font-semibold focus:border-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => agregar(producto)}
                      className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
              {productos.length === 0 && (
                <p className="p-5 text-sm text-gray-500">No hay productos disponibles.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <form
            onSubmit={confirmar}
            className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900">Resumen del pedido</h2>

            <div className="space-y-2 border-b border-gray-100 pb-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Unidades</span>
                <span>{carrito?.total_unidades ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal (precio lista)</span>
                <span>{money(carrito?.subtotal_sin_descuento ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Descuentos y ofertas</span>
                <span className="font-medium text-brand-700">
                  -{money(carrito?.descuento_total ?? 0)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2 text-gray-900">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-2xl font-extrabold">{money(carrito?.total ?? 0)}</span>
              </div>
            </div>

            {carrito && (
              <div className="rounded-xl bg-brand-50/70 p-3 text-xs text-gray-600">
                <p className="font-semibold text-brand-700">Descuento por volumen (por producto)</p>
                <ul className="mt-1 space-y-0.5">
                  {carrito.tramos_descuento.map((tramo) => (
                    <li key={tramo.desde}>
                      Desde {tramo.desde} unidades: <strong>{tramo.porcentaje}%</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {items.length > 0 && carrito && !carrito.cumple_minimo && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>
                  El pedido mínimo es {money(carrito.minimo_pedido)}. Te faltan {money(faltante)}.
                </span>
              </div>
            )}

            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                <MapPin size={16} className="text-brand-600" />
                <span>Dirección de entrega</span>
              </p>
              <DireccionSelector onChange={setDireccionEntrega} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                <CreditCard size={16} className="text-brand-600" />
                <span>Método de pago</span>
              </label>
              <select
                value={metodoPago}
                onChange={(event) => setMetodoPago(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option>Pago contra entrega</option>
                <option>Transferencia PSE simulada</option>
                <option>Factura a crédito simulada</option>
              </select>
            </div>

            <button
              disabled={enviando || items.length === 0 || !carrito?.cumple_minimo}
              className="w-full rounded-xl bg-brand-600 p-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
            >
              {enviando ? "Confirmando pedido..." : "Confirmar pedido B2B"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
