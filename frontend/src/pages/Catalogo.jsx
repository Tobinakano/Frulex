import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Lock, MapPin, Search, Sparkles, Tag } from "lucide-react";
import ProductCard from "../components/ProductCard";
import SucursalSelector from "../components/SucursalSelector";
import { useAuth } from "../context/AuthContext";
import { useSucursal } from "../context/SucursalContext";
import api from "../services/api";

export default function Catalogo() {
  const { user } = useAuth();
  const { sucursalActiva, ofertas } = useSucursal();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showAuthBanner, setShowAuthBanner] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/productos")
      .then(({ data }) => {
        setProducts(data);
        setError("");
      })
      .catch(() => setError("No se pudo cargar el catálogo de productos."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.categoria).filter(Boolean)));
    return ["Todas", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todas" || product.categoria === selectedCategory;
      const matchesSearch =
        !search.trim() ||
        product.nombre.toLowerCase().includes(search.trim().toLowerCase()) ||
        product.categoria.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const handleRequireAuth = () => {
    setShowAuthBanner(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="relative overflow-hidden rounded-4xl border border-brand-100/90 bg-white p-6 shadow-soft md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200/70">
                <Tag size={13} /> Catálogo público abierto
              </span>
              {sucursalActiva && (
                <span className="inline-flex items-center gap-1 rounded-full bg-harvest-50 px-3 py-1 text-xs font-bold text-harvest-700 ring-1 ring-harvest-200/80">
                  <Flame size={12} className="text-harvest-500" />
                  {ofertas.length} ofertas en {sucursalActiva.nombre}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Catálogo de productos
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-gray-600">
              Consulta libremente nuestra variedad de frutas y verduras frescas disponibles para
              entrega inmediata.
            </p>
          </div>

          <div className="w-full md:w-64">
            <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-gray-500">
              <MapPin size={12} className="text-brand-600" />
              <span>Sucursal para precios y ofertas</span>
            </p>
            <SucursalSelector variant="full" />
          </div>
        </div>
      </div>

      {!user && showAuthBanner && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-brand-200/90 bg-gradient-to-br from-brand-50/95 via-white to-cream-50 p-6 shadow-soft">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-sm">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Inicia sesión para llenar tu carrito
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Para poder añadir frutas y verduras a tu carrito de compras y programar tu
                  entrega a domicilio, necesitas iniciar sesión o crear una cuenta gratuita.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                to="/login"
                state={{ from: "/catalogo" }}
                className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-brand-700 hover:to-brand-800"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-brand-400 hover:text-brand-700"
              >
                Registrarme
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthBanner(false)}
                className="px-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-col justify-between gap-4 rounded-3xl border border-gray-200/70 bg-white/80 p-4 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/20"
                  : "border border-gray-200/90 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar fruta o verdura..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
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
      ) : !error && filteredProducts.length === 0 ? (
        <div className="mt-10 rounded-4xl border border-gray-200/80 bg-white p-12 text-center shadow-soft">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Sparkles size={22} />
          </div>
          <p className="mt-4 text-base font-extrabold text-gray-800">
            No encontramos productos que coincidan con tu búsqueda.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Intenta con otro término o selecciona otra categoría del catálogo.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onRequireAuth={handleRequireAuth}
            />
          ))}
        </div>
      )}
    </main>
  );
}
