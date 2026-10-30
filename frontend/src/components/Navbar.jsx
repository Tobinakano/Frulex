import { Link } from "react-router-dom";
import { ShoppingCart, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-brand-600">Frulex</Link>
        <div className="flex items-center gap-5">
          <Link to="/productos" className="text-gray-700 hover:text-brand-600">Productos</Link>
          <Link to="/carrito" className="relative text-gray-700" aria-label="Carrito">
            <ShoppingCart size={21} />
            {items.length > 0 && <span className="absolute -right-3 -top-3 rounded-full bg-brand-600 px-1.5 text-xs text-white">{items.length}</span>}
          </Link>
          {user ? (
            <button onClick={logout} className="text-sm text-gray-600 hover:text-brand-600">Salir</button>
          ) : (
            <Link to="/login" aria-label="Iniciar sesión"><UserRound size={21} /></Link>
          )}
        </div>
      </nav>
    </header>
  );
}
