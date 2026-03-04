import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { FirePanelForm } from "@/components/products/fire-panel-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { model: true, internalCode: true },
  });
  return product ? { title: `Edit ${product.internalCode} — ${product.model}` } : {};
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/products");

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, isArchived: false },
    include: { discipline: true, manufacturer: true },
  });

  if (!product) notFound();

  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" },
  });

  if (product.discipline.slug === "fire") {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <Link
            href={`/products/${id}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {product.internalCode} — {product.model}
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Edit Fire Alarm Panel</h1>
        </div>

        <FirePanelForm
          manufacturers={manufacturers}
          disciplineId={product.disciplineId}
          product={{
            id: product.id,
            internalCode: product.internalCode,
            model: product.model,
            manufacturerId: product.manufacturerId,
            engineerCodes: product.engineerCodes,
            defaultCodes: product.defaultCodes,
            resetCodes: product.resetCodes,
            walkTest: product.walkTest,
            commissioningQuirks: product.commissioningQuirks,
            commonFaults: product.commonFaults,
            notes: product.notes,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            specs: product.specs as any,
          }}
        />
      </div>
    );
  }

  // Fallback for disciplines without a dedicated edit form yet
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href={`/products/${id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {product.internalCode} — {product.model}
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Edit Product</h1>
      </div>
      <p className="text-sm text-slate-500">
        A dedicated edit form for <strong>{product.discipline.name}</strong> products is coming soon.
      </p>
    </div>
  );
}
