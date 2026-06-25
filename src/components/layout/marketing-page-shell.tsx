"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionAmbient, type SectionAmbientTone } from "@/components/ui/section-ambient";

type MarketingPageShellProps = {
  children: ReactNode;
  tone?: SectionAmbientTone;
  maxWidth?: "md" | "5xl" | "6xl" | "7xl";
  particles?: boolean;
  blobs?: boolean;
  className?: string;
};

const MAX_WIDTH: Record<NonNullable<MarketingPageShellProps["maxWidth"]>, string> = {
  md: "max-w-md",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export function MarketingPageShell({
  children,
  tone = "cream",
  maxWidth = "5xl",
  particles = true,
  blobs = true,
  className,
}: MarketingPageShellProps) {
  return (
    <div className={cn("relative overflow-hidden border-b border-border/40", className)}>
      <SectionAmbient tone={tone} particles={particles} blobs={blobs} />
      <div
        className={cn(
          "relative z-[2] mx-auto px-4 py-12 md:py-16",
          MAX_WIDTH[maxWidth]
        )}
      >
        {children}
      </div>
    </div>
  );
}
