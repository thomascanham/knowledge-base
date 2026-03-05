import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { DisciplineBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Globe, Phone, Mail, MapPin, FileText,
  ArrowLeft, Edit, Package, ChevronRight
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const m = await prisma.manufacturer.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
  return m ? { title: m.name } : {};
}

export default async function ManufacturerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canEdit = session?.user.role !== "OFFICE_STAFF";

  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: parseInt(id) },
    include: {
      products: {
        where: { isArchived: false },
        orderBy: [{ discipline: { name: "asc" } }, { model: "asc" }],
        include: { discipline: true },
      },
    },
  });

  if (!manufacturer) notFound();

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/manufacturers" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Manufacturers
        </Link>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-500">
            {manufacturer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{manufacturer.name}</h1>
            </div>
        </div>
        {canEdit && (
          <Link
            href={`/manufacturers/${manufacturer.id}/edit`}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — contact info + notes */}
        <div className="space-y-5 lg:col-span-1">
          {/* Contact card */}
          <Card>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Details
            </h2>
            <div className="space-y-3">
              {manufacturer.website ? (
                <ContactRow icon={Globe} label="Website">
                  <a
                    href={manufacturer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {manufacturer.website.replace(/^https?:\/\//, "")}
                  </a>
                </ContactRow>
              ) : (
                <ContactRow icon={Globe} label="Website">
                  <span className="text-slate-400">Not recorded</span>
                </ContactRow>
              )}

              <ContactRow icon={Phone} label="Main Phone">
                {manufacturer.phone ? (
                  <a href={`tel:${manufacturer.phone}`} className="hover:underline">
                    {manufacturer.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">Not recorded</span>
                )}
              </ContactRow>

              <ContactRow icon={Phone} label="Tech Support">
                {manufacturer.supportPhone ? (
                  <a href={`tel:${manufacturer.supportPhone}`} className="hover:underline">
                    {manufacturer.supportPhone}
                  </a>
                ) : (
                  <span className="text-slate-400">Not recorded</span>
                )}
              </ContactRow>

              <ContactRow icon={Mail} label="Support Email">
                {manufacturer.supportEmail ? (
                  <a href={`mailto:${manufacturer.supportEmail}`} className="text-blue-600 hover:underline break-all">
                    {manufacturer.supportEmail}
                  </a>
                ) : (
                  <span className="text-slate-400">Not recorded</span>
                )}
              </ContactRow>

              {manufacturer.address && (
                <ContactRow icon={MapPin} label="Address">
                  <span className="whitespace-pre-line">{manufacturer.address}</span>
                </ContactRow>
              )}
            </div>
          </Card>

          {/* Notes card */}
          {manufacturer.notes && (
            <Card>
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                {manufacturer.notes}
              </p>
            </Card>
          )}
        </div>

        {/* Right — products list */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Package className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Products ({manufacturer.products.length})
              </h2>
              {canEdit && (
                <Link
                  href={`/products/new`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add product
                </Link>
              )}
            </div>

            {manufacturer.products.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-2 h-8 w-8 text-slate-300" aria-hidden="true" />
                <p className="text-sm text-slate-500">No products yet for this manufacturer.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {manufacturer.products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{p.model}</p>
                        <p className="text-xs text-slate-500 font-mono">{p.internalCode}</p>
                      </div>
                      <DisciplineBadge slug={p.discipline.slug} name={p.discipline.name} />
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}
