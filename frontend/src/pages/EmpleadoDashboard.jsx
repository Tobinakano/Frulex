import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, Store } from "lucide-react";
import DespachosPanel from "../components/DespachosPanel";

export default function EmpleadoDashboard() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div className="w-full rounded-4xl border border-brand-100/90 bg-white p-10 text-center shadow-elevated">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20">
          <ClipboardCheck size={30} />
        </div>
        <span className="mt-4 inline-block rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          Operación de Sucursal
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
          Bienvenido Empleado
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Has iniciado sesión con el rol de Empleado de Sucursal en Cali.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Store size={15} />
            <span>Consultar Catálogo</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <DespachosPanel />
    </main>
  );
}
