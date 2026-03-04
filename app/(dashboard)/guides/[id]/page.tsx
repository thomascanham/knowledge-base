import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { DisciplineBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChevronRight, ArrowLeft, Edit, Clock, Package,
  Paperclip, Download, FileText
} from "lucide-react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const guide = await prisma.guide.findUnique({
    where: { id },
    select: { title: true },
  });
  return guide ? { title: guide.title } : {};
}

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function GuideDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const guide = await prisma.guide.findUnique({
    where: { id, isPublished: true },
    include: {
      discipline: true,
      attachments: { orderBy: { uploadedAt: "desc" } },
      products: {
        include: {
          product: {
            include: { discipline: true, manufacturer: true },
          },
        },
      },
      versions: {
        orderBy: { version: "desc" },
        take: 5,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/guides" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Guides
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 truncate max-w-xs">{guide.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main content */}
        <article className="lg:col-span-3">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {guide.discipline && (
                <DisciplineBadge slug={guide.discipline.slug} name={guide.discipline.name} />
              )}
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {guide.guideType === "GENERAL" ? "General Guide" : "Product Guide"}
              </span>
              {guide.difficulty && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {DIFFICULTY_LABELS[guide.difficulty]}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-900">{guide.title}</h1>
              {isAdmin && (
                <Link
                  href={`/guides/${guide.id}/edit`}
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Link>
              )}
            </div>

            {/* Meta */}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {guide.estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {guide.estimatedTime}
                </span>
              )}
              <span>
                Updated {new Date(guide.updatedAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </span>
              <span>Version {guide.version}</span>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 lg:p-8">
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          </div>
        </article>

        {/* Right sidebar */}
        <aside className="space-y-5">
          {/* Linked Products */}
          {guide.products.length > 0 && (
            <Card padding={false}>
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Package className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Related Products ({guide.products.length})
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {guide.products.map(({ product: p }) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-800">{p.model}</p>
                        <p className="text-[11px] text-slate-500">{p.internalCode}</p>
                      </div>
                      <DisciplineBadge slug={p.discipline.slug} name={p.discipline.name} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Attachments */}
          {guide.attachments.length > 0 && (
            <Card padding={false}>
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Paperclip className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Files ({guide.attachments.length})
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {guide.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`/api/upload/${a.id}`}
                      download={a.originalName}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-800">{a.originalName}</p>
                        <p className="text-[11px] text-slate-500">{formatBytes(a.sizeBytes)}</p>
                      </div>
                      <Download className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Version history */}
          {guide.versions.length > 0 && (
            <Card padding={false}>
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  History
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {guide.versions.map((v) => (
                  <li key={v.id} className="px-4 py-2">
                    <p className="text-xs font-medium text-slate-700">v{v.version}</p>
                    <p className="text-[11px] text-slate-500">
                      {v.user.name} ·{" "}
                      {new Date(v.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
