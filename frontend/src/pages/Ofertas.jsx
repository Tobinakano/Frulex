import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Flame, MapPin, Tag } from "lucide-react";
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
      <div className="flex flex-col justify-between gap-6 rounded-4xl border border-brand-100/90 bg-white p-6 shadow-soft md:flex-row md:items-end md:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-200/80">
            <Flame size={13} /> Ofertas por sucursal
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Productos en oferta
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            {sucursalActiva
              ? `Precios especiales vigentes en ${sucursalActiva.nombre} (${sucursalActiva.direccion}).`
              : "Elige una sucursal para ver sus ofertas vigentes."}
          </p>
        </div>
        <div className="w-full md:w-64">
          <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-gray-500">
            <MapPin size={12} className="text-brand-600" />
            <span>Cambiar sucursal activa</span>
          </p>
          <SucursalSelector variant="full" />
        </div>
      </div>

      {!sucursalActiva ? (
        <div className="mt-8 rounded-4xl border border-gray-200/80 bg-white p-12 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-sm">
            <MapPin size={28} />
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-gray-900">Selecciona una sucursal</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
            Las ofertas cambian según la sucursal. Elígela en el selector superior para consultar
            los descuentos exclusivos de tu zona.
          </p>
        </div>
      ) : ofertasLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-80 animate-pulse rounded-3xl border border-gray-100 bg-white p-4 shadow-soft"
            >
              <div className="h-44 rounded-2xl bg-gray-100" />
              <div className="mt-4 h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="mt-8 rounded-4xl border border-gray-200/80 bg-white p-12 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-harvest-50 text-harvest-600">
            <Tag size={24} />
          </div>
          <p className="mt-4 text-base font-extrabold text-gray-800">
            No hay ofertas vigentes en {sucursalActiva.nombre} por ahora.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Prueba con otra sucursal o revisa nuestro catálogo completo.
          </p>
          <Link
            to="/catalogo"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <span>Explorar catálogo completo</span>
            <ArrowRight size={14} />
          </Link>
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
