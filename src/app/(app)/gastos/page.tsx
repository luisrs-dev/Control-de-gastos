import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getUserExpenses } from "@/actions/expense.actions";
import { formatCurrency, formatDate, expenseTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, ImageIcon } from "lucide-react";

export const metadata: Metadata = { title: "Mis Gastos" };

const typeColors: Record<string, string> = {
  SUPERMARKET: "bg-green-100 text-green-700",
  RECEIPT: "bg-blue-100 text-blue-700",
  INVOICE: "bg-purple-100 text-purple-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default async function MyExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const result = await getUserExpenses(page, 10);

  if ("error" in result) {
    return <p className="text-red-500">{result.error}</p>;
  }

  const { expenses, total, pages } = result;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Gastos</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {total} {total === 1 ? "gasto registrado" : "gastos registrados"}
          </p>
        </div>
        <Button asChild id="new-expense-btn">
          <Link href="/gastos/nuevo">
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Link>
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border)]">
          <div className="text-5xl mb-4">🧾</div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Sin gastos aún</h2>
          <p className="text-[var(--muted-foreground)] text-sm mt-1 mb-6">
            Comienza registrando tu primer gasto
          </p>
          <Button asChild>
            <Link href="/gastos/nuevo">Registrar primer gasto</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Cards (mobile-friendly) */}
          <div className="space-y-3 md:hidden">
            {expenses.map((expense) => (
              <Link
                key={expense.id}
                href={`/gastos/${expense.id}`}
                className="block bg-white rounded-2xl border border-[var(--border)] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {expense.imageUrl ? (
                    <Image
                      src={expense.imageUrl}
                      alt={`Comprobante de ${expense.merchant}`}
                      width={56}
                      height={56}
                      unoptimized={expense.imageUrl.startsWith("/")}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-[var(--muted-foreground)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold truncate text-sm">{expense.merchant}</p>
                      <p className="font-bold text-[var(--primary)] text-sm ml-2">
                        {formatCurrency(Number(expense.amount))}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {formatDate(expense.date)} · {expense.costCenter.name}
                    </p>
                    <span
                      className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[expense.expenseType] ?? ""}`}
                    >
                      {expenseTypeLabel(expense.expenseType)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Table (desktop) */}
          <div className="hidden md:block bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)] w-16">
                    Foto
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">
                    Comercio
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">
                    Centro de Costo
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">
                    Fecha
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">
                    Tipo
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-[var(--muted-foreground)]">
                    Monto
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-[var(--accent)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      {expense.imageUrl ? (
                        <Image
                          src={expense.imageUrl}
                          alt="Comprobante"
                          width={40}
                          height={40}
                          unoptimized={expense.imageUrl.startsWith("/")}
                          className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/gastos/${expense.id}`} className="hover:underline">
                        {expense.merchant}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">
                      {expense.costCenter.name}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${typeColors[expense.expenseType] ?? ""}`}
                      >
                        {expenseTypeLabel(expense.expenseType)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[var(--primary)]">
                      {formatCurrency(Number(expense.amount))}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/gastos/${expense.id}`}
                          aria-label={`Ver detalle de ${expense.merchant}`}
                        >
                          Ver
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/gastos?page=${p}`}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-[var(--primary)] text-white"
                      : "bg-white border border-[var(--border)] hover:bg-[var(--accent)]"
                  }`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
