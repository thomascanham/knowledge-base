import { prisma } from "@/lib/prisma";
import { DisciplineBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Plus, Clock, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Guides" };

interface PageProps {
  searchParams: Promise<{ type?: string; discipline?: string; page?: string }>;
}

const PAGE_SIZE = 20;

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "text-green-600 bg-green-50",
  INTERMEDIATE: "text-amber-600 bg-amber-50",
  ADVANCED: "text-red-600 bg-red-50",
};

export default async function GuidesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    isPublished: true,
    ...(params.type && { guideType: params.type as "GENERAL" | "PRODUCT_SPECIFIC" }),
    ...(params.discipline && { discipline: { slug: params.discipline } }),
  };

  const [guides, total, disciplines] = await Promise.all([
    prisma.guide.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        discipline: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.guide.count({ where }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex h-full">
      {/* Filter sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Type
        </p>
        <nav className="space-y-0.5" aria-label="Guide type filters">
          {[
            { label: "All Guides", value: "" },
            { label: "General", value: "GENERAL" },
            { label: "Product Guides", value: "PRODUCT_SPECIFIC" },
          ].map((item) => (
            <Link
              key={item.value}
              href={item.value ? `/guides?type=${item.value}` : "/guides"}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                (params.type ?? "") === item.value
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Discipline
        </p>
        <nav className="space-y-0.5">
          <Link
            href="/guides"
            className={`flex items-center rounded-md px-2.5 py-1.5 text-sm transition-colors ${
              !params.discipline ? "bg-blue-50 font-medium text-blue-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All
          </Link>
          {disciplines.map((d) => (
            <Link
              key={d.id}
              href={`/guides?discipline=${d.slug}`}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                params.discipline === d.slug
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
                aria-hidden="true"
              />
              {d.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Guides</h1>
            <p className="text-sm text-slate-500">
              {total} {total === 1 ? "guide" : "guides"}
            </p>
          </div>
          <Link
            href="/guides/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Guide
          </Link>
        </div>

        {guides.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No guides found"
            description="Start documenting procedures and knowledge."
            action={
              <Link
                href="/guides/new"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Guide
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {guides.map((g) => (
                <Link
                  key={g.id}
                  href={`/guides/${g.id}`}
                  className="group flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-50">
                    {g.guideType === "GENERAL" ? (
                      <BookOpen className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                    ) : (
                      <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {g.title}
                      </h2>
                      {g.discipline && (
                        <DisciplineBadge
                          slug={g.discipline.slug}
                          name={g.discipline.name}
                        />
                      )}
                      {g.difficulty && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            DIFFICULTY_COLORS[g.difficulty] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {DIFFICULTY_LABELS[g.difficulty]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{g.guideType === "GENERAL" ? "General Guide" : "Product Guide"}</span>
                      {g.estimatedTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {g.estimatedTime}
                        </span>
                      )}
                      {g._count.products > 0 && (
                        <span>
                          {g._count.products} linked product{g._count.products > 1 ? "s" : ""}
                        </span>
                      )}
                      <span>
                        Updated{" "}
                        {new Date(g.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/guides?page=${page - 1}`}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/guides?page=${page + 1}`}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
