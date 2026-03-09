import {
  MapPin, ArrowLeft, ChevronRight, MapPinned, Building2,
  ParkingCircle, Edit, Flame, ShieldAlert, Camera, KeyRound, Bell, Lightbulb,
} from "lucide-react";
import { Card, CardSection } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Thornfield Business Park — Sites" };

// ─── Sample data ──────────────────────────────────────────────────────────────

const SITE = {
  name: "Thornfield Business Park",
  reference: "SITE-001",
  services: ["fire", "intruder", "cctv"] as ServiceSlug[],
  address: {
    line1: "Unit 12, Thornfield Business Park",
    line2: "Thornfield Road",
    town: "Coventry",
    county: "West Midlands",
    postcode: "CV3 2AB",
  },
  parking: `Free parking is available in the main car park directly in front of the building. Enter from Thornfield Road — the car park entrance is clearly signed.\n\nOverflow parking is available on the east side of the estate (follow signs for Units 10–15). Visitor bays are marked in yellow.\n\nNote: Loading bay to the rear is for deliveries only and must not be used for engineer parking.`,
};

// ─── Service config ───────────────────────────────────────────────────────────

type ServiceSlug = "fire" | "intruder" | "cctv" | "access-control" | "nurse-call" | "emergency-lights";

const SERVICES: Record<ServiceSlug, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pill: string;
  iconBg: string;
}> = {
  fire: {
    label: "Fire Alarm",
    icon: Flame,
    pill: "bg-red-50 border-red-200 text-red-700",
    iconBg: "bg-red-100 text-red-600",
  },
  intruder: {
    label: "Intruder Alarm",
    icon: ShieldAlert,
    pill: "bg-orange-50 border-orange-200 text-orange-700",
    iconBg: "bg-orange-100 text-orange-600",
  },
  cctv: {
    label: "CCTV",
    icon: Camera,
    pill: "bg-blue-50 border-blue-200 text-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
  },
  "access-control": {
    label: "Access Control",
    icon: KeyRound,
    pill: "bg-purple-50 border-purple-200 text-purple-700",
    iconBg: "bg-purple-100 text-purple-600",
  },
  "nurse-call": {
    label: "Nurse Call",
    icon: Bell,
    pill: "bg-green-50 border-green-200 text-green-700",
    iconBg: "bg-green-100 text-green-600",
  },
  "emergency-lights": {
    label: "Emergency Lights",
    icon: Lightbulb,
    pill: "bg-yellow-50 border-yellow-200 text-yellow-700",
    iconBg: "bg-yellow-100 text-yellow-600",
  },
};

const ICON_COLOR = "bg-blue-50 text-blue-600";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SampleSitePage() {
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/sites" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Sites
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900">{SITE.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm font-medium text-slate-700">
              {SITE.reference}
            </code>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              Site
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{SITE.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {SITE.address.town}, {SITE.address.county}
          </p>

          {/* Service pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {SITE.services.map((slug) => {
              const svc = SERVICES[slug];
              const Icon = svc.icon;
              return (
                <span
                  key={slug}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${svc.pill}`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${svc.iconBg}`}>
                    <Icon className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                  {svc.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Edit button — wired up once real editing is built */}
        <button
          disabled
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
          title="Editing coming soon"
        >
          <Edit className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">

          {/* Address */}
          <Card>
            <CardSection title="Address" icon={MapPinned} iconColor={ICON_COLOR}>
              <address className="not-italic space-y-0.5 text-sm text-slate-700 leading-relaxed">
                <p>{SITE.address.line1}</p>
                <p>{SITE.address.line2}</p>
                <p>{SITE.address.town}</p>
                <p>{SITE.address.county}</p>
                <p className="font-medium">{SITE.address.postcode}</p>
              </address>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  [SITE.address.line1, SITE.address.line2, SITE.address.town, SITE.address.postcode].join(", ")
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Open in Google Maps
              </a>
            </CardSection>
          </Card>

          {/* Parking */}
          <Card>
            <CardSection title="Parking" icon={ParkingCircle} iconColor={ICON_COLOR}>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                {SITE.parking}
              </pre>
            </CardSection>
          </Card>

        </div>

        {/* Right column */}
        <div className="space-y-5">
          <Card padding={false}>
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Site Info
              </h3>
            </div>
            <dl className="divide-y divide-slate-100">
              <InfoRow label="Reference" value={SITE.reference} mono />
              <InfoRow label="Town" value={SITE.address.town} />
              <InfoRow label="Postcode" value={SITE.address.postcode} mono />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className={mono ? "font-mono text-slate-800" : "text-slate-800"}>{value}</dd>
    </div>
  );
}
