import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  const url = new URL(databaseUrl);
  const databaseName = url.pathname ? url.pathname.replace(/^\//, "") : "";
  const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;

  const adapter = new PrismaMariaDb({
    host,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username || ""),
    password: decodeURIComponent(url.password || ""),
    database: databaseName,
    connectionLimit: 10,
    connectTimeout: 10000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
