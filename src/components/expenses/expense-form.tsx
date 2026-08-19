"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/expenses/image-uploader";
import { createExpense, updateExpense } from "@/actions/expense.actions";
import { expenseTypeLabel } from "@/lib/utils";
import type { CostCenter, AiExtractedData } from "@/types";

const schema = z.object({
  imageUrl: z.string().optional(),
  costCenterId: z.string().min(1, "Selecciona un Centro de Costo"),
  merchant: z.string().min(1, "El comercio/proveedor es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  amount: z.number({ message: "El monto es requerido" }).positive("El monto debe ser mayor a 0"),
  expenseType: z.enum(["SUPERMARKET", "RECEIPT", "INVOICE", "OTHER"]),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ExpenseFormProps {
  costCenters: CostCenter[];
  redirectPath?: string;
  expenseId?: string;
  initialData?: FormData;
}

export function ExpenseForm({
  costCenters,
  redirectPath = "/gastos",
  expenseId,
  initialData,
}: ExpenseFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData ?? {
      expenseType: "RECEIPT",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const expenseType = watch("expenseType");
  const costCenterId = watch("costCenterId");

  // Called when image is successfully uploaded
  const handleImageUploaded = (url: string) => {
    setValue("imageUrl", url);
  };

  // Called when Gemini returns extracted data
  const handleAiData = (data: AiExtractedData) => {
    if (data.merchant) setValue("merchant", data.merchant);
    if (data.amount) setValue("amount", data.amount);
    if (data.date) setValue("date", data.date.split("T")[0]);
    if (data.expenseType) setValue("expenseType", data.expenseType);
  };

  const onSubmit = async (data: FormData) => {
    const result = expenseId
      ? await updateExpense(expenseId, data)
      : await createExpense(data);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(expenseId ? "Gasto actualizado correctamente" : "Gasto registrado exitosamente");
    router.push(redirectPath);
  };

  return (
    <form
      id="expense-form"
      onSubmit={handleSubmit(onSubmit as any)}
      className="space-y-6"
      noValidate
    >
      {/* Image + AI section */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <ImageUploader
          onImageUploaded={handleImageUploaded}
          onAiDataExtracted={handleAiData}
          currentImageUrl={initialData?.imageUrl}
        />
      </div>

      {/* Form fields */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm space-y-5">
        <h2 className="font-semibold text-[var(--foreground)]">Detalle del Gasto</h2>

        {/* Centro de Costo */}
        <div className="space-y-1.5">
          <Label htmlFor="costCenterId">
            Centro de Costo <span className="text-red-500">*</span>
          </Label>
          <Select
            value={costCenterId || ""}
            onValueChange={(v) => setValue("costCenterId", v || "", { shouldValidate: true })}
          >
            <SelectTrigger id="costCenterId" aria-describedby="costCenterId-error">
              <SelectValue placeholder="Selecciona un centro...">
                {(value) =>
                  costCenters.find((costCenter) => costCenter.id === value)?.name ??
                  "Selecciona un centro..."
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {costCenters.map((cc) => (
                <SelectItem key={cc.id} value={cc.id}>
                  {cc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.costCenterId && (
            <p id="costCenterId-error" className="text-red-500 text-xs">
              {errors.costCenterId.message}
            </p>
          )}
          {costCenters.length === 0 && (
            <p className="text-amber-600 text-xs">
              No tienes Centros de Costo asignados. Solicita la asignación a un administrador.
            </p>
          )}
        </div>

        {/* Comercio */}
        <div className="space-y-1.5">
          <Label htmlFor="merchant">
            Comercio / Proveedor <span className="text-red-500">*</span>
          </Label>
          <Input
            id="merchant"
            placeholder="Ej: Walmart, Shell, etc."
            {...register("merchant")}
            aria-describedby="merchant-error"
          />
          {errors.merchant && (
            <p id="merchant-error" className="text-red-500 text-xs">
              {errors.merchant.message}
            </p>
          )}
        </div>

        {/* Monto + Fecha (2 cols on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">
              Monto (CLP) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
              aria-describedby="amount-error"
            />
            {errors.amount && (
              <p id="amount-error" className="text-red-500 text-xs">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">
              Fecha <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              aria-describedby="date-error"
            />
            {errors.date && (
              <p id="date-error" className="text-red-500 text-xs">
                {errors.date.message}
              </p>
            )}
          </div>
        </div>

        {/* Tipo de Gasto */}
        <div className="space-y-1.5">
          <Label htmlFor="expenseType">Tipo de Comprobante</Label>
          <Select
            value={expenseType}
            onValueChange={(v) =>
              setValue("expenseType", v as FormData["expenseType"], { shouldValidate: true })
            }
          >
            <SelectTrigger id="expenseType">
              <SelectValue>
                {(value) => expenseTypeLabel(String(value))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUPERMARKET">🛒 Supermercado</SelectItem>
              <SelectItem value="RECEIPT">🧾 Boleta</SelectItem>
              <SelectItem value="INVOICE">📄 Factura</SelectItem>
              <SelectItem value="OTHER">📎 Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas adicionales</Label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Descripción u observaciones del gasto..."
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            {...register("notes")}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        id="save-expense-btn"
        type="submit"
        disabled={isSubmitting || costCenters.length === 0}
        className="w-full h-12 text-base font-semibold"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Save className="w-5 h-5 mr-2" />
        )}
        {isSubmitting ? "Guardando..." : expenseId ? "Actualizar Gasto" : "Guardar Gasto"}
      </Button>
    </form>
  );
}
