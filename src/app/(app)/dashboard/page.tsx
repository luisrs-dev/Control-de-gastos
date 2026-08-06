import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          ¡Bienvenido, {session.user.name || session.user.email}!
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Aquí puedes registrar y consultar tus gastos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/gastos/nuevo"
          id="new-expense-card"
          className="group block bg-[var(--primary)] text-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl mb-3">📸</div>
          <h2 className="font-bold text-lg">Registrar Gasto</h2>
          <p className="text-white/70 text-sm mt-1">
            Sube una foto de tu boleta o factura y la IA extrae los datos automáticamente.
          </p>
        </a>

        <a
          href="/gastos"
          id="my-expenses-card"
          className="group block bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
        >
          <div className="text-3xl mb-3">📋</div>
          <h2 className="font-bold text-lg text-[var(--foreground)]">Mis Gastos</h2>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Consulta el historial de todos tus gastos registrados.
          </p>
        </a>
      </div>
    </div>
  );
}
