"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteExpense } from "@/actions/expense.actions";
import { Button } from "@/components/ui/button";

export function DeleteExpenseButton({ expenseId, redirectPath }: { expenseId: string; redirectPath: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este gasto? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    const result = await deleteExpense(expenseId);
    if (result.error) {
      setLoading(false);
      toast.error(result.error);
      return;
    }
    toast.success("Gasto eliminado correctamente");
    router.push(redirectPath);
    router.refresh();
  };

  return (
    <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
      <Trash2 className="w-4 h-4 mr-2" />
      {loading ? "Eliminando..." : "Eliminar gasto"}
    </Button>
  );
}
