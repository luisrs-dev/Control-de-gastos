import { TrendingUp, Receipt, BarChart2, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  totalAmount: number;
  totalExpenses: number;
  avgAmount: number;
  byCostCenter: { name: string; total: number }[];
}

export function StatsCards({
  totalAmount,
  totalExpenses,
  avgAmount,
  byCostCenter,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        id="stat-total-amount"
        icon={DollarSign}
        label="Total Gastado"
        value={formatCurrency(totalAmount)}
        color="from-blue-500 to-blue-600"
      />
      <StatCard
        id="stat-total-expenses"
        icon={Receipt}
        label="Comprobantes"
        value={totalExpenses.toString()}
        color="from-violet-500 to-violet-600"
      />
      <StatCard
        id="stat-avg-amount"
        icon={TrendingUp}
        label="Promedio por Gasto"
        value={formatCurrency(avgAmount)}
        color="from-emerald-500 to-emerald-600"
      />
      <StatCard
        id="stat-cost-centers"
        icon={BarChart2}
        label="Centros Activos"
        value={byCostCenter.length.toString()}
        color="from-orange-500 to-orange-600"
      />
    </div>
  );
}

function StatCard({
  id,
  icon: Icon,
  label,
  value,
  color,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm flex flex-col gap-3"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
        <p className="text-xl font-bold text-[var(--foreground)] mt-0.5 tabular-nums">{value}</p>
      </div>
    </div>
  );
}
