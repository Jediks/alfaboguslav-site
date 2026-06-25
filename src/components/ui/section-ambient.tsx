"use client";

import { cn } from "@/lib/utils";
import { LightSectionParticles } from "@/components/ui/light-section-particles";

export type SectionAmbientTone = "white" | "cream" | "warm";

type SectionAmbientProps = {
  tone?: SectionAmbientTone;
  className?: string;
  blobs?: boolean;
  particles?: boolean;
  particleDensity?: number;
};

export function SectionAmbient({
  tone = "cream",
  className,
  blobs = true,
  particles = true,
  particleDensity,
}: SectionAmbientProps) {
  return (
    <>
      <div
        className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
        aria-hidden
      >
        <div
          className={cn("absolute inset-0 z-0 section-ambient-base", `section-ambient-base--${tone}`)}
        />
        <div className="absolute inset-0 z-0 section-ambient-pattern" />
        <div className="absolute inset-0 z-0 grain opacity-[0.28]" />
        {blobs ? (
          <>
            <div className="section-ambient-blob section-ambient-blob--primary z-[1]" />
            <div className="section-ambient-blob section-ambient-blob--navy z-[1]" />
            <div className="section-ambient-blob section-ambient-blob--gold z-[1]" />
          </>
        ) : null}
      </div>
      {particles ? (
        <LightSectionParticles
          density={particleDensity}
          className="absolute inset-0 z-[1]"
        />
      ) : null}
    </>
  );
}
