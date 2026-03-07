import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { DisciplineBadge } from "@/components/ui/badge";
import { Card, CardSection } from "@/components/ui/card";
import { FirePanelSpecs } from "@/components/products/fire-panel-specs";
import { formatBytes } from "@/lib/utils";
import {
  FileText, Paperclip, Tag, Clock, ChevronRight,
  Edit, ArrowLeft, Download,
  KeyRound, Footprints, Wrench, AlertTriangle, RotateCcw,
} from "lucide-react";

const DISCIPLINE_ICON_COLOR: Record<string, string> = {
  fire:             "bg-red-50 text-red-600",
  intruder:         "bg-orange-50 text-orange-600",
  cctv:             "bg-blue-50 text-blue-600",
  "access-control": "bg-purple-50 text-purple-600",
  "nurse-call":     "bg-green-50 text-green-600",
};
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
  if (!product) return {};
  return { title: `${product.internalCode} — ${product.model}` };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canEdit = session?.user.role !== "OFFICE_STAFF";

  const product = await prisma.product.findUnique({
    where: { id, isArchived: false },
    include: {
      discipline: true,
      manufacturer: true,
      tags: { include: { tag: true } },
      attachments: { orderBy: { uploadedAt: "desc" } },
      guides: {
        include: {
          guide: { include: { discipline: true } },
        },
        orderBy: { guide: { title: "asc" } },
      },
    },
  });

  if (!product) notFound();

  const isFirePanel = product.discipline.slug === "fire";
  const iconColor = DISCIPLINE_ICON_COLOR[product.discipline.slug] ?? "bg-slate-100 text-slate-500";

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900">{product.internalCode}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm font-medium text-slate-700">
              {product.internalCode}
            </code>
            <DisciplineBadge slug={product.discipline.slug} name={product.discipline.name} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{product.model}</h1>
          <p className="mt-1 text-slate-500">{product.manufacturer.name}</p>
        </div>
        {canEdit && (
          <Link
            href={`/products/${product.id}/edit`}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        )}
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              <Tag className="h-3 w-3" aria-hidden="true" />
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* ── GRID ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">

          {/* Fire panel structured specs */}
          {isFirePanel && product.specs && (
            <FirePanelSpecs specs={product.specs as Record<string, unknown>} />
          )}

          {/* Access Codes — legacy free-text fields (pre-specs.codes era) */}
          {(product.engineerCodes || product.defaultCodes) && (
            <Card>
              <CardSection title="Access Codes" icon={KeyRound} iconColor={iconColor}>
                <div className="space-y-4">
                  {product.engineerCodes && (
                    <InfoBlock label="Engineer / Installer Code" value={product.engineerCodes} mono />
                  )}
                  {product.defaultCodes && (
                    <InfoBlock label="Default User / Manager Code" value={product.defaultCodes} mono />
                  )}
                </div>
              </CardSection>
            </Card>
          )}

          {/* Reset Procedure */}
          {product.resetCodes && (
            <Card>
              <CardSection title="Reset Procedure" icon={RotateCcw} iconColor={iconColor}>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {product.resetCodes}
                </pre>
              </CardSection>
            </Card>
          )}

          {product.walkTest && (
            <Card>
              <CardSection title="Walk Test Procedure" icon={Footprints} iconColor={iconColor}>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {product.walkTest}
                </pre>
              </CardSection>
            </Card>
          )}

          {product.commissioningQuirks && (
            <Card>
              <CardSection title="Commissioning" icon={Wrench} iconColor={iconColor}>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {product.commissioningQuirks}
                </pre>
              </CardSection>
            </Card>
          )}

          {product.commonFaults && (
            <Card>
              <CardSection title="Common Faults & Fault Finding" icon={AlertTriangle} iconColor={iconColor}>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {product.commonFaults}
                </pre>
              </CardSection>
            </Card>
          )}

          {product.notes && (
            <Card>
              <CardSection title="Notes" icon={FileText} iconColor={iconColor}>
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {product.notes}
                </pre>
              </CardSection>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Linked Guides */}
          <Card padding={false}>
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Linked Guides ({product.guides.length})
              </h3>
            </div>
            {product.guides.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">
                No guides linked yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {product.guides.map(({ guide: g }) => (
                  <li key={g.id}>
                    <Link
                      href={`/guides/${g.id}`}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">{g.title}</p>
                        {g.discipline && (
                          <p className="text-xs text-slate-500">{g.discipline.name}</p>
                        )}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Attachments */}
          <Card padding={false}>
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Paperclip className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Attachments ({product.attachments.length})
              </h3>
            </div>
            {product.attachments.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">
                No files attached.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {product.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`/api/upload/${a.id}`}
                      download={a.originalName}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">{a.originalName}</p>
                        <p className="text-xs text-slate-500">{formatBytes(a.sizeBytes)}</p>
                      </div>
                      <Download className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Metadata */}
          <Card>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Updated {new Date(product.updatedAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Added {new Date(product.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <pre
        className={`whitespace-pre-wrap rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-900 leading-relaxed ${
          mono ? "font-mono" : "font-sans"
        }`}
      >
        {value}
      </pre>
    </div>
  );
}
