"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Manufacturer } from "@prisma/client";
import {
  Flame, KeyRound, RotateCcw, Footprints,
  Wrench, AlertTriangle, Zap, FileText, ChevronDown
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FirePanelSpecs {
  panelType: string;
  protocol: string;
  zoneCapacity: string;
  loopCapacity: string;
  maxDevicesPerLoop: string;
  eolResistorValue: string;
  zoneLedIndicators: string;
  batteryBackup: string;
  psuvoltage: string;
  standards: string[];
  repeaterCapable: string;
  networkCapable: string;
}

interface FirePanelData {
  // Identity
  internalCode: string;
  model: string;
  manufacturerId: string;
  // Specs (structured)
  specs: FirePanelSpecs;
  // Codes
  engineerCodes: string;
  defaultCodes: string;
  resetCodes: string;
  // Procedures (free text)
  walkTest: string;
  isolateProcedure: string;
  commissioningQuirks: string;
  commonFaults: string;
  notes: string;
}

interface FirePanelFormProps {
  manufacturers: Manufacturer[];
  disciplineId: number;
  /** Provided when editing an existing panel */
  product?: {
    id: string;
    internalCode: string;
    model: string;
    manufacturerId: number;
    engineerCodes: string | null;
    defaultCodes: string | null;
    resetCodes: string | null;
    walkTest: string | null;
    commissioningQuirks: string | null;
    commonFaults: string | null;
    notes: string | null;
    specs: FirePanelSpecs | null;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PANEL_TYPES = [
  { value: "addressable", label: "Addressable" },
  { value: "conventional", label: "Conventional" },
  { value: "wireless", label: "Wireless" },
  { value: "hybrid", label: "Hybrid (Addressable + Conventional)" },
  { value: "analogue-addressable", label: "Analogue Addressable" },
];

const PROTOCOLS = [
  { value: "apollo-xp95", label: "Apollo XP95" },
  { value: "apollo-discovery", label: "Apollo Discovery" },
  { value: "apollo-xp95-discovery", label: "Apollo XP95 & Discovery" },
  { value: "hochiki-esp", label: "Hochiki ESP" },
  { value: "hochiki-chq", label: "Hochiki CHQ" },
  { value: "nittan", label: "Nittan" },
  { value: "argus", label: "Argus" },
  { value: "conventional", label: "Conventional (No Protocol)" },
  { value: "proprietary", label: "Proprietary" },
  { value: "other", label: "Other" },
];

const STANDARDS = [
  "BS5839-1",
  "EN54-2",
  "EN54-4",
  "PD6662",
  "BS8629",
];

const EMPTY_SPECS: FirePanelSpecs = {
  panelType: "",
  protocol: "",
  zoneCapacity: "",
  loopCapacity: "",
  maxDevicesPerLoop: "",
  eolResistorValue: "",
  zoneLedIndicators: "",
  batteryBackup: "",
  psuvoltage: "",
  standards: [],
  repeaterCapable: "",
  networkCapable: "",
};

// ─── Section wrapper ─────────────────────────────────────────────────────────

function FormSection({
  title,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = true,
  optional = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconColor)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          {optional && (
            <span className="ml-2 text-xs text-slate-400">optional</span>
          )}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && <div className="border-t border-slate-100 px-5 py-5 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldRow({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={cn("grid gap-4", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-3")}>
      {children}
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-0.5 text-xs text-slate-400">{children}</p>;
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function FirePanelForm({ manufacturers, disciplineId, product }: FirePanelFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [form, setForm] = useState<FirePanelData>({
    internalCode: product?.internalCode ?? "",
    model: product?.model ?? "",
    manufacturerId: String(product?.manufacturerId ?? ""),
    specs: product?.specs ?? { ...EMPTY_SPECS },
    engineerCodes: product?.engineerCodes ?? "",
    defaultCodes: product?.defaultCodes ?? "",
    resetCodes: product?.resetCodes ?? "",
    walkTest: product?.walkTest ?? "",
    isolateProcedure: "",
    commissioningQuirks: product?.commissioningQuirks ?? "",
    commonFaults: product?.commonFaults ?? "",
    notes: product?.notes ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Generic field updaters
  function setField<K extends keyof FirePanelData>(key: K, value: FirePanelData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function setSpec<K extends keyof FirePanelSpecs>(key: K, value: FirePanelSpecs[K]) {
    setForm((f) => ({ ...f, specs: { ...f.specs, [key]: value } }));
  }

  function toggleStandard(std: string) {
    setForm((f) => {
      const current = f.specs.standards;
      const next = current.includes(std)
        ? current.filter((s) => s !== std)
        : [...current, std];
      return { ...f, specs: { ...f.specs, standards: next } };
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.internalCode.trim())
      next.internalCode = "Internal code is required";
    else if (!/^[A-Z0-9-]+$/.test(form.internalCode.trim()))
      next.internalCode = "Uppercase letters, numbers and hyphens only";
    if (!form.model.trim()) next.model = "Model name is required";
    if (!form.manufacturerId) next.manufacturerId = "Select a manufacturer";
    if (!form.specs.panelType) next.panelType = "Select a panel type";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      // Scroll to first error
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      // Merge isolate procedure into commissioningQuirks or its own notes section
      const payload = {
        internalCode: form.internalCode.trim().toUpperCase(),
        model: form.model.trim(),
        manufacturerId: parseInt(form.manufacturerId),
        disciplineId,
        specs: form.specs,
        engineerCodes: form.engineerCodes || null,
        defaultCodes: form.defaultCodes || null,
        resetCodes: form.resetCodes || null,
        walkTest: form.walkTest || null,
        commissioningQuirks: [
          form.commissioningQuirks,
          form.isolateProcedure ? `## Zone Isolation\n${form.isolateProcedure}` : "",
        ]
          .filter(Boolean)
          .join("\n\n") || null,
        commonFaults: form.commonFaults || null,
        notes: form.notes || null,
      };

      const url = isEditing ? `/api/products/${product!.id}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      router.push(`/products/${data.id}`);
      router.refresh();
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── 1. PANEL IDENTITY ─────────────────────────────────────────── */}
      <FormSection
        title="Panel Identity"
        icon={Flame}
        iconColor="bg-red-50 text-red-600"
        defaultOpen
      >
        <FieldRow cols={2}>
          <div>
            <Input
              label="Internal Code"
              required
              value={form.internalCode}
              onChange={(e) => setField("internalCode", e.target.value.toUpperCase())}
              placeholder="FP-001"
              error={errors.internalCode}
            />
            <FieldHint>Your internal reference code, e.g. FP-001, FIRE-HOCHIKI-01</FieldHint>
          </div>
          <Select
            label="Manufacturer"
            required
            value={form.manufacturerId}
            onChange={(e) => setField("manufacturerId", e.target.value)}
            placeholder="Select manufacturer…"
            options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
            error={errors.manufacturerId}
          />
        </FieldRow>
        <div>
          <Input
            label="Model Name"
            required
            value={form.model}
            onChange={(e) => setField("model", e.target.value)}
            placeholder="e.g. Advanced MX-5200, Hochiki FireNET, Texecom Premier 48"
            error={errors.model}
          />
        </div>
        <FieldRow cols={2}>
          <div data-error={errors.panelType ? true : undefined}>
            <Select
              label="Panel Type"
              required
              value={form.specs.panelType}
              onChange={(e) => setSpec("panelType", e.target.value)}
              placeholder="Select panel type…"
              options={PANEL_TYPES}
              error={errors.panelType}
            />
          </div>
          <Select
            label="Detection Protocol"
            value={form.specs.protocol}
            onChange={(e) => setSpec("protocol", e.target.value)}
            placeholder="Select protocol…"
            options={PROTOCOLS}
          />
        </FieldRow>
        <FieldRow cols={3}>
          <div>
            <Input
              label="Zone Capacity"
              type="number"
              min="0"
              value={form.specs.zoneCapacity}
              onChange={(e) => setSpec("zoneCapacity", e.target.value)}
              placeholder="e.g. 8"
            />
            <FieldHint>Max zones supported</FieldHint>
          </div>
          <div>
            <Input
              label="Loop Capacity"
              type="number"
              min="0"
              value={form.specs.loopCapacity}
              onChange={(e) => setSpec("loopCapacity", e.target.value)}
              placeholder="e.g. 4"
            />
            <FieldHint>Addressable loops</FieldHint>
          </div>
          <div>
            <Input
              label="Devices Per Loop"
              type="number"
              min="0"
              value={form.specs.maxDevicesPerLoop}
              onChange={(e) => setSpec("maxDevicesPerLoop", e.target.value)}
              placeholder="e.g. 126"
            />
            <FieldHint>Max devices per loop</FieldHint>
          </div>
        </FieldRow>

        {/* Standards checkboxes */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Standards Compliance</p>
          <div className="flex flex-wrap gap-2">
            {STANDARDS.map((std) => (
              <button
                key={std}
                type="button"
                onClick={() => toggleStandard(std)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  form.specs.standards.includes(std)
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                )}
              >
                {std}
              </button>
            ))}
          </div>
        </div>

        <FieldRow cols={2}>
          <div>
            <Input
              label="Battery Backup Duration"
              value={form.specs.batteryBackup}
              onChange={(e) => setSpec("batteryBackup", e.target.value)}
              placeholder="e.g. 24 hours, 72 hours"
            />
          </div>
          <div>
            <Input
              label="PSU Voltage"
              value={form.specs.psuvoltage}
              onChange={(e) => setSpec("psuvoltage", e.target.value)}
              placeholder="e.g. 24V DC"
            />
          </div>
        </FieldRow>

        <FieldRow cols={2}>
          <Select
            label="Repeater Capable"
            value={form.specs.repeaterCapable}
            onChange={(e) => setSpec("repeaterCapable", e.target.value)}
            placeholder="Unknown"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          <Select
            label="Network Capable"
            value={form.specs.networkCapable}
            onChange={(e) => setSpec("networkCapable", e.target.value)}
            placeholder="Unknown"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </FieldRow>
      </FormSection>

      {/* ── 2. ACCESS CODES ──────────────────────────────────────────────── */}
      <FormSection
        title="Access Codes"
        icon={KeyRound}
        iconColor="bg-amber-50 text-amber-600"
        defaultOpen
        optional
      >
        <p className="text-xs text-slate-500">
          The most-accessed section in the field — fill these in accurately.
        </p>
        <div>
          <Textarea
            label="Engineer / Installer Code"
            value={form.engineerCodes}
            onChange={(e) => setField("engineerCodes", e.target.value)}
            placeholder={`e.g.\nDefault: 1234\nLevel 3 access: 9999\nSounder silence: hold zone button 3 secs`}
            rows={4}
          />
          <FieldHint>Include all access levels and any non-obvious entry sequences</FieldHint>
        </div>
        <div>
          <Textarea
            label="Default User / Manager Code"
            value={form.defaultCodes}
            onChange={(e) => setField("defaultCodes", e.target.value)}
            placeholder={`e.g.\nDefault user code: 0000\nManager code: 1111`}
            rows={3}
          />
        </div>
        <div>
          <Textarea
            label="Reset / Panel Code"
            value={form.resetCodes}
            onChange={(e) => setField("resetCodes", e.target.value)}
            placeholder={`e.g.\nFactory reset: hold * + 9 on power up\nFull reset code: 9999`}
            rows={3}
          />
        </div>
      </FormSection>

      {/* ── 3. RESET PROCEDURE ───────────────────────────────────────────── */}
      <FormSection
        title="Reset Procedure"
        icon={RotateCcw}
        iconColor="bg-blue-50 text-blue-600"
        defaultOpen={false}
        optional
      >
        <div>
          <Textarea
            label="Full Reset Procedure"
            value={form.resetCodes}
            onChange={(e) => setField("resetCodes", e.target.value)}
            placeholder={`Step-by-step reset procedure. e.g.:\n1. Enter engineer code\n2. Navigate to Reset menu\n3. Select Full Reset\n4. Confirm with code\n5. Panel will restart — takes approx 30 seconds`}
            rows={7}
          />
          <FieldHint>
            Include how to handle a panel that won&apos;t reset, any known gotchas, and
            what LED/display states to expect during the process.
          </FieldHint>
        </div>
      </FormSection>

      {/* ── 4. WALK TEST ─────────────────────────────────────────────────── */}
      <FormSection
        title="Walk Test"
        icon={Footprints}
        iconColor="bg-green-50 text-green-600"
        defaultOpen={false}
        optional
      >
        <div>
          <Textarea
            label="Walk Test Procedure"
            value={form.walkTest}
            onChange={(e) => setField("walkTest", e.target.value)}
            placeholder={`e.g.:\n1. Enter engineer menu → Walk Test\n2. Panel display shows zone count\n3. Activate each device — panel logs activation without alarming\n4. Check each zone appears on display\n5. Exit walk test — panel confirms zone count\n\nNote: Sounders are silenced during walk test on this panel.`}
            rows={8}
          />
          <FieldHint>
            Include entry/exit procedure, whether sounders activate, what the
            display shows, and how to confirm all devices tested.
          </FieldHint>
        </div>
      </FormSection>

      {/* ── 5. ISOLATION ─────────────────────────────────────────────────── */}
      <FormSection
        title="Zone / Device Isolation"
        icon={Zap}
        iconColor="bg-purple-50 text-purple-600"
        defaultOpen={false}
        optional
      >
        <div>
          <Textarea
            label="How to Isolate a Zone or Device"
            value={form.isolateProcedure}
            onChange={(e) => setField("isolateProcedure", e.target.value)}
            placeholder={`e.g.:\nTo isolate a zone:\n1. Enter engineer code\n2. Navigate: Isolate → Zones\n3. Select zone number\n4. Confirm isolation\n5. LED goes amber for that zone\n\nTo isolate a single device (addressable):\n1. Enter engineer code\n2. Navigate: Isolate → Devices\n3. Enter loop and address\n4. Confirm\n\nNote: Isolated zones/devices shown on main display.`}
            rows={10}
          />
        </div>
      </FormSection>

      {/* ── 6. COMMISSIONING ─────────────────────────────────────────────── */}
      <FormSection
        title="Commissioning"
        icon={Wrench}
        iconColor="bg-indigo-50 text-indigo-600"
        defaultOpen={false}
        optional
      >
        <div>
          <Input
            label="EOL Resistor Value (Conventional)"
            value={form.specs.eolResistorValue}
            onChange={(e) => setSpec("eolResistorValue", e.target.value)}
            placeholder="e.g. 4.7kΩ, 6.8kΩ, 10kΩ"
            className="max-w-xs"
          />
          <FieldHint>End-of-line resistor value for conventional zones</FieldHint>
        </div>
        <div>
          <Textarea
            label="Commissioning Notes & Quirks"
            value={form.commissioningQuirks}
            onChange={(e) => setField("commissioningQuirks", e.target.value)}
            placeholder={`Known gotchas, non-obvious steps, things that catch engineers out. e.g.:\n- Loop must be terminated before devices auto-learn\n- Panel requires a full power cycle after config changes\n- Zone text max 16 characters on this firmware\n- Enable cause & effect before programming sounders`}
            rows={7}
          />
        </div>
      </FormSection>

      {/* ── 7. COMMON FAULTS ─────────────────────────────────────────────── */}
      <FormSection
        title="Common Faults & Fault Finding"
        icon={AlertTriangle}
        iconColor="bg-orange-50 text-orange-600"
        defaultOpen={false}
        optional
      >
        <div>
          <Textarea
            label="Common Faults & Resolutions"
            value={form.commonFaults}
            onChange={(e) => setField("commonFaults", e.target.value)}
            placeholder={`List recurring faults and how to resolve them. e.g.:\n\nFAULT: Earth fault on loop\n→ Check device wiring for insulation damage. Common on older SCI units.\n\nFAULT: Zone resistance high (>100Ω)\n→ Check EOL resistor value — this panel uses 4.7kΩ, not 6.8kΩ\n\nFAULT: Panel won't accept new devices on loop\n→ Loop must be set to 'learn' mode. Enter engineer menu → Loop → Learn mode.`}
            rows={10}
          />
        </div>
      </FormSection>

      {/* ── 8. GENERAL NOTES ─────────────────────────────────────────────── */}
      <FormSection
        title="General Notes"
        icon={FileText}
        iconColor="bg-slate-100 text-slate-500"
        defaultOpen={false}
        optional
      >
        <Textarea
          label="Additional Notes"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Anything else worth knowing — firmware quirks, documentation links, installation tips, known hardware revisions, etc."
          rows={5}
        />
      </FormSection>

      {/* ── ACTIONS ──────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white/90 px-5 py-4 shadow-lg backdrop-blur-sm">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? "Save Changes" : "Add Fire Panel"}
        </Button>
      </div>
    </form>
  );
}
