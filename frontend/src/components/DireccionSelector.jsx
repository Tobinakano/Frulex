import { useEffect, useMemo, useState } from "react";
import { Home, MapPin, Plus, Trash2 } from "lucide-react";
import api from "../services/api";

const NUEVA = "nueva";

function formatear(direccion) {
  return `${direccion.direccion}, ${direccion.ciudad}${
    direccion.referencia ? ` (${direccion.referencia})` : ""
  }`;
}

/**
 * CU-09: permite elegir una dirección guardada o escribir otra.
 * Notifica al padre con el texto final de la dirección ("" si aún no hay una válida).
 */
export default function DireccionSelector({ onChange }) {
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccion, setSeleccion] = useState(NUEVA);
  const [texto, setTexto] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/direcciones/")
      .then(({ data }) => {
        if (!active) return;
        setDirecciones(data);
        if (data.length > 0) setSeleccion(data[0].id);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const valor = useMemo(() => {
    if (seleccion === NUEVA) return texto.trim();
    const elegida = direcciones.find((d) => d.id === seleccion);
    return elegida ? formatear(elegida) : "";
  }, [seleccion, texto, direcciones]);

  useEffect(() => {
    onChange(valor);
  }, [valor]);

  const guardar = async () => {
    setError("");
    setGuardando(true);
    try {
      const { data } = await api.post("/direcciones/", {
        alias: alias.trim(),
        direccion: texto.trim(),
      });
      setDirecciones((current) => [...current, data]);
      setSeleccion(data.id);
      setTexto("");
      setAlias("");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "No se pudo guardar la dirección.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id) => {
    setError("");
    try {
      await api.delete(`/direcciones/${id}`);
      const restantes = direcciones.filter((d) => d.id !== id);
      setDirecciones(restantes);
      if (seleccion === id) setSeleccion(restantes[0]?.id ?? NUEVA);
    } catch {
      setError("No se pudo eliminar la dirección.");
    }
  };

  const optionClass = (selected) =>
    `flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-sm transition-all ${
      selected
        ? "border-brand-500 bg-brand-50/70 shadow-sm ring-1 ring-brand-500/20"
        : "border-gray-200/90 bg-white hover:border-brand-300 hover:bg-cream-50/40"
    }`;

  return (
    <div className="mt-2.5 space-y-2.5">
      {loading && <p className="text-xs font-medium text-gray-500">Cargando tus direcciones...</p>}

      {direcciones.map((direccion) => (
        <div key={direccion.id} className={optionClass(seleccion === direccion.id)}>
          <label className="flex flex-1 cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="direccion-entrega"
              checked={seleccion === direccion.id}
              onChange={() => setSeleccion(direccion.id)}
              className="mt-1 accent-brand-600"
            />
            <span>
              <span className="flex items-center gap-1.5 font-bold text-gray-900">
                <Home size={14} className="text-brand-600" /> {direccion.alias}
              </span>
              <span className="mt-0.5 block text-xs text-gray-600">{formatear(direccion)}</span>
            </span>
          </label>
          <button
            type="button"
            onClick={() => eliminar(direccion.id)}
            className="rounded-xl p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar dirección ${direccion.alias}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      <div className={optionClass(seleccion === NUEVA)}>
        <label className="flex flex-1 cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="direccion-entrega"
            checked={seleccion === NUEVA}
            onChange={() => setSeleccion(NUEVA)}
            className="mt-1 accent-brand-600"
          />
          <span className="flex items-center gap-1.5 font-bold text-gray-900">
            <Plus size={14} className="text-brand-600" />
            {direcciones.length ? "Usar otra dirección" : "Escribir una dirección"}
          </span>
        </label>
      </div>

      {seleccion === NUEVA && (
        <div className="space-y-2.5 rounded-2xl border border-dashed border-brand-200 bg-cream-50/50 p-3.5">
          <div className="relative">
            <MapPin
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder="Ej: Calle 15 # 120-34, Cali"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={alias}
              onChange={(event) => setAlias(event.target.value)}
              placeholder="Nombre (Casa, Oficina...)"
              maxLength={60}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="button"
              disabled={guardando || texto.trim().length < 3 || alias.trim().length < 2}
              onClick={guardar}
              className="rounded-xl border border-brand-300 bg-white px-3.5 py-2.5 text-xs font-bold text-brand-700 shadow-sm transition hover:bg-brand-50 disabled:opacity-40"
            >
              {guardando ? "Guardando..." : "Guardar para próximas compras"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
