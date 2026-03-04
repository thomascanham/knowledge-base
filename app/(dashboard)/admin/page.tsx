import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FileText, Activity } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const [userCount, productCount, guideCount, recentAudit] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isArchived: false } }),
    prisma.guide.count({ where: { isPublished: true } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Administration</h1>
        <p className="text-sm text-slate-500">System overview and management tools.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active Users", value: userCount, icon: Users, href: "/admin/users" },
          { label: "Products", value: productCount, icon: Package, href: "/products" },
          { label: "Guides", value: guideCount, icon: FileText, href: "/guides" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <s.icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/users"
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
        >
          <Users className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-900">Manage Users</p>
            <p className="text-xs text-slate-500">Add, edit, or deactivate user accounts</p>
          </div>
        </Link>
        <Link
          href="/products/new"
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
        >
          <Package className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-900">Add Product</p>
            <p className="text-xs text-slate-500">Create a new product entry</p>
          </div>
        </Link>
      </div>

      {/* Recent audit log */}
      <Card padding={false}>
        <CardHeader className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["User", "Action", "Entity", "Time"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAudit.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-700">
                    {log.user.name ?? log.user.email}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        log.action === "CREATE"
                          ? "bg-green-100 text-green-700"
                          : log.action === "UPDATE"
                          ? "bg-blue-100 text-blue-700"
                          : log.action === "DELETE"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {log.entityType}/{log.entityId.slice(0, 8)}…
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {recentAudit.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                    No activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
