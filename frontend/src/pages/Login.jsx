import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ correo: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(form.correo, form.password);
      const destinations = {
        admin: "/admin",
        gerente: "/gerente",
        empleado: "/empleado",
      };
      if (destinations[user.rol]) {
        navigate(destinations[user.rol], { replace: true });
      } else {
        const redirectTo = location.state?.from || "/catalogo";
        navigate(redirectTo, { replace: true });
      }
    } catch {
      setError("Correo o contraseña incorrectos. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-6 py-12">
      <form
        onSubmit={submit}
        className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-lg shadow-brand-900/5"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
          <Leaf size={22} />
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
          Iniciar sesión en Frulex
        </h1>
        <p className="mt-1 text-center text-xs text-gray-500">
          Ingresa con tu cuenta de cliente o personal de sucursal
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-gray-700">
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
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </label>

          <label className="block text-xs font-semibold text-gray-700">
            Contraseña
            <div className="relative mt-1.5">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </label>
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-brand-600 p-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Iniciar sesión"}
        </button>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center text-xs text-gray-600">
          ¿Aún no tienes una cuenta?{" "}
          <Link to="/registro" className="font-bold text-brand-700 hover:underline">
            Crear una cuenta
          </Link>
        </div>
      </form>
    </main>
  );
}
