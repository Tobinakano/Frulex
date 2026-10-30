import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", correo: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    try { await api.post("/auth/registro", form); navigate("/login"); }
    catch (err) { setError(err.response?.data?.detail || "No se pudo crear la cuenta."); }
  };
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <form onSubmit={submit} className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {["nombre", "correo", "password"].map((field) => <label key={field} className="mt-4 block text-sm font-medium">{field === "nombre" ? "Nombre" : field === "correo" ? "Correo" : "Contraseña"}<input required minLength={field === "password" ? 8 : undefined} type={field === "password" ? "password" : field === "correo" ? "email" : "text"} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>)}
        <button className="mt-6 w-full rounded-lg bg-brand-600 p-3 font-semibold text-white">Registrarme</button>
        <p className="mt-4 text-center text-sm"><Link to="/login" className="text-brand-600">Ya tengo una cuenta</Link></p>
      </form>
    </main>
  );
}
