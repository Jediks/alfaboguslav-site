import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  hero?: boolean;
  className?: string;
};

export function StatCard({ label, value, icon: Icon, hint, hero, className }: StatCardProps) {
  return (
    <div className={cn("surface-panel rounded-2xl p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 tabular-nums font-semibold tracking-tight text-brand-blue",
          hero ? "text-3xl" : "text-2xl"
        )}
      >
        {value}
      </p>
      {hint ? <div className="mt-1.5">{hint}</div> : null}
    </div>
  );
}
