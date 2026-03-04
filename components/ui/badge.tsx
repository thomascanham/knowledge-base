import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  fire: "bg-red-100 text-red-800 border-red-200",
  intruder: "bg-orange-100 text-orange-800 border-orange-200",
  cctv: "bg-blue-100 text-blue-800 border-blue-200",
  "access-control": "bg-purple-100 text-purple-800 border-purple-200",
  "nurse-call": "bg-green-100 text-green-800 border-green-200",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
} as const;

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/** Render a discipline badge with the correct colour automatically. */
export function DisciplineBadge({ slug, name }: { slug: string; name: string }) {
  const knownVariants = ["fire", "intruder", "cctv", "access-control", "nurse-call"] as const;
  const variant = knownVariants.includes(slug as (typeof knownVariants)[number])
    ? (slug as keyof typeof variants)
    : "default";

  return <Badge variant={variant}>{name}</Badge>;
}
