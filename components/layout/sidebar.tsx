"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  ShieldAlert,
  Camera,
  KeyRound,
  Bell,
  BookOpen,
  LayoutDashboard,
  Settings,
  Search,
  ChevronDown,
  LogOut,
  Package,
  FileText,
  Users,
  X,
  Building2,
  MapPin,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useState } from "react";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  children?: NavItem[];
}

// ────────────────────────────────────────────────────────────────
// Nav config
// ────────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/home",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Bible",
    href: "/products",
    icon: Package,
    children: [
      { label: "All", href: "/products", icon: Package, exact: true },
      { label: "Fire Panels", href: "/products?discipline=fire", icon: Flame },
      { label: "Intruder Panels", href: "/products?discipline=intruder", icon: ShieldAlert },
      { label: "CCTV", href: "/products?discipline=cctv", icon: Camera },
      { label: "Access Control", href: "/products?discipline=access-control", icon: KeyRound },
      { label: "Nurse Call", href: "/products?discipline=nurse-call", icon: Bell },
      { label: "Emergency Lights", href: "/products?discipline=emergency-lights", icon: Lightbulb },
    ],
  },
  {
    label: "Guides",
    href: "/guides",
    icon: FileText,
    children: [
      { label: "All Guides", href: "/guides", icon: FileText, exact: true },
      { label: "General", href: "/guides?type=GENERAL", icon: BookOpen },
      { label: "Product Guides", href: "/guides?type=PRODUCT_SPECIFIC", icon: Package },
    ],
  },
  {
    label: "Sites",
    href: "/sites",
    icon: MapPin,
  },
  {
    label: "Manufacturers",
    href: "/manufacturers",
    icon: Building2,
  },
];

const ADMIN_NAV: NavItem[] = [
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin", icon: Settings },
];

// ────────────────────────────────────────────────────────────────
// Discipline dot colours
// ────────────────────────────────────────────────────────────────

const DISCIPLINE_DOTS: Record<string, string> = {
  fire: "bg-red-500",
  intruder: "bg-orange-500",
  cctv: "bg-blue-500",
  "access-control": "bg-purple-500",
  "nurse-call": "bg-green-500",
  "emergency-lights": "bg-yellow-400",
};

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function NavLink({
  item,
  depth = 0,
}: {
  item: NavItem;
  depth?: number;
}) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href) && item.href !== "/";

  const [open, setOpen] = useState(isActive);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  // Discipline dot
  const disciplineParam = item.href.includes("discipline=")
    ? item.href.split("discipline=")[1]
    : null;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-slate-400 hover:bg-slate-800 hover:text-white",
            isActive && "text-white"
          )}
          aria-expanded={open}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {open && (
          <div className="ml-3 mt-0.5 border-l border-slate-700 pl-3 space-y-0.5">
            {item.children!.map((child) => (
              <NavLink key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        depth === 0 ? "font-medium" : "font-normal",
        "text-slate-400 hover:bg-slate-800 hover:text-white",
        isActive && "bg-slate-800 text-white"
      )}
    >
      {disciplineParam ? (
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            DISCIPLINE_DOTS[disciplineParam] ?? "bg-slate-400"
          )}
          aria-hidden="true"
        />
      ) : (
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {item.label}
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Sidebar
// ────────────────────────────────────────────────────────────────

interface SidebarProps {
  isAdmin: boolean;
  userEmail: string;
  userName: string;
  /** Mobile: controlled open state */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isAdmin, userEmail, userName, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 transition-transform duration-200",
          "lg:static lg:translate-x-0 lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
          <Link href="/home" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <Flame className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              Brodman Bible
            </span>
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden rounded-md p-1 text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Search shortcut */}
        <div className="p-3">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="flex-1">Quick search…</span>
            <kbd className="hidden rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 sm:inline">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-slate-800" />
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Administration
              </p>
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white uppercase">
              {userName?.charAt(0) ?? userEmail.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{userName || userEmail}</p>
              <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="shrink-0 rounded p-1 text-slate-500 hover:text-red-400 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
