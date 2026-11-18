import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Lock, Mail, Sparkles, User } from "lucide-react";
import api from "../services/api";

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", correo: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/registro", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-6 py-12">
      <form
        onSubmit={submit}
        className="w-full rounded-4xl border border-brand-100/90 bg-white p-8 shadow-elevated"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25">
          <Leaf size={24} />
        </div>
        <h1 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-gray-900">
          Crear cuenta en Frulex
        </h1>
        <p className="mt-1.5 text-center text-xs font-medium text-gray-500">
          Regístrate gratis para llenar tu carrito y recibir tus compras a domicilio
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block text-xs font-bold text-gray-700">
            Nombre completo
            <div className="relative mt-1.5">
              <User
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                required
                minLength={2}
                type="text"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-cream-50/40 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </label>

          <label className="block text-xs font-bold text-gray-700">
            Correo electrónico
            <div className="relative mt-1.5">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                required
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-cream-50/40 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </label>

          <label className="block text-xs font-bold text-gray-700">
            Contraseña (mínimo 8 caracteres)
            <div className="relative mt-1.5">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                required
                minLength={8}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-cream-50/40 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </label>
        </div>

        <button
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition-all hover:from-brand-700 hover:to-brand-800 disabled:opacity-50"
        >
          <span>{loading ? "Creando cuenta..." : "Registrarme"}</span>
          {!loading && <ArrowRight size={16} />}
        </button>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400">
          <Sparkles size={13} className="text-brand-600" />
          <span>Disfruta ofertas por sucursal y envíos gratis</span>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4 text-center text-xs text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-extrabold text-brand-700 hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </main>
  );
}
