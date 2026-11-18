<<<<<<< HEAD
import { Store } from "lucide-react";
import DespachosPanel from "../components/DespachosPanel";

export default function GerenteDashboard() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div className="w-full rounded-3xl border border-brand-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Store size={28} />
=======
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Store } from "lucide-react";

export default function GerenteDashboard() {
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6 py-12">
      <div className="w-full rounded-4xl border border-brand-100/90 bg-white p-10 text-center shadow-elevated">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20">
          <Store size={30} />
>>>>>>> 11a030de30c366ba4ee66fc9c7758137a23b57ba
        </div>
        <span className="mt-4 inline-block rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          Gestión de Sucursal
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
          Bienvenido Gerente
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Has iniciado sesión con el rol de Gerente de Sucursal.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/ofertas"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Flame size={15} />
            <span>Ofertas por Sucursal</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <DespachosPanel />
    </main>
  );
}
