/**
 * Reference seed data — run `npx prisma db seed` after initial migration.
 * See prisma/seed.ts for the executable seed script.
 */

export const DISCIPLINES = [
  { name: "Fire", slug: "fire", color: "#EF4444", icon: "flame" },
  { name: "Intruder", slug: "intruder", color: "#F97316", icon: "shield-alert" },
  { name: "CCTV", slug: "cctv", color: "#3B82F6", icon: "camera" },
  { name: "Access Control", slug: "access-control", color: "#8B5CF6", icon: "key-round" },
  { name: "Nurse Call", slug: "nurse-call", color: "#22C55E", icon: "bell" },
  { name: "Emergency Lights", slug: "emergency-lights", color: "#EAB308", icon: "lightbulb" },
] as const;
