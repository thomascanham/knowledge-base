import { globalSearch } from "@/lib/search";
import { SearchBar } from "@/components/search/search-bar";
import { Package, FileText, Search } from "lucide-react";
import { DisciplineBadge } from "@/components/ui/badge";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Search</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {q ? (
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults query={q} />
        </Suspense>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <Search className="mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-slate-500">
            Search across all products, codes, procedures, and guides.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Try searching for a product model, reset code, or procedure name.
          </p>
        </div>
      )}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const results = await globalSearch(query, 30);

  if (results.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500">
          No results for <strong>&quot;{query}&quot;</strong>
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Try different keywords or check your spelling.
        </p>
      </div>
    );
  }

  const products = results.filter((r) => r.type === "product");
  const guides = results.filter((r) => r.type === "guide");

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        {results.length} result{results.length > 1 ? "s" : ""} for{" "}
        <strong>&quot;{query}&quot;</strong>
      </p>

      {products.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            <Package className="h-4 w-4" aria-hidden="true" />
            Products ({products.length})
          </h2>
          <div className="space-y-2">
            {products.map((r) => (
              <Link
                key={r.id}
                href={r.url}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100">
                  <Package className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{r.title}</p>
                  {r.subtitle && <p className="text-sm text-slate-500">{r.subtitle}</p>}
                </div>
                {r.discipline && r.disciplineColor && (
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: r.disciplineColor + "1a",
                      borderColor: r.disciplineColor + "40",
                      color: r.disciplineColor,
                    }}
                  >
                    {r.discipline}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Guides ({guides.length})
          </h2>
          <div className="space-y-2">
            {guides.map((r) => (
              <Link
                key={r.id}
                href={r.url}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50">
                  <FileText className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{r.title}</p>
                  {r.subtitle && <p className="text-sm text-slate-500">{r.subtitle}</p>}
                  {r.snippet && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{r.snippet}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
        />
      ))}
    </div>
  );
}
