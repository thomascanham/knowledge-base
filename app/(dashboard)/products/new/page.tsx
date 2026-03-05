import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Flame, ShieldAlert, Camera, KeyRound, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Product" };

const DISCIPLINES = [
  {
    slug: "fire-panel",
    label: "Fire Alarm Panel",
    description: "Addressable & conventional panels, codes, walk test, zone config, fault finding.",
    icon: Flame,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100 hover:border-red-300",
    href: "/products/fire-panel/new",
    available: true,
  },
  {
    slug: "intruder",
    label: "Intruder Panel",
    description: "Engineer codes, arming/disarming, zone config, signalling, common faults.",
    icon: ShieldAlert,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100 hover:border-orange-200",
    href: "/products/intruder-panel/new",
    available: false,
  },
  {
    slug: "cctv",
    label: "CCTV System",
    description: "NVR/DVR setup, camera config, remote access, recording schedules.",
    icon: Camera,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100 hover:border-blue-200",
    href: "/products/cctv/new",
    available: false,
  },
  {
    slug: "access-control",
    label: "Access Control",
    description: "Door controllers, reader config, user management, schedules.",
    icon: KeyRound,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100 hover:border-purple-200",
    href: "/products/access-control/new",
    available: false,
  },
  {
    slug: "nurse-call",
    label: "Nurse Call System",
    description: "Call points, zone config, reporting, maintenance procedures.",
    icon: Bell,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100 hover:border-green-200",
    href: "/products/nurse-call/new",
    available: false,
  },
] as const;

export default async function NewProductPage() {
  const session = await auth();
  if (session?.user.role === "OFFICE_STAFF") redirect("/products");

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900">Add Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          What type of product are you adding? Each discipline has its own tailored form.
        </p>
      </div>

      <div className="space-y-3">
        {DISCIPLINES.map((d) => {
          const Icon = d.icon;
          const inner = (
            <div
              className={`group flex items-center gap-5 rounded-xl border-2 bg-white p-5 transition-all ${
                d.available
                  ? `cursor-pointer ${d.border} shadow-sm hover:shadow-md`
                  : "cursor-not-allowed border-slate-100 opacity-50"
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${d.bg}`}>
                <Icon className={`h-6 w-6 ${d.color}`} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{d.label}</p>
                  {!d.available && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{d.description}</p>
              </div>
              {d.available && (
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"
                  aria-hidden="true"
                />
              )}
            </div>
          );

          return d.available ? (
            <Link key={d.slug} href={d.href}>
              {inner}
            </Link>
          ) : (
            <div key={d.slug}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
