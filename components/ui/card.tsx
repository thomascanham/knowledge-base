import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ className?: string }>;

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hoverable?: boolean;
}

export function Card({ children, className, padding = true, hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-sm",
        hoverable && "transition-shadow hover:shadow-md",
        padding && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-900", className)}>
      {children}
    </h3>
  );
}

export function CardSection({
  title,
  icon: Icon,
  iconColor,
  children,
  className,
}: {
  title?: string;
  icon?: IconComponent;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("", className)}>
      {title && (
        <div className="-mx-5 -mt-5 mb-4 border-b border-slate-100 bg-slate-50 px-5 py-3 flex items-center gap-3">
          {Icon && iconColor && (
            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", iconColor)}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          )}
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
      )}
      {children}
    </section>
  );
}
