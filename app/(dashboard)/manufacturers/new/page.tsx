import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ManufacturerForm } from "@/components/manufacturers/manufacturer-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Manufacturer" };

export default async function NewManufacturerPage() {
  const session = await auth();
  if (session?.user.role === "OFFICE_STAFF") redirect("/manufacturers");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href="/manufacturers"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Manufacturers
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Add Manufacturer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Record the contact details, account number, and any useful notes for this manufacturer.
        </p>
      </div>
      <ManufacturerForm />
    </div>
  );
}
