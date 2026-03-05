import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FirePanelForm } from "@/components/products/fire-panel-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Fire Alarm Panel" };

export default async function NewFirePanelPage() {
  const session = await auth();
  if (session?.user.role === "OFFICE_STAFF") redirect("/products");

  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" },
  });

  const fireDisc = await prisma.discipline.findUnique({
    where: { slug: "fire" },
  });

  if (!fireDisc) {
    return (
      <div className="p-6 text-red-600">
        Fire discipline not found. Please run the seed script first.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Link
          href="/products/new"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Add Fire Alarm Panel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in as much detail as you have. All sections except the panel identity are optional
          and can be updated later.
        </p>
      </div>

      <FirePanelForm manufacturers={manufacturers} disciplineId={fireDisc.id} />
    </div>
  );
}
