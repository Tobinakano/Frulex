import { Link } from "react-router-dom";
import { ArrowRight, Package, ShieldCheck, Store } from "lucide-react";

export default function AdminDashboard() {
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6 py-12">
      <div className="w-full rounded-4xl border border-brand-100/90 bg-white p-10 text-center shadow-elevated">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20">
          <ShieldCheck size={30} />
        </div>
        <span className="mt-4 inline-block rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          Panel de Control
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
          Bienvenido Administrador
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Has iniciado sesión con el rol de Administrador General.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Store size={15} />
            <span>Ver Catálogo</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/carrito-b2b"
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
          >
            <Package size={15} />
            <span>Módulo B2B</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
