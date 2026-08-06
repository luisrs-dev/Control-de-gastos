"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createExpenseSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es requerida"),
  merchant: z.string().min(1, "El comercio es requerido"),
  expenseType: z.enum(["SUPERMARKET", "RECEIPT", "INVOICE", "OTHER"]),
  costCenterId: z.string().min(1, "El Centro de Costo es requerido"),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  rawAiData: z.record(z.string(), z.unknown()).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

// ─── Create Expense ───────────────────────────────────────────────────────────
export async function createExpense(data: CreateExpenseInput) {
  const session = await auth();
  if (!session) return { error: "No autorizado" };

  const parsed = createExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { amount, date, merchant, expenseType, costCenterId, notes, imageUrl, rawAiData } =
    parsed.data;

  try {
    const expense = await prisma.expense.create({
      data: {
        amount: new Prisma.Decimal(amount),
        date: new Date(date),
        merchant,
        expenseType,
        costCenterId,
        userId: session.user.id,
        notes,
        imageUrl,
        rawAiData: rawAiData ? (rawAiData as Prisma.InputJsonValue) : undefined,
      },
    });

    revalidatePath("/gastos");
    revalidatePath("/admin");
    revalidatePath("/admin/gastos");

    return { success: true, id: expense.id };
  } catch (error) {
    console.error("Create expense error:", error);
    return { error: "Error al crear el gasto. Inténtalo de nuevo." };
  }
}

// ─── Update Expense ───────────────────────────────────────────────────────────
export async function updateExpense(id: string, data: Partial<CreateExpenseInput>) {
  const session = await auth();
  if (!session) return { error: "No autorizado" };

  // Check ownership unless admin
  if (session.user.role !== "ADMIN") {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== session.user.id) {
      return { error: "No tienes permiso para editar este gasto" };
    }
  }

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        ...(data.amount && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.merchant && { merchant: data.merchant }),
        ...(data.expenseType && { expenseType: data.expenseType }),
        ...(data.costCenterId && { costCenterId: data.costCenterId }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
      },
    });

    revalidatePath("/gastos");
    revalidatePath("/admin/gastos");

    return { success: true };
  } catch (error) {
    console.error("Update expense error:", error);
    return { error: "Error al actualizar el gasto." };
  }
}

// ─── Delete Expense ───────────────────────────────────────────────────────────
export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session) return { error: "No autorizado" };

  if (session.user.role !== "ADMIN") {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== session.user.id) {
      return { error: "No tienes permiso para eliminar este gasto" };
    }
  }

  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/gastos");
    revalidatePath("/admin/gastos");
    return { success: true };
  } catch (error) {
    console.error("Delete expense error:", error);
    return { error: "Error al eliminar el gasto." };
  }
}

// ─── Get User Expenses ────────────────────────────────────────────────────────
export async function getUserExpenses(page = 1, limit = 10) {
  const session = await auth();
  if (!session) return { error: "No autorizado" };

  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: session.user.id },
      include: { costCenter: true, user: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where: { userId: session.user.id } }),
  ]);

  return {
    expenses,
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

// ─── Get All Expenses (Admin) ─────────────────────────────────────────────────
export async function getAllExpenses(filters: {
  costCenterId?: string;
  userId?: string;
  expenseType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const { costCenterId, userId, expenseType, from, to, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ExpenseWhereInput = {
    ...(costCenterId && { costCenterId }),
    ...(userId && { userId }),
    ...(expenseType && { expenseType: expenseType as "SUPERMARKET" | "RECEIPT" | "INVOICE" | "OTHER" }),
    ...(from || to
      ? {
          date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to + "T23:59:59") }),
          },
        }
      : {}),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { costCenter: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

// ─── Get Expense by ID ────────────────────────────────────────────────────────
export async function getExpenseById(id: string) {
  const session = await auth();
  if (!session) return null;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      costCenter: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  // Users can only see their own expenses
  if (!expense) return null;
  if (session.user.role !== "ADMIN" && expense.userId !== session.user.id) return null;

  return expense;
}
