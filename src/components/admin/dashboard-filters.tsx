"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CostCenter } from "@/types";

interface DashboardFiltersProps {
  costCenters: CostCenter[];
}

export function DashboardFilters({ costCenters }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [costCenterId, setCostCenterId] = useState(searchParams.get("costCenterId") ?? "all");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (costCenterId && costCenterId !== "all") params.set("costCenterId", costCenterId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/admin?${params.toString()}`);
  }, [costCenterId, from, to, router]);

  const clearFilters = () => {
    setCostCenterId("all");
    setFrom("");
    setTo("");
    router.push("/admin");
  };

  const hasFilters = (costCenterId && costCenterId !== "all") || from || to;

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">
            Centro de Costo
          </label>
          <Select value={costCenterId} onValueChange={(val) => setCostCenterId(val ?? "all")}>
            <SelectTrigger id="filter-cost-center" className="h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los centros</SelectItem>
              {costCenters.map((cc) => (
                <SelectItem key={cc.id} value={cc.id}>
                  {cc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]" htmlFor="filter-from">
            Desde
          </label>
          <Input
            id="filter-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)]" htmlFor="filter-to">
            Hasta
          </label>
          <Input
            id="filter-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            id="apply-filters-btn"
            onClick={applyFilters}
            size="sm"
            className="h-9 gap-2"
          >
            <Filter className="w-3.5 h-3.5" />
            Filtrar
          </Button>
          {hasFilters && (
            <Button
              id="clear-filters-btn"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
