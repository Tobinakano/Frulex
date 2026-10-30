import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(form.correo, form.password);
      const destinations = {
        admin: "/admin",
        gerente: "/gerente",
        empleado: "/empleado",
      };
      navigate(destinations[user.rol] || "/catalogo");
    }
    catch { setError("Correo o contraseña incorrectos."); }
  };

  return <AuthForm title="Iniciar sesión" submit={submit} form={form} setForm={setForm} error={error} footer={<Link to="/registro" className="text-brand-600">Crear una cuenta</Link>} />;
}

function AuthForm({ title, submit, form, setForm, error, footer }) {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <form onSubmit={submit} className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{title}</h1>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <label className="mt-6 block text-sm font-medium">Correo<input required type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
        <label className="mt-4 block text-sm font-medium">Contraseña<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
        <button className="mt-6 w-full rounded-lg bg-brand-600 p-3 font-semibold text-white hover:bg-brand-700">{title}</button>
        <div className="mt-4 text-center text-sm">{footer}</div>
      </form>
    </main>
  );
}
