"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/guides/rich-text-editor";
import type { Discipline, Product, Manufacturer, Discipline as D } from "@prisma/client";

type ProductWithRelations = Product & {
  discipline: D;
  manufacturer: Manufacturer;
};

interface GuideFormProps {
  disciplines: Discipline[];
  products: ProductWithRelations[];
  guide?: {
    id: string;
    title: string;
    guideType: string;
    disciplineId?: number | null;
    difficulty?: string | null;
    estimatedTime?: string | null;
    content: string;
    isPublished: boolean;
    products: Array<{ product: { id: string } }>;
  };
}

export function GuideForm({ disciplines, products, guide }: GuideFormProps) {
  const router = useRouter();
  const isEditing = !!guide;

  const [form, setForm] = useState({
    title: guide?.title ?? "",
    guideType: guide?.guideType ?? "GENERAL",
    disciplineId: guide?.disciplineId ? String(guide.disciplineId) : "",
    difficulty: guide?.difficulty ?? "",
    estimatedTime: guide?.estimatedTime ?? "",
    isPublished: guide?.isPublished ?? true,
    content: guide?.content ?? "",
  });

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    guide?.products.map((p) => p.product.id) ?? []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.content.trim() || form.content === "<p></p>")
      next.content = "Guide content is required";
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
        disciplineId: form.disciplineId ? parseInt(form.disciplineId) : null,
        difficulty: form.difficulty || null,
        estimatedTime: form.estimatedTime || null,
        productIds: selectedProductIds,
      };

      const url = isEditing ? `/api/guides/${guide!.id}` : "/api/guides";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.message ?? "Something went wrong.");
        return;
      }

      const data = await res.json();
      router.push(`/guides/${data.id}`);
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
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Metadata */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Guide Details</h2>
        <Input
          label="Title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. How to commission the MX-5200 panel"
          error={errors.title}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Guide Type"
            value={form.guideType}
            onChange={(e) => update("guideType", e.target.value)}
            options={[
              { value: "GENERAL", label: "General Guide" },
              { value: "PRODUCT_SPECIFIC", label: "Product-Specific Guide" },
            ]}
          />
          <Select
            label="Discipline"
            value={form.disciplineId}
            onChange={(e) => update("disciplineId", e.target.value)}
            placeholder="Any discipline"
            options={disciplines.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Select
            label="Difficulty"
            value={form.difficulty}
            onChange={(e) => update("difficulty", e.target.value)}
            placeholder="Not specified"
            options={[
              { value: "BEGINNER", label: "Beginner" },
              { value: "INTERMEDIATE", label: "Intermediate" },
              { value: "ADVANCED", label: "Advanced" },
            ]}
          />
          <Input
            label="Estimated Time"
            value={form.estimatedTime}
            onChange={(e) => update("estimatedTime", e.target.value)}
            placeholder="e.g. 30 mins, 2 hours"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => update("isPublished", e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Published (visible to all users)</span>
        </label>
      </section>

      {/* Content */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Content</h2>
          {errors.content && (
            <p className="mt-1 text-xs text-red-600">{errors.content}</p>
          )}
        </div>
        <RichTextEditor
          content={form.content}
          onChange={(html) => update("content", html)}
        />
      </section>

      {/* Linked Products */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Linked Products{" "}
          <span className="font-normal text-slate-500">
            ({selectedProductIds.length} selected)
          </span>
        </h2>
        <div className="max-h-60 overflow-y-auto space-y-1 rounded-md border border-slate-200 p-2">
          {products.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selectedProductIds.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="min-w-0 flex-1 text-sm text-slate-700 truncate">
                {p.model}
                <span className="ml-1.5 text-xs text-slate-400">{p.internalCode}</span>
              </span>
              <span className="shrink-0 text-[11px] text-slate-400">{p.discipline.name}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? "Save Changes" : "Create Guide"}
        </Button>
      </div>
    </form>
  );
}
