import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getExpenseById } from "@/actions/expense.actions";
import { formatCurrency, formatDate, expenseTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ImageIcon, Calendar, Store, Banknote, Tag, FileText } from "lucide-react";
import type { Metadata } from "next";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";

export const metadata: Metadata = { title: "Detalle del Gasto" };

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expense = await getExpenseById(id);
  if (!expense) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gastos">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Mis Gastos
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Image — 60% on desktop */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            {expense.imageUrl ? (
              <div className="relative">
                <Image
                  src={expense.imageUrl}
                  alt={`Comprobante de ${expense.merchant}`}
                  width={800}
                  height={600}
                  unoptimized={expense.imageUrl.startsWith("/")}
                  className="w-full object-contain max-h-[70vh]"
                  priority
                />
                <a
                  href={expense.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Ver original
                </a>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)]">
                <ImageIcon className="w-12 h-12 opacity-30" />
                <p className="text-sm">Sin comprobante adjunto</p>
              </div>
            )}
          </div>
        </div>

        {/* Details — 40% on desktop */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm space-y-4">
            <h1 className="text-xl font-bold text-[var(--foreground)]">{expense.merchant}</h1>

            <div className="text-3xl font-bold text-[var(--primary)]">
              {formatCurrency(Number(expense.amount))}
            </div>

            <div className="space-y-3 pt-2 border-t border-[var(--border)]">
              <DetailRow icon={Calendar} label="Fecha" value={formatDate(expense.date)} />
              <DetailRow icon={Store} label="Comercio" value={expense.merchant} />
              <DetailRow
                icon={Tag}
                label="Tipo"
                value={expenseTypeLabel(expense.expenseType)}
              />
              <DetailRow icon={Banknote} label="Monto" value={formatCurrency(Number(expense.amount))} />
              <DetailRow
                icon={FileText}
                label="Centro de Costo"
                value={expense.costCenter.name}
              />
              {expense.notes && (
                <DetailRow icon={FileText} label="Notas" value={expense.notes} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <Link href={`/gastos/${expense.id}/editar`}>Editar gasto</Link>
            </Button>
            <DeleteExpenseButton expenseId={expense.id} redirectPath="/gastos" />
          </div>

          {/* AI Data (if available) */}
          {expense.rawAiData && (
            <details className="bg-[var(--muted)] rounded-2xl p-4 text-xs text-[var(--muted-foreground)]">
              <summary className="cursor-pointer font-medium text-sm mb-2">
                🤖 Datos extraídos por IA
              </summary>
              <pre className="overflow-auto whitespace-pre-wrap break-all mt-2">
                {JSON.stringify(expense.rawAiData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
        <p className="text-sm font-medium text-[var(--foreground)]">{value}</p>
      </div>
    </div>
  );
}
