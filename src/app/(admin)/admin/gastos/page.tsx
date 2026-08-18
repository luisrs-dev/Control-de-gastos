import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllExpenses } from "@/actions/expense.actions";
import { getUsers, getCostCenters } from "@/actions/admin.actions";
import { formatCurrency, formatDate, expenseTypeLabel } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, Eye, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Todos los Gastos" };

const typeColors: Record<string, string> = {
  SUPERMARKET: "bg-green-100 text-green-700",
  RECEIPT: "bg-blue-100 text-blue-700",
  INVOICE: "bg-purple-100 text-purple-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default async function AdminExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    costCenterId?: string;
    userId?: string;
    expenseType?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const [result, users, costCenters] = await Promise.all([
    getAllExpenses({ ...params, page }),
    getUsers(),
    getCostCenters(true),
  ]);

  if ("error" in result) return <p className="text-red-500">{result.error}</p>;

  const { expenses, total, pages } = result;

  function buildUrl(override: Record<string, string>) {
    const p = new URLSearchParams({ ...params, ...override });
    return `/admin/gastos?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Todos los Gastos</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {total} {total === 1 ? "gasto" : "gastos"} encontrados
          </p>
        </div>
        <Button asChild id="admin-new-expense-btn">
          <Link href="/gastos/nuevo">
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <form
        id="expenses-filter-form"
        method="GET"
        action="/admin/gastos"
        className="bg-white rounded-2xl border border-[var(--border)] p-4 shadow-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-[var(--muted-foreground)] mb-1 block" htmlFor="from-input">Desde</label>
            <Input
              id="from-input"
              name="from"
              type="date"
              defaultValue={params.from}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted-foreground)] mb-1 block" htmlFor="to-input">Hasta</label>
            <Input
              id="to-input"
              name="to"
              type="date"
              defaultValue={params.to}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Centro de Costo</label>
            <select
              name="costCenterId"
              defaultValue={params.costCenterId ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Todos</option>
              {costCenters.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Tipo</label>
            <select
              name="expenseType"
              defaultValue={params.expenseType ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Todos</option>
              <option value="SUPERMARKET">Supermercado</option>
              <option value="RECEIPT">Boleta</option>
              <option value="INVOICE">Factura</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button id="apply-expense-filters-btn" type="submit" size="sm">
            Filtrar
          </Button>
          <Button
            id="clear-expense-filters-btn"
            type="button"
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/admin/gastos">Limpiar</Link>
          </Button>
        </div>
      </form>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <Link
            key={expense.id}
            href={`/admin/gastos/${expense.id}`}
            className="block bg-white rounded-2xl border border-[var(--border)] p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              {expense.imageUrl ? (
                <Image
                  src={expense.imageUrl}
                  alt="Comprobante"
                  width={56}
                  height={56}
                  unoptimized={expense.imageUrl.startsWith("/")}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[var(--border)]"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-[var(--muted-foreground)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm truncate">{expense.merchant}</p>
                  <p className="font-bold text-[var(--primary)] text-sm whitespace-nowrap">
                    {formatCurrency(Number(expense.amount))}
                  </p>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {formatDate(expense.date)} · {expense.costCenter.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {expense.user.name || expense.user.email}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-[var(--muted-foreground)] w-16">Foto</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--muted-foreground)]">Comercio</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--muted-foreground)]">Usuario</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--muted-foreground)]">Centro</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--muted-foreground)]">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--muted-foreground)]">Tipo</th>
              <th className="text-right px-4 py-3 font-semibold text-[var(--muted-foreground)]">Monto</th>
              <th className="text-center px-4 py-3 font-semibold text-[var(--muted-foreground)]">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-[var(--accent)] transition-colors">
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 font-medium">{expense.merchant}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)] text-xs">
                  {expense.user.name || expense.user.email}
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {expense.costCenter.name}
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${typeColors[expense.expenseType] ?? ""}`}
                  >
                    {expenseTypeLabel(expense.expenseType)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-[var(--primary)]">
                  {formatCurrency(Number(expense.amount))}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/admin/gastos/${expense.id}`}
                      aria-label={`Ver detalle de ${expense.merchant}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border)]">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-[var(--muted-foreground)]">No se encontraron gastos con los filtros aplicados.</p>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
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
    </div>
  );
}
