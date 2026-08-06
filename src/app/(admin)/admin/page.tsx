import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/actions/admin.actions";
import { getCostCenters } from "@/actions/admin.actions";
import { StatsCards } from "@/components/admin/stats-cards";
import { ExpenseChart } from "@/components/admin/expense-chart";
import { DashboardFilters } from "@/components/admin/dashboard-filters";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ costCenterId?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const { costCenterId, from, to } = params;

  const [stats, costCenters] = await Promise.all([
    getDashboardStats({ costCenterId, from, to }),
    getCostCenters(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Resumen de gastos por centro de costo
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
      <DashboardFilters costCenters={costCenters} />

      {/* Stats */}
      {stats ? (
        <>
          <StatsCards
            totalAmount={stats.totalAmount}
            totalExpenses={stats.totalExpenses}
            avgAmount={stats.avgAmount}
            byCostCenter={stats.byCostCenter}
          />
          <ExpenseChart
            byCostCenter={stats.byCostCenter}
            byMonth={stats.byMonth}
            byType={stats.byType}
          />
        </>
      ) : (
        <p className="text-red-500">Error al cargar estadísticas.</p>
      )}
    </div>
  );
}
