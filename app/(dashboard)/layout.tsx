import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar is a server component wrapper — interactivity in client child */}
      <DashboardShell
        session={{
          id: session.user.id,
          name: session.user.name ?? "",
          email: session.user.email,
          role: session.user.role,
        }}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
