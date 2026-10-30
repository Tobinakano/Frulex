import { ShoppingBasket } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      {product.imagen_url ? (
        <img src={product.imagen_url} alt={product.nombre} className="h-48 w-full object-cover" />
      ) : (
        <div className="flex h-48 items-center justify-center bg-brand-50 text-5xl">🍎</div>
      )}
      <div className="p-4">
        <p className="text-sm text-brand-600">{product.categoria}</p>
        <h3 className="mt-1 text-lg font-semibold">{product.nombre}</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold">${Number(product.precio).toFixed(2)}</span>
          <button onClick={() => addItem(product)} className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700">
            <ShoppingBasket size={16} /> Añadir
          </button>
        </div>
      </div>
    </article>
  );
}
