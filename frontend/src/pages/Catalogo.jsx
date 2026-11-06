import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Search, Tag } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Catalogo() {
  const { user } = useAuth();

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
      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm md:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Tag size={13} /> Catálogo público abierto
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            Catálogo de productos
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Consulta libremente nuestra variedad de frutas y verduras frescas disponibles para entrega.
          </p>
        </div>
      </div>

      {!user && showAuthBanner && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/90 via-white to-brand-50/40 p-6 shadow-md">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Inicia sesión para llenar tu carrito
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Para poder añadir frutas y verduras a tu carrito de compras y programar tu entrega a domicilio, necesitas iniciar sesión o crear una cuenta gratuita.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/login"
                state={{ from: "/catalogo" }}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand-400 hover:text-brand-700"
              >
                Registrarme
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthBanner(false)}
                className="px-2 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar fruta o verdura..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
      ) : !error && filteredProducts.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-base font-semibold text-gray-700">
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
