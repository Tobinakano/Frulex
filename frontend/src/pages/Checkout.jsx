import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("Pago contra entrega");
  const [status, setStatus] = useState({ loading: false, error: "", confirmed: false });

  if (status.confirmed) {
    return <main className="mx-auto max-w-2xl px-6 py-10"><h1 className="text-3xl font-bold text-brand-700">Pedido confirmado</h1><p className="mt-4">Tu pago fue procesado exitosamente.</p><Link className="mt-6 inline-block text-brand-600" to="/catalogo">Volver al catálogo</Link></main>;
  }

  if (!items.length) {
    return <main className="mx-auto max-w-2xl px-6 py-10"><p>No hay productos para comprar. <Link className="text-brand-600" to="/catalogo">Volver al catálogo</Link></p></main>;
  }

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", confirmed: false });
    try {
      await api.post("/checkout", {
        productos: items.map((item) => ({ id: item.id, nombre: item.nombre, cantidad: item.quantity, precio: Number(item.precio) })),
        total: Number(total.toFixed(2)),
        metodo_pago: paymentMethod,
      });
      clearCart();
      setStatus({ loading: false, error: "", confirmed: true });
    } catch {
      setStatus({ loading: false, error: "No se pudo procesar el pago. Inténtalo nuevamente.", confirmed: false });
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Resumen de compra</h2>
        <ul className="mt-4 space-y-2">{items.map((item) => <li key={item.id} className="flex justify-between"><span>{item.nombre} x {item.quantity}</span><span>${(Number(item.precio) * item.quantity).toFixed(2)}</span></li>)}</ul>
        <p className="mt-4 border-t pt-4 text-right text-xl font-bold">Total: ${total.toFixed(2)}</p>
      </div>
      <form className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm" onSubmit={submit}>
        <label className="block text-sm font-medium">Dirección de entrega<input required className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="block text-sm font-medium">Método de pago<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-1 w-full rounded-lg border p-3"><option>Pago contra entrega</option><option>Tarjeta simulada</option></select></label>
        {status.error && <p className="text-sm text-red-600">{status.error}</p>}
        <button disabled={status.loading} className="w-full rounded-lg bg-brand-600 p-3 font-semibold text-white disabled:opacity-50">{status.loading ? "Procesando..." : "Confirmar pedido"}</button>
      </form>
    </main>
  );
}
