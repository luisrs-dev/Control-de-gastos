import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseTypeLabel, formatCurrency, formatDate, formatTime } from "@/lib/utils";

export const runtime = "nodejs";

type ExportRow = {
  Fecha: string;
  Hora: string;
  Comercio: string;
  Usuario: string;
  Centro: string;
  Tipo: string;
  Monto: number;
  Notas: string;
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return new Response("No autorizado", { status: 401 });

  const params = new URL(request.url).searchParams;
  const format = params.get("format") ?? "csv";
  if (!new Set(["csv", "xlsx", "pdf"]).has(format)) {
    return new Response("Formato no válido", { status: 400 });
  }

  const from = params.get("from") || undefined;
  const to = params.get("to") || undefined;
  const costCenterId = params.get("costCenterId") || undefined;
  const userId = params.get("userId") || undefined;
  const expenseType = params.get("expenseType") || undefined;

  const where: Prisma.ExpenseWhereInput = {
    ...(session.user.role === "ADMIN" ? (userId && { userId }) : { userId: session.user.id }),
    ...(costCenterId && { costCenterId }),
    ...(expenseType && { expenseType: expenseType as Prisma.EnumExpenseTypeFilter["equals"] }),
    ...((from || to) && {
      date: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(`${to}T23:59:59`) }),
      },
    }),
  };

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      costCenter: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  const rows: ExportRow[] = expenses.map((expense) => ({
    Fecha: formatDate(expense.date),
    Hora: formatTime(expense.createdAt),
    Comercio: expense.merchant,
    Usuario: expense.user.name || expense.user.email,
    Centro: expense.costCenter.name,
    Tipo: expenseTypeLabel(expense.expenseType),
    Monto: Number(expense.amount),
    Notas: expense.notes ?? "",
  }));
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "xlsx") return createExcel(rows, stamp);
  if (format === "pdf") return createPdf(rows, stamp);
  return createCsv(rows, stamp);
}

function createCsv(rows: ExportRow[], stamp: string) {
  const headers = ["Fecha", "Hora", "Comercio", "Usuario", "Centro", "Tipo", "Monto", "Notas"] as const;
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [headers.map(escape).join(";"), ...rows.map((row) => headers.map((key) => escape(row[key])).join(";"))].join("\n");
  return fileResponse(`\uFEFF${csv}`, "text/csv; charset=utf-8", `gastos-${stamp}.csv`);
}

async function createExcel(rows: ExportRow[], stamp: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Gastos");
  sheet.columns = [
    { header: "Fecha", key: "Fecha", width: 14 },
    { header: "Hora", key: "Hora", width: 10 },
    { header: "Comercio", key: "Comercio", width: 28 },
    { header: "Usuario", key: "Usuario", width: 25 },
    { header: "Centro", key: "Centro", width: 24 },
    { header: "Tipo", key: "Tipo", width: 18 },
    { header: "Monto", key: "Monto", width: 16, style: { numFmt: "$#,##0" } },
    { header: "Notas", key: "Notas", width: 35 },
  ];
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1463B8" } };
  sheet.autoFilter = "A1:H1";
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  const buffer = await workbook.xlsx.writeBuffer();
  return fileResponse(Buffer.from(buffer), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `gastos-${stamp}.xlsx`);
}

async function createPdf(rows: ExportRow[], stamp: string) {
  const document = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const complete = new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  document.fontSize(20).fillColor("#1463b8").text("Reporte de Gastos");
  document.moveDown(0.25).fontSize(9).fillColor("#555555").text(`Generado: ${formatDate(new Date())} · ${rows.length} registros`);
  document.moveDown();
  rows.forEach((row, index) => {
    if (document.y > 740) document.addPage();
    document.fontSize(10).fillColor("#111111").text(`${index + 1}. ${row.Comercio} — ${formatCurrency(row.Monto)}`, { continued: false });
    document.fontSize(8).fillColor("#555555").text(`${row.Fecha} ${row.Hora} | ${row.Centro} | ${row.Tipo} | ${row.Usuario}`);
    if (row.Notas) document.text(`Notas: ${row.Notas}`);
    document.moveDown(0.6);
  });
  document.end();
  return fileResponse(await complete, "application/pdf", `gastos-${stamp}.pdf`);
}

function fileResponse(body: string | Buffer, contentType: string, filename: string) {
  const responseBody = typeof body === "string" ? body : Uint8Array.from(body);
  return new Response(responseBody, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
