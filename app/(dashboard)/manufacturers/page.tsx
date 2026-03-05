import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Building2, Plus, Globe, Phone, Mail, Package, ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manufacturers" };

export default async function ManufacturersPage() {
  const session = await auth();
  const canEdit = session?.user.role !== "OFFICE_STAFF";

  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manufacturers</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {manufacturers.length} manufacturer{manufacturers.length !== 1 ? "s" : ""} · contacts, account numbers, and support details
          </p>
        </div>
        {canEdit && (
          <Link
            href="/manufacturers/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Manufacturer
          </Link>
        )}
      </div>

      {manufacturers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No manufacturers yet"
          description="Add your first manufacturer to start building the product database."
          action={
            canEdit ? (
              <Link
                href="/manufacturers/new"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Manufacturer
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {manufacturers.map((m) => (
            <Link
              key={m.id}
              href={`/manufacturers/${m.id}`}
              className="group flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              {/* Avatar */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {m.name.charAt(0).toUpperCase()}
              </div>

              {/* Main info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {m.name}
                  </p>
                </div>

                {/* Contact chips */}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {m.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" aria-hidden="true" />
                      {m.website.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                  {m.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {m.phone}
                    </span>
                  )}
                  {m.supportPhone && m.supportPhone !== m.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {m.supportPhone}
                      <span className="text-slate-400">(support)</span>
                    </span>
                  )}
                  {m.supportEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      {m.supportEmail}
                    </span>
                  )}
                </div>
              </div>

              {/* Product count */}
              <div className="flex shrink-0 items-center gap-3 text-sm text-slate-400">
                {m._count.products > 0 && (
                  <span className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" aria-hidden="true" />
                    {m._count.products}
                  </span>
                )}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
