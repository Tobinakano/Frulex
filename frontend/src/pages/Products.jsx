import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/productos/").then(({ data }) => setProducts(data)).catch(() => setError("No se pudo cargar el catálogo."));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">Catálogo de productos</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {!error && products.length === 0 && <p className="mt-6 text-gray-500">Aún no hay productos disponibles.</p>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </main>
  );
}
