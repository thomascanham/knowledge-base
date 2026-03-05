import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GuideForm } from "@/components/guides/guide-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Guide" };

export default async function NewGuidePage() {
  const session = await auth();
  if (session?.user.role === "OFFICE_STAFF") redirect("/guides");

  const [disciplines, products] = await Promise.all([
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isArchived: false },
      orderBy: [{ discipline: { name: "asc" } }, { model: "asc" }],
      include: { discipline: true, manufacturer: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-1 text-xl font-bold text-slate-900">New Guide</h1>
      <p className="mb-6 text-sm text-slate-500">
        Document a procedure, commissioning step, or best practice.
      </p>
      <GuideForm disciplines={disciplines} products={products} />
    </div>
  );
}
