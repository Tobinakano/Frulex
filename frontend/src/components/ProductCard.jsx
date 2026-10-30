import { ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const addProduct = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      {product.imagen_url ? (
        <img src={product.imagen_url} alt={product.nombre} className="h-48 w-full object-cover" />
      ) : (
        <div className="flex h-48 items-center justify-center bg-brand-50 text-5xl">🍎</div>
      )}
      <div className="p-4">
        <p className="text-sm text-brand-600">{product.categoria}</p>
        <h2 className="mt-1 text-lg font-semibold">{product.nombre}</h2>
        <p className="mt-3 font-bold">${Number(product.precio).toFixed(2)}</p>
        <div className="mt-4 flex items-center gap-2">
          <label className="sr-only" htmlFor={`quantity-${product.id}`}>Cantidad</label>
          <input
            id={`quantity-${product.id}`}
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="w-20 rounded-lg border p-2"
          />
          <button onClick={addProduct} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700">
            <ShoppingBasket size={16} /> Añadir
          </button>
        </div>
      </div>
    </article>
  );
}
