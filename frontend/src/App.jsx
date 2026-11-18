import { Link, Route, Routes } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SucursalSelector from "./components/SucursalSelector";
import { useSucursal } from "./context/SucursalContext";
import AdminDashboard from "./pages/AdminDashboard";
import Carrito from "./pages/Carrito";
import CarritoB2B from "./pages/CarritoB2B";
import Catalogo from "./pages/Catalogo";
import Checkout from "./pages/Checkout";
import EmpleadoDashboard from "./pages/EmpleadoDashboard";
import GerenteDashboard from "./pages/GerenteDashboard";
import Login from "./pages/Login";
import Ofertas from "./pages/Ofertas";
import Registro from "./pages/Registro";

function Home() {
  const { sucursalActiva, ofertas } = useSucursal();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
      <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-sm ring-1 ring-brand-200/80">
            <Sparkles size={14} className="text-brand-600" />
            <span>Frescura en cada entrega · 100% Cosecha Seleccionada</span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Frutas y verduras frescas{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-emerald-600 bg-clip-text text-transparent">
              directo a tu hogar.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Explora nuestro catálogo, selecciona tu sucursal más cercana para aprovechar ofertas
            locales y llena tu carrito de compras con productos frescos al mejor precio.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:from-brand-700 hover:to-brand-800 hover:shadow-lg"
            >
              <span>Explorar catálogo</span>
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/ofertas"
              className="inline-flex items-center gap-2 rounded-2xl border border-harvest-200 bg-harvest-50/80 px-5 py-3.5 text-sm font-bold text-harvest-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-harvest-300 hover:bg-harvest-100/80"
            >
              <Flame size={17} className="text-harvest-500" />
              <span>Ver ofertas</span>
            </Link>
            <Link
              to="/carrito"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/90 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700"
            >
              <ShoppingCart size={17} />
              <span>Ver mi carrito</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-gray-200/80 pt-7 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-3.5 shadow-soft ring-1 ring-gray-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Store size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">100% Frescos</h3>
                <p className="mt-0.5 text-xs text-gray-500">Selección diaria del campo</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-3.5 shadow-soft ring-1 ring-gray-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Compra fácil</h3>
                <p className="mt-0.5 text-xs text-gray-500">Añade a tu carrito en segundos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-3.5 shadow-soft ring-1 ring-gray-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Entrega rápida</h3>
                <p className="mt-0.5 text-xs text-gray-500">Envíos directos a tu domicilio</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-4xl border border-brand-100/90 bg-white p-6 shadow-elevated">
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                alt="Selección de frutas y verduras frescas en Frulex"
                className="h-72 w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between rounded-2xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/20" />
                  <span className="text-xs font-bold text-gray-800">
                    {sucursalActiva ? sucursalActiva.nombre : "3 Sucursales en Cali"}
                  </span>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-700">
                  {ofertas.length > 0 ? `${ofertas.length} ofertas hoy` : "Cosecha hoy"}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50/90 to-cream-50 p-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
                  Calidad garantizada
                </p>
                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  Productos frescos todos los días
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                <ShieldCheck size={26} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-12">
        <div className="flex flex-col justify-between rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:col-span-7 md:flex-row md:items-center md:p-8">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <MapPin size={13} /> Sucursal activa
            </span>
            <h2 className="mt-2.5 text-xl font-extrabold text-gray-900 sm:text-2xl">
              {sucursalActiva
                ? `Comprando en ${sucursalActiva.nombre}`
                : "Elige tu sucursal Frulex más cercana"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {sucursalActiva
                ? `${sucursalActiva.direccion}, ${sucursalActiva.ciudad}. Los precios de oferta se aplican automáticamente a tu carrito.`
                : "Selecciona tu sucursal para desbloquear descuentos exclusivos por tienda y stock local."}
            </p>
          </div>
          <div className="mt-4 w-full md:mt-0 md:w-60">
            <SucursalSelector variant="full" />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-brand-800/20 bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-900 p-6 text-white shadow-soft md:col-span-5 md:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-brand-100 backdrop-blur-sm">
              <Package size={13} /> Mayoristas & Negocios
            </span>
            <h2 className="mt-2.5 text-xl font-extrabold text-white">
              Abastecimiento Frulex B2B
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-brand-100/90 sm:text-sm">
              Descuentos automáticos por volumen (hasta 15% adicional) para restaurantes, hoteles y comercios.
            </p>
          </div>
          <div className="mt-5">
            <Link
              to="/carrito-b2b"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-brand-900 shadow-sm transition hover:bg-brand-50"
            >
              <span>Ir a Pedidos B2B</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-gray-500 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf size={15} />
          </span>
          <span className="font-extrabold text-gray-800">Frulex</span>
          <span>· Frescura del campo directo a tu mesa</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 font-semibold text-gray-600">
          <Link to="/catalogo" className="hover:text-brand-700">
            Catálogo
          </Link>
          <Link to="/ofertas" className="hover:text-brand-700">
            Ofertas
          </Link>
          <Link to="/carrito" className="hover:text-brand-700">
            Carrito
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Catalogo />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/register" element={<Registro />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gerente"
            element={
              <ProtectedRoute allowedRoles={["gerente"]}>
                <GerenteDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/empleado"
            element={
              <ProtectedRoute allowedRoles={["empleado"]}>
                <EmpleadoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carrito"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <Carrito />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carrito-b2b"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <CarritoB2B />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
