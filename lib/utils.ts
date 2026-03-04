import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a URL-safe slug from a string. */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Format file size in human-readable form. */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/** Discipline colours — shared between server and client. */
export const DISCIPLINE_COLORS: Record<string, string> = {
  fire: "#EF4444",
  intruder: "#F97316",
  cctv: "#3B82F6",
  "access-control": "#8B5CF6",
  "nurse-call": "#22C55E",
};

/** Map discipline slugs to Tailwind classes for badges. */
export const DISCIPLINE_BADGE_CLASSES: Record<string, string> = {
  fire: "bg-red-100 text-red-800 border-red-200",
  intruder: "bg-orange-100 text-orange-800 border-orange-200",
  cctv: "bg-blue-100 text-blue-800 border-blue-200",
  "access-control": "bg-purple-100 text-purple-800 border-purple-200",
  "nurse-call": "bg-green-100 text-green-800 border-green-200",
};

/** Truncate long strings for list previews. */
export function truncate(str: string, length = 120): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "…";
}

/** Escape special MySQL FULLTEXT boolean mode characters. */
export function escapeFullTextQuery(query: string): string {
  // Remove characters that break MySQL FULLTEXT boolean mode
  return query.replace(/[+\-><()"~*@]/g, " ").trim();
}
