import { Link, NavLink, useNavigate } from "react-router-dom";
import { Flame, Leaf, LogOut, MapPin, Package, ShoppingCart, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSucursal } from "../context/SucursalContext";
import SucursalSelector from "./SucursalSelector";

const ROLE_LINKS = {
  admin: { path: "/admin", label: "Panel Admin" },
  gerente: { path: "/gerente", label: "Panel Gerente" },
  empleado: { path: "/empleado", label: "Panel Empleado" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { sucursalActiva, ofertas } = useSucursal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleLink = user ? ROLE_LINKS[user.rol] : null;

  const navLinkClass = ({ isActive }) =>
    `relative inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
      isActive
        ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/70"
        : "text-gray-600 hover:bg-gray-100/70 hover:text-brand-700"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/80 bg-white/95 shadow-soft backdrop-blur-xl">
      <div className="border-b border-brand-100/60 bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 px-4 py-1.5 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-[11px] font-medium sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-brand-400/30">
              <Sparkles size={11} /> Fruver Multisede Cali
            </span>
            <span className="text-brand-50">
              Frutas y verduras frescas por libra · Domicilio Express en Cali.
            </span>
          </div>
          <div className="hidden items-center gap-2 text-brand-100 sm:flex">
            <MapPin size={12} className="text-brand-300" />
            {sucursalActiva ? (
              <span>
                Sede activa: <strong className="text-white">{sucursalActiva.nombre}</strong> ({sucursalActiva.direccion})
              </span>
            ) : (
              <span className="text-amber-200 font-semibold">
                Elige tu sede en Cali (Norte, Sur o Centro) para comprar
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-6 py-3.5">
        <Link
          to="/"
          className="group flex items-center gap-3 text-2xl font-extrabold tracking-tight text-brand-800"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25 transition-transform duration-200 group-hover:scale-105">
            <Leaf size={21} />
          </span>
          <div className="flex flex-col">
            <span className="leading-none">Frulex</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-600">
              Fruver Cali
            </span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3">
          <NavLink to="/" end className={navLinkClass}>
            <span>Inicio</span>
          </NavLink>

          <NavLink to="/catalogo" className={navLinkClass}>
            <span>Catálogo</span>
          </NavLink>

          <NavLink to="/ofertas" className={navLinkClass}>
            <Flame size={15} className="text-harvest-500" />
            <span>Ofertas</span>
            {ofertas.length > 0 && (
              <span className="rounded-full bg-harvest-100 px-1.5 py-0.2 text-[10px] font-extrabold text-harvest-700">
                {ofertas.length}
              </span>
            )}
          </NavLink>

          {user && (user.rol === "cliente" || user.rol === "admin") && (
            <NavLink to="/carrito-b2b" className={navLinkClass}>
              <Package size={15} className="text-brand-600" />
              <span>Carrito B2B</span>
            </NavLink>
          )}

          {roleLink && (
            <NavLink
              to={roleLink.path}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-brand-700 text-white shadow-sm"
                    : "bg-brand-50 text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
                }`
              }
            >
              {roleLink.label}
            </NavLink>
          )}

          <div className="hidden h-5 w-px bg-gray-200 md:block" />

          <SucursalSelector />

          <Link
            to="/carrito"
            className="group relative flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200/90 bg-white text-gray-700 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700"
            aria-label="Carrito de compras"
          >
            <ShoppingCart size={19} className="transition-transform group-hover:scale-105" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-extrabold text-white shadow-sm ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 border-l border-gray-200/90 pl-3.5">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold leading-tight text-gray-900">{user.nombre}</p>
                <p className="text-[11px] font-semibold capitalize text-brand-700">{user.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="Cerrar sesión"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-200/90 pl-3.5">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100/80 hover:text-brand-700"
              >
                <UserRound size={17} />
                <span>Ingresar</span>
              </Link>
              <Link
                to="/registro"
                className="hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-md sm:inline-block"
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
