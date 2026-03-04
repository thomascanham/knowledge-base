"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Discipline, Manufacturer } from "@prisma/client";

interface ProductFormProps {
  disciplines: Discipline[];
  manufacturers: Manufacturer[];
  product?: {
    id: string;
    internalCode: string;
    model: string;
    disciplineId: number;
    manufacturerId: number;
    resetCodes?: string | null;
    engineerCodes?: string | null;
    defaultCodes?: string | null;
    walkTest?: string | null;
    commissioningQuirks?: string | null;
    commonFaults?: string | null;
    notes?: string | null;
  };
}

export function ProductForm({ disciplines, manufacturers, product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [form, setForm] = useState({
    internalCode: product?.internalCode ?? "",
    model: product?.model ?? "",
    disciplineId: String(product?.disciplineId ?? ""),
    manufacturerId: String(product?.manufacturerId ?? ""),
    resetCodes: product?.resetCodes ?? "",
    engineerCodes: product?.engineerCodes ?? "",
    defaultCodes: product?.defaultCodes ?? "",
    walkTest: product?.walkTest ?? "",
    commissioningQuirks: product?.commissioningQuirks ?? "",
    commonFaults: product?.commonFaults ?? "",
    notes: product?.notes ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.internalCode.trim()) next.internalCode = "Internal code is required";
    if (!/^[A-Z0-9-]+$/.test(form.internalCode.trim()))
      next.internalCode = "Uppercase letters, numbers and hyphens only";
    if (!form.model.trim()) next.model = "Model name is required";
    if (!form.disciplineId) next.disciplineId = "Select a discipline";
    if (!form.manufacturerId) next.manufacturerId = "Select a manufacturer";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      const payload = {
        ...form,
        disciplineId: parseInt(form.disciplineId),
        manufacturerId: parseInt(form.manufacturerId),
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
      setServerError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Identity */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Product Identity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Internal Code"
            required
            value={form.internalCode}
            onChange={(e) => update("internalCode", e.target.value.toUpperCase())}
            placeholder="FIRE-001"
            error={errors.internalCode}
            hint="Uppercase letters, numbers, hyphens"
          />
          <Input
            label="Model Name"
            required
            value={form.model}
            onChange={(e) => update("model", e.target.value)}
            placeholder="MX-5200"
            error={errors.model}
          />
          <Select
            label="Discipline"
            required
            value={form.disciplineId}
            onChange={(e) => update("disciplineId", e.target.value)}
            placeholder="Select discipline…"
            options={disciplines.map((d) => ({ value: d.id, label: d.name }))}
            error={errors.disciplineId}
          />
          <Select
            label="Manufacturer"
            required
            value={form.manufacturerId}
            onChange={(e) => update("manufacturerId", e.target.value)}
            placeholder="Select manufacturer…"
            options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
            error={errors.manufacturerId}
          />
        </div>
      </section>

      {/* Access Codes */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Access Codes</h2>
        <Textarea
          label="Reset Codes"
          value={form.resetCodes}
          onChange={(e) => update("resetCodes", e.target.value)}
          placeholder="e.g. 1234 (factory reset), 9999 (panel reset)"
          rows={3}
        />
        <Textarea
          label="Engineer Codes"
          value={form.engineerCodes}
          onChange={(e) => update("engineerCodes", e.target.value)}
          placeholder="e.g. Engineer menu: 1111"
          rows={3}
        />
        <Textarea
          label="Default Codes"
          value={form.defaultCodes}
          onChange={(e) => update("defaultCodes", e.target.value)}
          placeholder="e.g. User default: 0000"
          rows={3}
        />
      </section>

      {/* Procedures */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Procedures & Knowledge</h2>
        <Textarea
          label="Walk Test Procedure"
          value={form.walkTest}
          onChange={(e) => update("walkTest", e.target.value)}
          placeholder="Step-by-step walk test instructions…"
          rows={5}
        />
        <Textarea
          label="Commissioning Quirks"
          value={form.commissioningQuirks}
          onChange={(e) => update("commissioningQuirks", e.target.value)}
          placeholder="Known gotchas, non-obvious steps…"
          rows={4}
        />
        <Textarea
          label="Common Faults"
          value={form.commonFaults}
          onChange={(e) => update("commonFaults", e.target.value)}
          placeholder="Recurring issues and resolutions…"
          rows={4}
        />
        <Textarea
          label="General Notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Any other useful information…"
          rows={3}
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
