"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ManufacturerFormProps {
  manufacturer?: {
    id: number;
    name: string;
    website: string | null;
    phone: string | null;
    supportPhone: string | null;
    supportEmail: string | null;
    address: string | null;
    notes: string | null;
  };
}

export function ManufacturerForm({ manufacturer }: ManufacturerFormProps) {
  const router = useRouter();
  const isEditing = !!manufacturer;

  const [form, setForm] = useState({
    name:          manufacturer?.name ?? "",
    website:       manufacturer?.website ?? "",
    phone:         manufacturer?.phone ?? "",
    supportPhone:  manufacturer?.supportPhone ?? "",
    supportEmail:  manufacturer?.supportEmail ?? "",
    address:       manufacturer?.address ?? "",
    notes:         manufacturer?.notes ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      next.website = "Must start with http:// or https://";
    }
    if (form.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail)) {
      next.supportEmail = "Must be a valid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      const url = isEditing
        ? `/api/manufacturers/${manufacturer!.id}`
        : "/api/manufacturers";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.message ?? "Something went wrong.");
        return;
      }

      const data = await res.json();
      router.push(`/manufacturers/${data.id}`);
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Identity */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Manufacturer Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Manufacturer Name"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Hochiki, Advanced Electronics, Texecom"
              error={errors.name}
            />
          </div>
          <Input
            label="Website"
            type="url"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://www.example.com"
            error={errors.website}
          />
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Main Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. 01234 567890"
            hint="General enquiries / sales"
          />
          <Input
            label="Technical Support Phone"
            type="tel"
            value={form.supportPhone}
            onChange={(e) => update("supportPhone", e.target.value)}
            placeholder="e.g. 01234 567891"
            hint="The number engineers call for technical help"
          />
          <div className="sm:col-span-2">
            <Input
              label="Technical Support Email"
              type="email"
              value={form.supportEmail}
              onChange={(e) => update("supportEmail", e.target.value)}
              placeholder="techsupport@example.com"
              error={errors.supportEmail}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Registered or main office address"
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Notes</h2>
        <Textarea
          label="Internal Notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder={`Useful information for engineers and office staff. e.g.:\n- Technical portal login: https://partner.example.com (credentials in password manager)\n- Warranty claims: email warranty@example.com with job ref\n- Lead time for parts: typically 3–5 working days\n- Rep: John Smith — 07700 900123`}
          rows={6}
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? "Save Changes" : "Add Manufacturer"}
        </Button>
      </div>
    </form>
  );
}
