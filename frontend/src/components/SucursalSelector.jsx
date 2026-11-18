<<<<<<< HEAD
import { MapPin } from "lucide-react";
=======
import { ChevronDown, MapPin } from "lucide-react";
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
import { useSucursal } from "../context/SucursalContext";

export default function SucursalSelector({ variant = "compact" }) {
  const { sucursales, sucursalActiva, seleccionarSucursal, loading } = useSucursal();
  const full = variant === "full";
  const sinSucursales = !loading && sucursales.length === 0;

  return (
    <label
<<<<<<< HEAD
      className={`relative flex items-center ${full ? "w-full" : "max-w-[10.5rem]"}`}
      title="Sucursal activa"
    >
      <MapPin
        size={full ? 16 : 14}
        className="pointer-events-none absolute left-3 text-brand-600"
      />
=======
      className={`group relative flex items-center ${full ? "w-full" : "max-w-[13rem]"}`}
      title="Sucursal activa"
    >
      <span
        className={`pointer-events-none absolute left-3 flex items-center justify-center rounded-lg transition-colors ${
          sucursalActiva ? "text-brand-600" : "text-gray-400 group-hover:text-brand-600"
        }`}
      >
        <MapPin size={full ? 17 : 15} />
      </span>
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
      <select
        aria-label="Sucursal activa"
        value={sucursalActiva?.id ?? ""}
        disabled={loading || sinSucursales}
        onChange={(event) => seleccionarSucursal(event.target.value)}
<<<<<<< HEAD
        className={`w-full appearance-none truncate rounded-xl border bg-white pl-8 pr-3 font-semibold focus:border-brand-500 focus:outline-none disabled:opacity-60 ${
          full ? "border-gray-200 py-3 text-sm" : "py-2 text-xs"
        } ${sucursalActiva ? "border-brand-200 text-brand-700" : "border-gray-200 text-gray-600"}`}
=======
        className={`w-full cursor-pointer appearance-none truncate rounded-2xl border bg-white pl-9 pr-8 font-semibold shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
          full ? "py-3 text-sm" : "py-2 text-xs"
        } ${
          sucursalActiva
            ? "border-brand-200 bg-brand-50/40 text-brand-800 hover:border-brand-300"
            : "border-gray-200/90 text-gray-700 hover:border-brand-300"
        }`}
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
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
<<<<<<< HEAD
=======
      <ChevronDown
        size={full ? 16 : 14}
        className="pointer-events-none absolute right-2.5 text-gray-400 transition-transform group-hover:text-brand-600"
      />
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
    </label>
  );
}
