import { MapPin } from "lucide-react";
import { useSucursal } from "../context/SucursalContext";

export default function SucursalSelector({ variant = "compact" }) {
  const { sucursales, sucursalActiva, seleccionarSucursal, loading } = useSucursal();
  const full = variant === "full";
  const sinSucursales = !loading && sucursales.length === 0;

  return (
    <label
      className={`relative flex items-center ${full ? "w-full" : "max-w-[10.5rem]"}`}
      title="Sucursal activa"
    >
      <MapPin
        size={full ? 16 : 14}
        className="pointer-events-none absolute left-3 text-brand-600"
      />
      <select
        aria-label="Sucursal activa"
        value={sucursalActiva?.id ?? ""}
        disabled={loading || sinSucursales}
        onChange={(event) => seleccionarSucursal(event.target.value)}
        className={`w-full appearance-none truncate rounded-xl border bg-white pl-8 pr-3 font-semibold focus:border-brand-500 focus:outline-none disabled:opacity-60 ${
          full ? "border-gray-200 py-3 text-sm" : "py-2 text-xs"
        } ${sucursalActiva ? "border-brand-200 text-brand-700" : "border-gray-200 text-gray-600"}`}
      >
        <option value="">
          {loading ? "Cargando..." : sinSucursales ? "Sin sucursales" : "Elegir sucursal"}
        </option>
        {sucursales.map((sucursal) => (
          <option key={sucursal.id} value={sucursal.id}>
            {sucursal.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
