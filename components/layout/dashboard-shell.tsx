"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import type { Role } from "@prisma/client";

interface DashboardShellProps {
  session: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  children: React.ReactNode;
}

export function DashboardShell({ session, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <Sidebar
        isAdmin={session.role === "ADMIN"}
        userName={session.name}
        userEmail={session.email}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
