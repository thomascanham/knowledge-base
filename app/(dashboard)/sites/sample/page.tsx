import {
  MapPin, ArrowLeft, ChevronRight, MapPinned, Building2,
  ParkingCircle, Edit, Flame, ShieldAlert, Camera, KeyRound, Bell, Lightbulb,
  CheckCircle, X, ArrowUpRight, ShieldCheck, Radio,
} from "lucide-react";
import { Card, CardSection } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Thornfield Business Park — Sites" };

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceSlug = "fire" | "intruder" | "cctv" | "access-control" | "nurse-call" | "emergency-lights";

interface CodeEntry { name: string; value: string }

interface FirePanel {
  id: string;           // product ID — links into the Bible
  name: string;         // denormalised for display
  siteOverrideCodes: CodeEntry[] | null;  // null = use panel defaults
}

interface Monitoring {
  by: "brodman" | "third-party" | "none";
  company: string | null;    // third-party company name
  reference: string | null;  // DW number / URN / monitoring code
}

interface VisitTask {
  discipline: ServiceSlug;
  description: string;
}

interface Visit {
  sitePercentage: string | null;  // e.g. "100%", "50%", null if not applicable
  tasks: VisitTask[];
}

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

const FIRE_ALARM = {
  category: "L2",
  detectorMake: "Apollo",
  mcpMake: "Apollo",
  sounderMake: "Fulleon",
  monitoring: {
    by: "brodman",
    company: null,
    reference: null,
  } satisfies Monitoring,
  fireTriggersIntruder: true,
  doorsLinked: false,
  plantLinked: false,
  other: "Zone 4 covers the plant room only — do not silence without facilities manager authorisation.",
  panels: [
    {
      id: "sample-panel-1",
      name: "Advanced MxPro 5 (4-loop) — Main Building",
      siteOverrideCodes: [
        { name: "Engineer", value: "1234" },
        { name: "Manager", value: "9876" },
      ],
    },
    {
      id: "sample-panel-2",
      name: "Advanced MxPro 5 (2-loop) — Annexe",
      siteOverrideCodes: null,  // uses panel defaults from the Bible
    },
  ] satisfies FirePanel[],
};

const FIRE_ALARM_CATEGORIES: Record<string, string> = {
  L1: "L1 — Full automatic protection",
  L2: "L2 — Defined areas & escape routes",
  L3: "L3 — Escape routes only",
  L4: "L4 — Corridors & circulation areas",
  L5: "L5 — Specific area protection",
  P1: "P1 — Full property protection",
  P2: "P2 — Partial property protection",
  M:  "M — Manual only",
};

const VISITS: Visit[] = [
  {
    sitePercentage: "50%",
    tasks: [
      { discipline: "fire",     description: "50% full fire alarm test" },
      { discipline: "intruder", description: "50% full intruder test" },
      { discipline: "cctv",     description: "Full CCTV health check & footage review" },
    ],
  },
  {
    sitePercentage: "50%",
    tasks: [
      { discipline: "fire",     description: "50% full fire alarm test + 1hr EL test" },
      { discipline: "intruder", description: "50% full intruder test" },
    ],
  },
  { sitePercentage: null, tasks: [] },
  { sitePercentage: null, tasks: [] },
];

// ─── Service config ───────────────────────────────────────────────────────────

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
const FIRE_COLOR = "bg-red-50 text-red-600";

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

        <button
          disabled
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
          title="Editing coming soon"
        >
          <Edit className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>
      </div>

      {/*
        LAYOUT NOTE
        -----------
        Current: single full-width column (space-y-6) — all cards span the full max-w-5xl container.

        Previous: two-column grid with a right sidebar:
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              ... Address, Parking, Areas for Visit, Fire Alarm ...
            </div>
            <div className="space-y-5">
              <Card padding={false}>   ← "Site Info" sidebar card
                Reference / Town / Postcode rows
              </Card>
            </div>
          </div>

        Reason for change: the "Areas for Visit" 4-card row was too cramped inside the
        2/3-width main column. Going full-width gives the visit cards enough breathing room.
        To revert, restore the grid wrapper above and re-add the Site Info sidebar card.
      */}
      {/* Content */}
      <div className="space-y-6">

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

          {/* Areas for Visit */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Areas for Visit</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {VISITS.map((visit, i) => (
                <VisitCard key={i} number={i + 1} visit={visit} />
              ))}
            </div>
          </div>

          {/* Fire Alarm */}
          <Card>
            <CardSection title="Fire Alarm" icon={Flame} iconColor={FIRE_COLOR}>
              <div className="space-y-5">

                {/* Category & makes */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <SpecRow label="Category">
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      {FIRE_ALARM_CATEGORIES[FIRE_ALARM.category] ?? FIRE_ALARM.category}
                    </span>
                  </SpecRow>
                  <SpecRow label="Detector Make">{FIRE_ALARM.detectorMake}</SpecRow>
                  <SpecRow label="MCP Make">{FIRE_ALARM.mcpMake}</SpecRow>
                  <SpecRow label="Sounder Make">{FIRE_ALARM.sounderMake}</SpecRow>
                </div>

                {/* Monitoring */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Monitoring
                  </p>
                  <MonitoringDisplay monitoring={FIRE_ALARM.monitoring} />
                </div>

                {/* Integrations */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Integrations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <BoolChip value={FIRE_ALARM.fireTriggersIntruder}  trueLabel="Triggers intruder"      falseLabel="No intruder link" />
                    <BoolChip value={FIRE_ALARM.doorsLinked}           trueLabel="Doors linked"           falseLabel="Doors not linked" />
                    <BoolChip value={FIRE_ALARM.plantLinked}           trueLabel="Plant linked"           falseLabel="Plant not linked" />
                  </div>
                </div>

                {/* Panels */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Fire Panels ({FIRE_ALARM.panels.length})
                  </p>
                  <div className="space-y-3">
                    {FIRE_ALARM.panels.map((panel) => (
                      <PanelEntry key={panel.id} panel={panel} />
                    ))}
                  </div>
                </div>

                {/* Other notes */}
                {FIRE_ALARM.other && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Other</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{FIRE_ALARM.other}</p>
                  </div>
                )}

              </div>
            </CardSection>
          </Card>

      </div>

    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className={mono ? "font-mono text-slate-800" : "text-slate-800"}>{value}</dd>
    </div>
  );
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{children}</span>
    </div>
  );
}

function MonitoringDisplay({ monitoring }: { monitoring: Monitoring }) {
  if (monitoring.by === "none") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        <X className="h-3 w-3" aria-hidden="true" />
        Not monitored
      </span>
    );
  }

  if (monitoring.by === "brodman") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Monitored by Brodman
      </span>
    );
  }

  // Third-party
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
        <Radio className="h-3.5 w-3.5" aria-hidden="true" />
        {monitoring.company ?? "Third-party monitoring"}
      </span>
      {monitoring.reference && (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600">
          DW / Ref: {monitoring.reference}
        </span>
      )}
    </div>
  );
}

function VisitCard({ number, visit }: { number: number; visit: Visit }) {
  const isEmpty = visit.tasks.length === 0 && !visit.sitePercentage;

  return (
    <div
      className={
        isEmpty
          ? "rounded-xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center min-h-36 text-center"
          : "rounded-xl border border-slate-200 bg-white shadow-sm p-4 space-y-3"
      }
    >
      {/* Visit number header */}
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
          {number}
        </span>
        <span className={`text-sm font-semibold ${isEmpty ? "text-slate-400" : "text-slate-800"}`}>
          Visit {number}
        </span>
        {visit.sitePercentage && (
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {visit.sitePercentage}
          </span>
        )}
      </div>

      {isEmpty ? (
        <p className="text-xs text-slate-400 mt-1">Not scheduled</p>
      ) : (
        <ul className="space-y-2">
          {visit.tasks.map((task, i) => {
            const svc = SERVICES[task.discipline];
            const Icon = svc.icon;
            return (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${svc.iconBg}`}>
                  <Icon className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
                <span className="text-xs text-slate-600 leading-snug">{task.description}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function BoolChip({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
  return value ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
      <CheckCircle className="h-3 w-3" aria-hidden="true" />
      {trueLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
      <X className="h-3 w-3" aria-hidden="true" />
      {falseLabel}
    </span>
  );
}

function PanelEntry({ panel }: { panel: FirePanel }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2.5">
      {/* Panel name — links to product in the Bible */}
      <Link
        href={`/products/${panel.id}`}
        className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 hover:underline transition-colors"
      >
        <Flame className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{panel.name}</span>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      </Link>

      {/* Codes */}
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Access Codes
        </p>
        {panel.siteOverrideCodes ? (
          <div className="space-y-1">
            {panel.siteOverrideCodes.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-slate-500">{c.name}</span>
                <code className="rounded bg-amber-50 px-2 py-0.5 font-mono text-sm font-medium text-amber-800">
                  {c.value}
                </code>
              </div>
            ))}
          </div>
        ) : (
          <Link
            href={`/products/${panel.id}`}
            className="inline-flex items-center gap-1 text-xs text-slate-400 italic hover:text-blue-600 hover:not-italic transition-colors"
          >
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            Uses panel defaults — view on product page
          </Link>
        )}
      </div>
    </div>
  );
}
