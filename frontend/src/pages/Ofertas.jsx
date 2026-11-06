import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Tag } from "lucide-react";
import ProductCard from "../components/ProductCard";
import SucursalSelector from "../components/SucursalSelector";
import { useSucursal } from "../context/SucursalContext";

export default function Ofertas() {
  const { sucursalActiva, ofertas, ofertasLoading } = useSucursal();
  const navigate = useNavigate();

  // ProductCard muestra el precio de oferta a partir del contexto de sucursal,
  // por eso aquí se entrega el producto con su precio original.
  const productos = useMemo(
    () =>
      ofertas.map((oferta) => ({
        id: oferta.id,
        nombre: oferta.nombre,
        categoria: oferta.categoria,
        imagen_url: oferta.imagen_url,
        precio: oferta.precio_original,
      })),
    [ofertas],
  );

  const handleRequireAuth = () => navigate("/login", { state: { from: "/ofertas" } });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-brand-100 bg-white p-6 shadow-sm md:flex-row md:items-end md:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            <Tag size={13} /> Ofertas por sucursal
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            Productos en oferta
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {sucursalActiva
              ? `Precios especiales vigentes en ${sucursalActiva.nombre}.`
              : "Elige una sucursal para ver sus ofertas vigentes."}
          </p>
        </div>
        <div className="w-full md:w-64">
          <SucursalSelector variant="full" />
        </div>
      </div>

      {!sucursalActiva ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <MapPin size={26} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Selecciona una sucursal</h2>
          <p className="mt-1 text-sm text-gray-500">
            Las ofertas cambian según la sucursal. Elígela en el selector para consultarlas.
          </p>
        </div>
      ) : ofertasLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="h-44 rounded-xl bg-gray-100" />
              <div className="mt-4 h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-700">
            No hay ofertas vigentes en {sucursalActiva.nombre} por ahora.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Prueba con otra sucursal o revisa nuestro catálogo completo.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {productos.map((producto) => (
            <ProductCard key={producto.id} product={producto} onRequireAuth={handleRequireAuth} />
          ))}
        </div>
      )}
    </main>
  );
}
