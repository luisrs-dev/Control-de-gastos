import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getExpenseById } from "@/actions/expense.actions";
import { formatCurrency, formatDate, expenseTypeLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  ImageIcon,
  Calendar,
  Store,
  Banknote,
  Tag,
  FileText,
  User,
  Building2,
  Download,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle del Gasto" };

export default async function AdminExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expense = await getExpenseById(id);
  if (!expense) notFound();

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/gastos">Gastos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detalle</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/gastos">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Gastos
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          {expense.merchant}
        </h1>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Image — 60% */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <p className="text-sm font-semibold text-[var(--foreground)]">Comprobante</p>
              {expense.imageUrl && (
                <a
                  href={expense.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
                  aria-label="Ver imagen original en nueva pestaña"
                >
                  <Download className="w-3 h-3" />
                  Ver original
                </a>
              )}
            </div>

            {expense.imageUrl ? (
              <div className="relative min-h-[300px] max-h-[75vh] overflow-auto">
                <Image
                  src={expense.imageUrl}
                  alt={`Comprobante de ${expense.merchant}`}
                  width={1200}
                  height={900}
                  unoptimized={expense.imageUrl.startsWith("/")}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
                <ImageIcon className="w-16 h-16 opacity-20" />
                <p className="text-sm">Sin comprobante adjunto para este gasto</p>
              </div>
            )}
          </div>
        </div>

        {/* Details — 40% */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main details */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-3xl font-bold text-[var(--primary)] tabular-nums">
                {formatCurrency(Number(expense.amount))}
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Registrado el {formatDate(expense.createdAt)}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--border)]">
              <DetailRow icon={Store} label="Comercio" value={expense.merchant} />
              <DetailRow icon={Calendar} label="Fecha del gasto" value={formatDate(expense.date)} />
              <DetailRow
                icon={Banknote}
                label="Monto"
                value={formatCurrency(Number(expense.amount))}
              />
              <DetailRow
                icon={Tag}
                label="Tipo de comprobante"
                value={expenseTypeLabel(expense.expenseType)}
              />
              <DetailRow icon={Building2} label="Centro de Costo" value={expense.costCenter.name} />
              <DetailRow
                icon={User}
                label="Registrado por"
                value={expense.user.name || expense.user.email}
              />
              {expense.notes && (
                <DetailRow icon={FileText} label="Notas" value={expense.notes} />
              )}
            </div>
          </div>

          {/* Edit link */}
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/admin/gastos/${expense.id}/editar`}>
              Editar este gasto
            </Link>
          </Button>

          {/* AI Data */}
          {expense.rawAiData && (
            <details className="bg-[var(--muted)] rounded-2xl p-4">
              <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                🤖 Datos extraídos por IA
              </summary>
              <pre className="text-xs text-[var(--muted-foreground)] overflow-auto whitespace-pre-wrap break-all mt-3 font-mono">
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
      <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
      </div>
      <div>
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
        <p className="text-sm font-medium text-[var(--foreground)] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
