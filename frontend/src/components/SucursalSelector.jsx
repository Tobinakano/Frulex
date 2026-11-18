import { ChevronDown, MapPin } from "lucide-react";
import { useSucursal } from "../context/SucursalContext";

export default function SucursalSelector({ variant = "compact" }) {
  const { sucursales, sucursalActiva, seleccionarSucursal, loading } = useSucursal();
  const full = variant === "full";
  const sinSucursales = !loading && sucursales.length === 0;

  return (
    <label
      className={`group relative flex items-center ${full ? "w-full" : "max-w-[13.5rem]"}`}
      title="Sucursal activa en Cali"
    >
      <span
        className={`pointer-events-none absolute left-3 flex items-center justify-center rounded-lg transition-colors ${
          sucursalActiva ? "text-brand-600" : "text-amber-600 group-hover:text-brand-600"
        }`}
      >
        <MapPin size={full ? 17 : 15} />
      </span>
      <select
        aria-label="Sucursal activa"
        value={sucursalActiva?.id ?? ""}
        disabled={loading || sinSucursales}
        onChange={(event) => seleccionarSucursal(event.target.value)}
        className={`w-full cursor-pointer appearance-none truncate rounded-2xl border bg-white pl-9 pr-8 font-bold shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
          full ? "py-3 text-sm" : "py-2 text-xs"
        } ${
          sucursalActiva
            ? "border-brand-200 bg-brand-50/50 text-brand-800 hover:border-brand-300"
            : "border-amber-300 bg-amber-50/40 text-gray-700 hover:border-brand-300"
        }`}
      >
        <option value="">
          {loading ? "Cargando sedes..." : sinSucursales ? "Sin sucursales" : "Elegir sede en Cali"}
        </option>
        {sucursales.map((sucursal) => (
          <option key={sucursal.id} value={sucursal.id}>
            {sucursal.nombre} ({sucursal.ciudad})
          </option>
        ))}
      </select>
      <ChevronDown
        size={full ? 16 : 14}
        className="pointer-events-none absolute right-2.5 text-gray-400 transition-transform group-hover:text-brand-600"
      />
    </label>
  );
}
