import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  size?: "default" | "hero";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  align = "left",
  size = "default",
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 md:mb-10",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={cn(
          "text-balance font-display font-semibold tracking-tight text-brand-blue",
          eyebrow ? "mt-3" : "",
          size === "hero"
            ? "text-4xl md:text-5xl"
            : "text-[1.75rem] md:text-3xl",
          align === "center" && "mx-auto"
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base",
            align === "center" && "mx-auto",
            size === "hero" && "max-w-3xl text-base md:text-lg"
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
