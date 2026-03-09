import { MapPin, Building2, ClipboardList, Wrench, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sites" };

export default function SitesPage() {
  return (
    <div className="mx-auto max-w-3xl p-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <MapPin className="h-6 w-6 text-blue-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sites</h1>
          <p className="text-sm text-slate-500">Customer site records — coming soon</p>
        </div>
      </div>

      {/* Explainer */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-6 py-5 text-sm text-blue-800 leading-relaxed mb-8">
        <p className="font-semibold mb-1">This section is under development.</p>
        <p>
          Sites will allow engineers to keep detailed records for each customer location — installed
          systems, site-specific notes, access information, and more. All in one place, so anyone
          heading out to a site can get up to speed quickly.
        </p>
      </div>

      {/* Sample page link */}
      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">View sample site page</p>
          <p className="text-xs text-slate-500 mt-0.5">
            See a mockup of what a finished site record will look like.
          </p>
        </div>
        <Link
          href="/sites/sample"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          View sample
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Planned features */}
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Planned features
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {PLANNED_FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                <f.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-slate-800">{f.title}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLANNED_FEATURES = [
  {
    icon: Building2,
    title: "Site Details",
    description:
      "Name, address, customer contact, site reference, and any access instructions or codes needed to enter the premises.",
  },
  {
    icon: Wrench,
    title: "Installed Systems",
    description:
      "Link the products installed at each site so engineers can see exactly what equipment is on-site before they arrive.",
  },
  {
    icon: ClipboardList,
    title: "Site Notes",
    description:
      "Freeform engineer notes — quirks, known issues, things to watch out for, historical fault patterns.",
  },
  {
    icon: FileText,
    title: "Linked Guides",
    description:
      "Surface relevant product guides and procedures based on what's installed at the site.",
  },
];
