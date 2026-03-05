import { cn } from "@/lib/utils";
import { CheckCircle, KeyRound, Key } from "lucide-react";

const PANEL_TYPE_LABELS: Record<string, string> = {
  "addressable": "Addressable",
  "conventional": "Conventional",
  "wireless": "Wireless",
  "hybrid": "Hybrid (Addressable + Conventional)",
  "analogue-addressable": "Analogue Addressable",
};

const PROTOCOL_LABELS: Record<string, string> = {
  "apollo-xp95": "Apollo XP95",
  "apollo-discovery": "Apollo Discovery",
  "apollo-xp95-discovery": "Apollo XP95 & Discovery",
  "hochiki-esp": "Hochiki ESP",
  "hochiki-chq": "Hochiki CHQ",
  "nittan": "Nittan",
  "argus": "Argus",
  "conventional": "Conventional (No Protocol)",
  "proprietary": "Proprietary",
  "other": "Other",
};

interface SpecRowProps {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}

function SpecRow({ label, value, mono }: SpecRowProps) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-44 shrink-0 text-xs font-medium text-slate-500">{label}</span>
      <span className={cn("text-sm text-slate-900", mono && "font-mono")}>{value}</span>
    </div>
  );
}

interface CodeEntry { name: string; value: string }
interface PanelKeyEntry { name: string; info: string }

export function FirePanelSpecs({ specs }: { specs: Record<string, unknown> }) {
  const panelType = String(specs.panelType ?? "");
  const protocol = String(specs.protocol ?? "");
  const standards = Array.isArray(specs.standards) ? (specs.standards as string[]) : [];
  const codes = Array.isArray(specs.codes) ? (specs.codes as CodeEntry[]).filter(c => c.name || c.value) : [];
  const keys = Array.isArray(specs.keys) ? (specs.keys as PanelKeyEntry[]).filter(k => k.name || k.info) : [];

  const hasCapacities = specs.zoneCapacity || specs.loopCapacity || specs.maxDevicesPerLoop;
  const hasPower = specs.batteryBackup || specs.psuvoltage;
  const hasNetwork = specs.repeaterCapable || specs.networkCapable;
  const hasEol = specs.eolResistorValue;
  const hasStandards = standards.length > 0;
  const hasCodes = codes.length > 0;
  const hasKeys = keys.length > 0;

  const hasAnySpec =
    panelType || protocol || hasCapacities || hasPower || hasNetwork || hasEol || hasStandards || hasCodes || hasKeys;

  if (!hasAnySpec) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-red-50 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
          Panel Specifications
        </span>
      </div>

      <div className="divide-y divide-slate-100 px-5">
        {/* Type & protocol */}
        {(panelType || protocol) && (
          <div className="py-3 space-y-0">
            {panelType && (
              <SpecRow
                label="Panel Type"
                value={PANEL_TYPE_LABELS[panelType] ?? panelType}
              />
            )}
            {protocol && (
              <SpecRow
                label="Protocol"
                value={PROTOCOL_LABELS[protocol] ?? protocol}
              />
            )}
          </div>
        )}

        {/* Capacities */}
        {hasCapacities && (
          <div className="grid grid-cols-3 gap-4 py-4">
            {specs.zoneCapacity ? (
              <CapacityTile label="Zones" value={String(specs.zoneCapacity)} />
            ) : null}
            {specs.loopCapacity ? (
              <CapacityTile label="Loops" value={String(specs.loopCapacity)} />
            ) : null}
            {specs.maxDevicesPerLoop ? (
              <CapacityTile label="Devices/Loop" value={String(specs.maxDevicesPerLoop)} />
            ) : null}
          </div>
        )}

        {/* Power */}
        {hasPower && (
          <div className="py-3">
            <SpecRow label="Battery Backup" value={specs.batteryBackup as string} />
            <SpecRow label="PSU Voltage" value={specs.psuvoltage as string} />
          </div>
        )}

        {/* Technical */}
        {(hasEol || hasNetwork) && (
          <div className="py-3">
            <SpecRow label="EOL Resistor" value={specs.eolResistorValue as string} mono />
            {specs.repeaterCapable && (
              <SpecRow
                label="Repeater Capable"
                value={specs.repeaterCapable === "yes" ? "Yes" : "No"}
              />
            )}
            {specs.networkCapable && (
              <SpecRow
                label="Network Capable"
                value={specs.networkCapable === "yes" ? "Yes" : "No"}
              />
            )}
          </div>
        )}

        {/* Access Codes */}
        {hasCodes && (
          <div className="py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Access Codes</span>
            </div>
            <div className="space-y-1.5">
              {codes.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 text-xs text-slate-500">{c.name || "—"}</span>
                  <code className="rounded bg-amber-50 px-2 py-0.5 font-mono text-sm font-medium text-amber-800">
                    {c.value || "—"}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel Keys */}
        {hasKeys && (
          <div className="py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Panel Keys</span>
            </div>
            <div className="space-y-1.5">
              {keys.map((k, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-44 shrink-0 text-xs text-slate-500">{k.name || "—"}</span>
                  <span className="text-sm text-slate-700">{k.info || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standards */}
        {hasStandards && (
          <div className="flex items-start gap-3 py-3">
            <span className="w-44 shrink-0 text-xs font-medium text-slate-500">Standards</span>
            <div className="flex flex-wrap gap-1.5">
              {standards.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"
                >
                  <CheckCircle className="h-3 w-3" aria-hidden="true" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CapacityTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
