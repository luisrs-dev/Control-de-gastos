import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL!;
const url = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace("/", ""),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // ─── Cost Centers ────────────────────────────────────────────────────────
  const costCenters = [
    { name: "Alameda", description: "Centro de costo Alameda" },
    { name: "Hombres", description: "Centro de costo Hombres" },
    { name: "Mujeres", description: "Centro de costo Mujeres" },
  ];

  for (const cc of costCenters) {
    await prisma.costCenter.upsert({
      where: { name: cc.name },
      update: {},
      create: cc,
    });
  }
  console.log(`✅ ${costCenters.length} cost centers created/updated`);

  // ─── Admin User ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@empresa.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin user created: admin@empresa.com / Admin123!");

  // ─── Regular User ────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash("User123!", 12);
  await prisma.user.upsert({
    where: { email: "usuario@empresa.com" },
    update: {},
    create: {
      name: "Usuario Demo",
      email: "usuario@empresa.com",
      password: userPassword,
      role: "USER",
      status: "ACTIVE",
    },
  });
  console.log("✅ Regular user created: usuario@empresa.com / User123!");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
