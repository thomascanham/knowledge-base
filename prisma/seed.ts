/**
 * Database seed script.
 * Usage: npx prisma db seed
 * Configure in package.json: "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DISCIPLINES } from "../lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database...");

  // Disciplines
  for (const d of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { slug: d.slug },
      update: { color: d.color, icon: d.icon },
      create: d,
    });
  }
  console.log("  ✓ Disciplines");

  // Default admin user
  const hash = await bcrypt.hash("Admin1234!", 12);
  await prisma.user.upsert({
    where: { email: "admin@brodman.internal" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@brodman.internal",
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  console.log("  ✓ Admin user: admin@brodman.internal / Admin1234!");

  // Sample manufacturers
  const manufacturers = [
    { name: "Advanced Electronics", slug: "advanced-electronics" },
    { name: "Hochiki", slug: "hochiki" },
    { name: "Texecom", slug: "texecom" },
    { name: "Hikvision", slug: "hikvision" },
    { name: "Paxton", slug: "paxton" },
    { name: "Aiphone", slug: "aiphone" },
    { name: "Honeywell", slug: "honeywell" },
    { name: "Notifier", slug: "notifier" },
  ];

  for (const m of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { slug: m.slug },
      update: {},
      create: m,
    });
  }
  console.log("  ✓ Manufacturers");

  console.log("✅  Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
