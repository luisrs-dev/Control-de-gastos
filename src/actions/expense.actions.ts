"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

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
    const allowedCostCenter = await prisma.costCenter.findFirst({
      where: {
        id: costCenterId,
        isActive: true,
        ...(session.user.role !== "ADMIN" && {
          users: { some: { id: session.user.id } },
        }),
      },
      select: { id: true },
    });

    if (!allowedCostCenter) {
      return { error: "No tienes permiso para registrar gastos en ese Centro de Costo." };
    }

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

  const parsed = createExpenseSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const updateData = parsed.data;

  // Check ownership unless admin
  if (session.user.role !== "ADMIN") {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== session.user.id) {
      return { error: "No tienes permiso para editar este gasto" };
    }
  }

  try {
    if (updateData.costCenterId) {
      const allowedCostCenter = await prisma.costCenter.findFirst({
        where: {
          id: updateData.costCenterId,
          isActive: true,
          ...(session.user.role !== "ADMIN" && {
            users: { some: { id: session.user.id } },
          }),
        },
        select: { id: true },
      });
      if (!allowedCostCenter) {
        return { error: "No tienes permiso para usar ese Centro de Costo." };
      }
    }

    await prisma.expense.update({
      where: { id },
      data: {
        ...(updateData.amount && { amount: new Prisma.Decimal(updateData.amount) }),
        ...(updateData.date && { date: new Date(updateData.date) }),
        ...(updateData.merchant && { merchant: updateData.merchant }),
        ...(updateData.expenseType && { expenseType: updateData.expenseType }),
        ...(updateData.costCenterId && { costCenterId: updateData.costCenterId }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
        ...(updateData.imageUrl && { imageUrl: updateData.imageUrl }),
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

export async function getExpenseCostCenters() {
  const session = await auth();
  if (!session) return [];

  return prisma.costCenter.findMany({
    where: {
      isActive: true,
      ...(session.user.role !== "ADMIN" && {
        users: { some: { id: session.user.id } },
      }),
    },
    orderBy: { name: "asc" },
  });
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
    const deletedExpense = await prisma.expense.delete({ where: { id } });

    if (deletedExpense.imageUrl?.startsWith("/")) {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const relativeUrl = basePath && deletedExpense.imageUrl.startsWith(basePath)
        ? deletedExpense.imageUrl.slice(basePath.length)
        : deletedExpense.imageUrl;
      const publicRoot = path.resolve(process.cwd(), "public");
      const imagePath = path.resolve(publicRoot, `.${relativeUrl}`);
      if (imagePath.startsWith(`${publicRoot}${path.sep}`)) {
        await fs.unlink(imagePath).catch(() => undefined);
      }
    }
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
