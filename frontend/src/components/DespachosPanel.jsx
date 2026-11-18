import { useCallback, useEffect, useState } from "react";
import { MapPin, PackageCheck, RefreshCw, Truck } from "lucide-react";
import SucursalSelector from "./SucursalSelector";
import { useSucursal } from "../context/SucursalContext";
import api from "../services/api";

const ESTADOS = {
  generada: { label: "Generada", className: "bg-gray-100 text-gray-700" },
  en_preparacion: { label: "En preparación", className: "bg-amber-50 text-amber-700" },
  despachada: { label: "Despachada", className: "bg-blue-50 text-blue-700" },
  entregada: { label: "Entregada", className: "bg-brand-50 text-brand-700" },
};

const ACCIONES = {
  en_preparacion: "Iniciar preparación",
  despachada: "Marcar despachada",
  entregada: "Marcar entregada",
};

const money = (value) => `$${Number(value).toFixed(2)}`;

function mensajeError(err, fallback) {
  const detail = err.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

/** CU-11: el personal de la sucursal activa genera y da seguimiento a las órdenes de despacho. */
export default function DespachosPanel() {
  const { sucursalActiva } = useSucursal();
  const sucursalId = sucursalActiva?.id ?? null;

  const [pendientes, setPendientes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [observaciones, setObservaciones] = useState({});
  const [loading, setLoading] = useState(false);
  const [trabajando, setTrabajando] = useState(null);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    if (!sucursalId) {
      setPendientes([]);
      setOrdenes([]);
      return;
    }
    setLoading(true);
    try {
      const params = { sucursal_id: sucursalId };
      const [pend, ord] = await Promise.all([
        api.get("/despachos/pedidos-pendientes", { params }),
        api.get("/despachos/", { params }),
      ]);
      setPendientes(pend.data);
      setOrdenes(ord.data);
      setError("");
    } catch (err) {
      setError(mensajeError(err, "No se pudieron cargar los despachos."));
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const generar = async (pedido) => {
    setTrabajando(`p${pedido.pedido_id}`);
    setError("");
    try {
      await api.post("/despachos/", {
        pedido_id: pedido.pedido_id,
        sucursal_id: sucursalId,
        observaciones: (observaciones[pedido.pedido_id] || "").trim() || null,
      });
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo generar la orden de despacho."));
    } finally {
      setTrabajando(null);
    }
  };

  const avanzar = async (orden) => {
    setTrabajando(`o${orden.id}`);
    setError("");
    try {
      await api.patch(`/despachos/${orden.id}/estado`, { estado: orden.siguiente_estado });
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No se pudo actualizar el estado de la orden."));
    } finally {
      setTrabajando(null);
    }
  };

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Truck size={13} /> Despachos
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
            Órdenes de despacho
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Genera la orden de los pedidos confirmados y avanza su estado hasta la entrega.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-72">
          <SucursalSelector variant="full" />
          <button
            type="button"
            onClick={cargar}
            className="rounded-xl border border-gray-200 p-3 text-gray-600 transition hover:border-brand-300 hover:text-brand-700"
            aria-label="Actualizar"
            title="Actualizar"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!sucursalActiva ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <MapPin className="mx-auto text-brand-600" size={24} />
          <p className="mt-2 text-sm font-semibold text-gray-800">Elige la sucursal activa</p>
          <p className="mt-1 text-xs text-gray-500">
            Los despachos se gestionan por sucursal. Selecciónala en el selector de arriba.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Pedidos por despachar ({pendientes.length})
            </h3>
            <div className="mt-3 space-y-3">
              {pendientes.length === 0 && (
                <p className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center text-sm text-gray-500">
                  No hay pedidos pendientes en {sucursalActiva.nombre}.
                </p>
              )}
              {pendientes.map((pedido) => (
                <article key={pedido.pedido_id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      Pedido #{pedido.pedido_id}{" "}
                      <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-600">
                        {pedido.tipo}
                      </span>
                      {pedido.sucursal_id === null && (
                        <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          Sin sucursal
                        </span>
                      )}
                    </p>
                    <span className="text-sm font-extrabold text-gray-900">{money(pedido.total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    {pedido.cliente_nombre || "Cliente sin registro"} · {pedido.unidades} unidades
                  </p>
                  <p className="text-xs text-gray-500">{pedido.direccion_entrega}</p>
                  <input
                    value={observaciones[pedido.pedido_id] || ""}
                    onChange={(event) =>
                      setObservaciones({ ...observaciones, [pedido.pedido_id]: event.target.value })
                    }
                    maxLength={300}
                    placeholder="Observaciones (opcional)"
                    className="mt-3 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={trabajando === `p${pedido.pedido_id}`}
                    onClick={() => generar(pedido)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    <PackageCheck size={15} />
                    {trabajando === `p${pedido.pedido_id}` ? "Generando..." : "Generar orden de despacho"}
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Órdenes de la sucursal ({ordenes.length})
            </h3>
            <div className="mt-3 space-y-3">
              {ordenes.length === 0 && (
                <p className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center text-sm text-gray-500">
                  Aún no hay órdenes de despacho en {sucursalActiva.nombre}.
                </p>
              )}
              {ordenes.map((orden) => {
                const estado = ESTADOS[orden.estado] || ESTADOS.generada;
                return (
                  <article key={orden.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">
                        {orden.codigo}{" "}
                        <span className="text-xs font-medium text-gray-500">· Pedido #{orden.pedido_id}</span>
                      </p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${estado.className}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {orden.cliente_nombre || "Cliente sin registro"} · {money(orden.total)}
                    </p>
                    <p className="text-xs text-gray-500">{orden.direccion_entrega}</p>
                    <ul className="mt-2 space-y-0.5 text-xs text-gray-700">
                      {orden.items.map((item) => (
                        <li key={item.producto_id}>
                          <strong>{item.cantidad} ×</strong> {item.nombre}
                        </li>
                      ))}
                    </ul>
                    {orden.observaciones && (
                      <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600">
                        Nota: {orden.observaciones}
                      </p>
                    )}
                    {orden.siguiente_estado && (
                      <button
                        type="button"
                        disabled={trabajando === `o${orden.id}`}
                        onClick={() => avanzar(orden)}
                        className="mt-3 w-full rounded-xl border border-brand-300 px-4 py-2.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
                      >
                        {ACCIONES[orden.siguiente_estado]}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
