import type { Metadata } from "next";
import { getCostCenters } from "@/actions/admin.actions";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Registrar Gasto" };

export default async function NewExpensePage() {
  const [costCenters, session] = await Promise.all([
    getCostCenters(),
    auth(),
  ]);

  const redirectPath = session?.user?.role === "ADMIN" ? "/admin/gastos" : "/gastos";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Registrar Gasto</h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Sube la foto del comprobante y la IA completará los campos automáticamente.
        </p>
      </div>
      <ExpenseForm costCenters={costCenters} redirectPath={redirectPath} />
    </div>
  );
}
