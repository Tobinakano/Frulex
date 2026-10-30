import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";

function Home() {
  return <main className="mx-auto max-w-6xl px-6 py-20"><div className="max-w-2xl"><p className="font-semibold text-brand-600">Frescura en cada entrega</p><h1 className="mt-3 text-5xl font-bold tracking-tight">Frutas frescas para tu día.</h1><p className="mt-6 text-lg text-gray-600">Compra productos seleccionados y recíbelos donde estés.</p><Link to="/productos" className="mt-8 inline-block rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white">Explorar catálogo</Link></div></main>;
}

export default function App() {
  return <><Navbar /><Routes><Route path="/" element={<Home />} /><Route path="/productos" element={<Products />} /><Route path="/login" element={<Login />} /><Route path="/registro" element={<Register />} /><Route path="/carrito" element={<Cart />} /><Route path="/checkout" element={<Checkout />} /></Routes></>;
}
