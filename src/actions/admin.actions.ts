"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// ─── Cost Centers ─────────────────────────────────────────────────────────────
export async function getCostCenters(includeInactive = false) {
  const where = includeInactive ? {} : { isActive: true };
  return prisma.costCenter.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function createCostCenter(name: string, description?: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  try {
    const cc = await prisma.costCenter.create({
      data: { name: name.trim(), description },
    });
    revalidatePath("/admin/centros-costo");
    return { success: true, id: cc.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe un Centro de Costo con ese nombre." };
    }
    return { error: "Error al crear el Centro de Costo." };
  }
}

export async function updateCostCenter(
  id: string,
  data: { name?: string; description?: string; isActive?: boolean }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  try {
    await prisma.costCenter.update({ where: { id }, data });
    revalidatePath("/admin/centros-costo");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe un Centro de Costo con ese nombre." };
    }
    return { error: "Error al actualizar el Centro de Costo." };
  }
}

export async function toggleCostCenterStatus(id: string, isActive: boolean) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.costCenter.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/centros-costo");
  return { success: true };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats(filters: {
  costCenterId?: string;
  from?: string;
  to?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const { costCenterId, from, to } = filters;

  const dateFilter: Prisma.ExpenseWhereInput["date"] = {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(to + "T23:59:59") }),
  };

  const where: Prisma.ExpenseWhereInput = {
    ...(costCenterId && { costCenterId }),
    ...((from || to) && { date: dateFilter }),
  };

  // Total stats
  const aggregate = await prisma.expense.aggregate({
    where,
    _sum: { amount: true },
    _count: { id: true },
    _avg: { amount: true },
  });

  // By Cost Center
  const byCostCenter = await prisma.expense.groupBy({
    by: ["costCenterId"],
    where,
    _sum: { amount: true },
  });

  const costCenterNames = await prisma.costCenter.findMany({
    where: { id: { in: byCostCenter.map((b) => b.costCenterId) } },
    select: { id: true, name: true },
  });

  const byCostCenterWithNames = byCostCenter.map((b) => ({
    name: costCenterNames.find((cc) => cc.id === b.costCenterId)?.name ?? "Desconocido",
    total: Number(b._sum.amount ?? 0),
  }));

  // By Month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyExpenses = await prisma.expense.findMany({
    where: { ...where, date: { gte: sixMonthsAgo } },
    select: { date: true, amount: true },
  });

  const monthlyMap: Record<string, number> = {};
  for (const exp of monthlyExpenses) {
    const key = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(exp.amount);
  }

  const byMonth = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));

  // By Type
  const byType = await prisma.expense.groupBy({
    by: ["expenseType"],
    where,
    _sum: { amount: true },
  });

  return {
    totalAmount: Number(aggregate._sum.amount ?? 0),
    totalExpenses: aggregate._count.id,
    avgAmount: Number(aggregate._avg.amount ?? 0),
    byCostCenter: byCostCenterWithNames,
    byMonth,
    byType: byType.map((t) => ({
      type: t.expenseType,
      total: Number(t._sum.amount ?? 0),
    })),
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUsers() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return [];

  return prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
}

export async function toggleUserStatus(userId: string, status: "ACTIVE" | "INACTIVE") {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(data.password, 12);

  try {
    await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe un usuario con ese email." };
    }
    return { error: "Error al crear el usuario." };
  }
}
