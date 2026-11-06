import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, ShoppingCart, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SucursalSelector from "./SucursalSelector";
const ROLE_LINKS = {
  admin: { path: "/admin", label: "Panel Admin" },
  gerente: { path: "/gerente", label: "Panel Gerente" },
  empleado: { path: "/empleado", label: "Panel Empleado" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleLink = user ? ROLE_LINKS[user.rol] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-brand-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
            <Leaf size={20} />
          </span>
          <span>Frulex</span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hidden text-sm font-medium transition sm:inline-block ${
                isActive ? "text-brand-700 font-semibold" : "text-gray-600 hover:text-brand-600"
              }`
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/catalogo"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? "text-brand-700 font-semibold" : "text-gray-600 hover:text-brand-600"
              }`
            }
          >
            Catálogo
          </NavLink>

          <NavLink
            to="/ofertas"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? "text-brand-700 font-semibold" : "text-gray-600 hover:text-brand-600"
              }`
            }
          >
            Ofertas
          </NavLink>

          {user && (user.rol === "cliente" || user.rol === "admin") && (
            <NavLink
              to="/carrito-b2b"
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-brand-700 font-semibold" : "text-gray-600 hover:text-brand-600"
                }`
              }
            >
              Carrito B2B
            </NavLink>
          )}

          {roleLink && (
            <NavLink
              to={roleLink.path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                }`
              }
            >
              {roleLink.label}
            </NavLink>
          )}

          <SucursalSelector />

          <Link
            to="/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
            aria-label="Carrito de compras"
          >
            <ShoppingCart size={19} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{user.nombre}</p>
                <p className="text-[11px] capitalize text-brand-700 font-medium">{user.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="Cerrar sesión"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                <UserRound size={17} />
                <span>Ingresar</span>
              </Link>
              <Link
                to="/registro"
                className="hidden rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:inline-block"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
