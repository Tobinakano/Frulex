import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, removeItem, total } = useCart();
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Tu carrito</h1>
      {items.length === 0 ? <p className="mt-6">Tu carrito está vacío. <Link className="text-brand-600" to="/productos">Ver productos</Link></p> : <div className="mt-8 space-y-4">{items.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"><div><h2 className="font-semibold">{item.nombre}</h2><p>{item.quantity} x ${Number(item.precio).toFixed(2)}</p></div><button onClick={() => removeItem(item.id)} className="text-sm text-red-600">Eliminar</button></div>)}<div className="flex items-center justify-between border-t pt-6 font-bold">Total: ${total.toFixed(2)}<Link to="/checkout" className="rounded-lg bg-brand-600 px-4 py-2 text-white">Continuar</Link></div></div>}
    </main>
  );
}
