"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { formatCurrency, expenseTypeLabel } from "@/lib/utils";

const COLORS = ["hsl(220,80%,55%)", "hsl(175,70%,45%)", "hsl(70,65%,50%)", "hsl(320,65%,55%)", "hsl(35,75%,55%)"];

interface ExpenseChartProps {
  byCostCenter: { name: string; total: number }[];
  byMonth: { month: string; total: number }[];
  byType: { type: string; total: number }[];
}

export function ExpenseChart({ byCostCenter, byMonth, byType }: ExpenseChartProps) {
  const typeData = byType.map((t) => ({
    ...t,
    label: expenseTypeLabel(t.type),
  }));

  const monthData = byMonth.map((m) => ({
    ...m,
    label: new Date(m.month + "-01").toLocaleDateString("es-CL", {
      month: "short",
      year: "2-digit",
    }),
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Bar chart: by cost center */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-[var(--muted-foreground)] mb-4">
          Gastos por Centro de Costo
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCostCenter} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value) || 0), "Total"]}
              contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)" }}
            />
            <Bar dataKey="total" fill="hsl(220,80%,55%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie: by type */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-[var(--muted-foreground)] mb-4">
          Por Tipo de Comprobante
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={typeData}
              dataKey="total"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {typeData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value) || 0), "Total"]}
              contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line: monthly trend */}
      <div className="xl:col-span-3 bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-[var(--muted-foreground)] mb-4">
          Tendencia Mensual (últimos 6 meses)
        </h3>
        {monthData.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)] py-12 text-sm">
            Sin datos suficientes para el período
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthData} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value) || 0), "Total"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="hsl(220,80%,55%)"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(220,80%,55%)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
