import { prisma } from "@/lib/prisma";
import { DisciplineBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products" };

interface PageProps {
  searchParams: Promise<{ discipline?: string; manufacturer?: string; q?: string; page?: string }>;
}

const PAGE_SIZE = 24;

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  // Build filters
  const where = {
    isArchived: false,
    ...(params.discipline && {
      discipline: { slug: params.discipline },
    }),
    ...(params.manufacturer && {
      manufacturer: { slug: params.manufacturer },
    }),
    ...(params.q && {
      OR: [
        { model: { contains: params.q } },
        { internalCode: { contains: params.q } },
      ],
    }),
  };

  const [products, total, disciplines, manufacturers] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ discipline: { name: "asc" } }, { model: "asc" }],
      skip,
      take: PAGE_SIZE,
      include: {
        discipline: true,
        manufacturer: true,
        tags: { include: { tag: true } },
        _count: { select: { guides: true, attachments: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.manufacturer.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex h-full">
      {/* Filter sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Discipline
        </p>
        <nav className="space-y-0.5" aria-label="Discipline filters">
          <FilterLink href="/products" label="All" active={!params.discipline} />
          {disciplines.map((d) => (
            <FilterLink
              key={d.id}
              href={`/products?discipline=${d.slug}`}
              label={d.name}
              active={params.discipline === d.slug}
              dot={d.color}
            />
          ))}
        </nav>

        <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Manufacturer
        </p>
        <nav className="space-y-0.5" aria-label="Manufacturer filters">
          <FilterLink href="/products" label="All" active={!params.manufacturer} />
          {manufacturers.map((m) => (
            <FilterLink
              key={m.id}
              href={`/products?manufacturer=${m.slug}`}
              label={m.name}
              active={params.manufacturer === m.slug}
            />
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500">
              {total} {total === 1 ? "product" : "products"}
              {params.discipline && ` · ${params.discipline}`}
            </p>
          </div>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              params.discipline
                ? `No products in the ${params.discipline} discipline yet.`
                : "Start building the knowledge base by adding your first product."
            }
            action={
              <Link
                href="/products/new"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
                      {p.internalCode}
                    </span>
                    <DisciplineBadge slug={p.discipline.slug} name={p.discipline.name} />
                  </div>

                  {/* Title */}
                  <h2 className="mb-1 text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {p.model}
                  </h2>
                  <p className="mb-3 text-xs text-slate-500">{p.manufacturer.name}</p>

                  {/* Tags */}
                  {p.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    {p._count.guides > 0 && (
                      <span>{p._count.guides} guide{p._count.guides > 1 ? "s" : ""}</span>
                    )}
                    {p._count.attachments > 0 && (
                      <span>{p._count.attachments} file{p._count.attachments > 1 ? "s" : ""}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 && (
                  <PaginationLink href={`/products?page=${page - 1}`} label="Previous" />
                )}
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <PaginationLink href={`/products?page=${page + 1}`} label="Next" />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
  dot,
}: {
  href: string;
  label: string;
  active: boolean;
  dot?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-blue-50 font-medium text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {dot && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
          aria-hidden="true"
        />
      )}
      {label}
    </Link>
  );
}

function PaginationLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
    >
      {label}
    </Link>
  );
}
