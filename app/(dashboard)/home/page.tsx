import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardHeader } from "@/components/ui/card";
import { DisciplineBadge } from "@/components/ui/badge";
import { Package, FileText, Flame, ShieldAlert, Camera, KeyRound, Bell } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const DISCIPLINE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  fire: Flame,
  intruder: ShieldAlert,
  cctv: Camera,
  "access-control": KeyRound,
  "nurse-call": Bell,
};

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  // Parallel fetches — no waterfalls
  const [
    totalProducts,
    totalGuides,
    disciplineCounts,
    recentProducts,
    recentGuides,
  ] = await Promise.all([
    prisma.product.count({ where: { isArchived: false } }),
    prisma.guide.count({ where: { isPublished: true } }),
    prisma.discipline.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { discipline: true, manufacturer: true },
    }),
    prisma.guide.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { discipline: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Field operations knowledge base — find product codes, procedures, and guides.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Products"
          value={totalProducts}
          icon={Package}
          href="/products"
          color="blue"
        />
        <StatCard
          label="Guides"
          value={totalGuides}
          icon={FileText}
          href="/guides"
          color="indigo"
        />
        {disciplineCounts.slice(0, 2).map((d) => {
          const Icon = DISCIPLINE_ICONS[d.slug] ?? Package;
          return (
            <StatCard
              key={d.id}
              label={d.name}
              value={d._count.products}
              icon={Icon}
              href={`/products?discipline=${d.slug}`}
              color="slate"
            />
          );
        })}
      </div>

      {/* Discipline breakdown */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          By Discipline
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {disciplineCounts.map((d) => {
            const Icon = DISCIPLINE_ICONS[d.slug] ?? Package;
            return (
              <Link
                key={d.id}
                href={`/products?discipline=${d.slug}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: d.color + "20" }}
                >
                  <Icon className="h-4 w-4" style={{ color: d.color }} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{d.name}</p>
                  <p className="text-lg font-bold text-slate-900">{d._count.products}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent products */}
        <Card padding={false}>
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <CardTitle>Recent Products</CardTitle>
            <Link href="/products" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <ul className="divide-y divide-slate-100">
            {recentProducts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {p.model}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.internalCode} · {p.manufacturer.name}
                    </p>
                  </div>
                  <DisciplineBadge slug={p.discipline.slug} name={p.discipline.name} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recent guides */}
        <Card padding={false}>
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <CardTitle>Recent Guides</CardTitle>
            <Link href="/guides" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <ul className="divide-y divide-slate-100">
            {recentGuides.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/guides/${g.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50">
                    <FileText className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {g.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {g.guideType === "GENERAL" ? "General" : "Product Guide"}
                      {g.discipline && ` · ${g.discipline.name}`}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: "blue" | "indigo" | "slate";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md ${colors[color]}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Link>
  );
}
