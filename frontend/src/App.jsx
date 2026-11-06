import { Link, Route, Routes } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, ShoppingCart, Store, Truck } from "lucide-react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Carrito from "./pages/Carrito";
import Catalogo from "./pages/Catalogo";
import Checkout from "./pages/Checkout";
import EmpleadoDashboard from "./pages/EmpleadoDashboard";
import GerenteDashboard from "./pages/GerenteDashboard";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <section className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
            <Store size={14} />
            <span>Frescura en cada entrega</span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Frutas y verduras frescas <span className="text-brand-600">directo a tu hogar.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            Explora nuestro catálogo, llena tu carrito de compras con frutas y verduras
            seleccionadas al mejor precio y recibe tu pedido cómodamente en casa.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <span>Explorar catálogo</span>
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/carrito"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
            >
              <ShoppingCart size={17} />
              <span>Ver mi carrito</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-gray-200/80 pt-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Store className="mt-0.5 shrink-0 text-brand-600" size={20} />
              <div>
                <h3 className="text-sm font-bold text-gray-900">100% Frescos</h3>
                <p className="text-xs text-gray-500">Selección diaria del campo</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-brand-600" size={20} />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Compra fácil</h3>
                <p className="text-xs text-gray-500">Añade a tu carrito en segundos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 shrink-0 text-brand-600" size={20} />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Entrega rápida</h3>
                <p className="text-xs text-gray-500">Envíos directos a tu domicilio</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/5">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
              alt="Selección de frutas y verduras frescas en Frulex"
              className="h-72 w-full rounded-2xl object-cover"
            />
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand-50/80 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  Calidad garantizada
                </p>
                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  Productos frescos todos los días
                </p>
              </div>
              <ShieldCheck className="text-brand-600" size={28} />
            </div>
          </div>
        </div>
      </section>
    </main>
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
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["cliente"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
