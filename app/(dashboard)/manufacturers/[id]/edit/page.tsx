import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { ManufacturerForm } from "@/components/manufacturers/manufacturer-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const m = await prisma.manufacturer.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
  return m ? { title: `Edit ${m.name}` } : {};
}

export default async function EditManufacturerPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user.role === "OFFICE_STAFF") redirect("/manufacturers");

  const { id } = await params;
  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: parseInt(id) },
  });

  if (!manufacturer) notFound();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href={`/manufacturers/${id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {manufacturer.name}
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Edit {manufacturer.name}</h1>
      </div>
      <ManufacturerForm manufacturer={manufacturer} />
    </div>
  );
}
