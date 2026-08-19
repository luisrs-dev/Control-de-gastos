import { notFound } from "next/navigation";
import { getExpenseById, getExpenseCostCenters } from "@/actions/expense.actions";
import { ExpenseForm } from "@/components/expenses/expense-form";

export default async function AdminEditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expense, costCenters] = await Promise.all([
    getExpenseById(id),
    getExpenseCostCenters(),
  ]);
  if (!expense) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Gasto</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Actualiza los datos y guarda los cambios.</p>
      </div>
      <ExpenseForm
        expenseId={expense.id}
        costCenters={costCenters}
        redirectPath={`/admin/gastos/${expense.id}`}
        initialData={{
          imageUrl: expense.imageUrl ?? undefined,
          costCenterId: expense.costCenterId,
          merchant: expense.merchant,
          date: expense.date.toISOString().slice(0, 10),
          amount: Number(expense.amount),
          expenseType: expense.expenseType,
          notes: expense.notes ?? "",
        }}
      />
    </div>
  );
}
