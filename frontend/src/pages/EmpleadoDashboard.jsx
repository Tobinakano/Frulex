import { ClipboardCheck } from "lucide-react";

export default function EmpleadoDashboard() {
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6 py-12">
      <div className="w-full rounded-3xl border border-brand-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ClipboardCheck size={28} />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
          Bienvenido Empleado
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Has iniciado sesión con el rol de Empleado de Sucursal.
        </p>
      </div>
    </main>
  );
}
