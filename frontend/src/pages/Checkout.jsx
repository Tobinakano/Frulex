import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { items, total } = useCart();
  if (!items.length) return <main className="mx-auto max-w-2xl px-6 py-10"><p>No hay productos para comprar. <Link className="text-brand-600" to="/productos">Volver al catálogo</Link></p></main>;
  return <main className="mx-auto max-w-2xl px-6 py-10"><h1 className="text-3xl font-bold">Checkout</h1><form className="mt-8 space-y-4 rounded-xl bg-white p-6 shadow-sm" onSubmit={(event) => { event.preventDefault(); alert("Pedido recibido. Integraremos el pago en el siguiente incremento."); }}><label className="block text-sm font-medium">Dirección de entrega<input required className="mt-1 w-full rounded-lg border p-3" /></label><label className="block text-sm font-medium">Método de pago<select className="mt-1 w-full rounded-lg border p-3"><option>Pago contra entrega</option><option>Tarjeta (próximamente)</option></select></label><div className="border-t pt-4 font-bold">Total: ${total.toFixed(2)}</div><button className="w-full rounded-lg bg-brand-600 p-3 font-semibold text-white">Confirmar pedido</button></form></main>;
}
