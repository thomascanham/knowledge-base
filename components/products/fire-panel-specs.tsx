import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

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

export function FirePanelSpecs({ specs }: { specs: Record<string, unknown> }) {
  const panelType = String(specs.panelType ?? "");
  const protocol = String(specs.protocol ?? "");
  const standards = Array.isArray(specs.standards) ? (specs.standards as string[]) : [];

  const hasCapacities = specs.zoneCapacity || specs.loopCapacity || specs.maxDevicesPerLoop;
  const hasPower = specs.batteryBackup || specs.psuvoltage;
  const hasNetwork = specs.repeaterCapable || specs.networkCapable;
  const hasEol = specs.eolResistorValue;
  const hasStandards = standards.length > 0;

  const hasAnySpec =
    panelType || protocol || hasCapacities || hasPower || hasNetwork || hasEol || hasStandards;

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
