import type { Metadata } from "next";
import { getCostCenters } from "@/actions/admin.actions";
import { CostCentersClient } from "@/components/admin/cost-centers-client";

export const metadata: Metadata = { title: "Centros de Costo" };

export default async function CostCentersPage() {
  const costCenters = await getCostCenters(true); // include inactive
  return (
    <div className="space-y-6">
      <CostCentersClient initialCostCenters={costCenters} />
    </div>
  );
}
