import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Carrito() {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Tu carrito</h1>
      {items.length === 0 ? (
        <p className="mt-6">Tu carrito está vacío. <Link className="text-brand-600" to="/catalogo">Ver productos</Link></p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm">
              <div>
                <h2 className="font-semibold">{item.nombre}</h2>
                <p className="text-gray-600">${Number(item.precio).toFixed(2)} por unidad</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`cart-quantity-${item.id}`}>Cantidad de {item.nombre}</label>
                <input id={`cart-quantity-${item.id}`} type="number" min="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, event.target.value)} className="w-20 rounded-lg border p-2" />
                <span className="font-semibold">${(Number(item.precio) * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-600">Eliminar</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-6 font-bold">
            <span>Subtotal: ${total.toFixed(2)}</span>
            <Link to="/checkout" className="rounded-lg bg-brand-600 px-4 py-2 text-white">Proceder al pago</Link>
          </div>
        </div>
      )}
    </main>
  );
}
