"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ParticleKind = "frost" | "navy" | "gold" | "primary";

type Particle = {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  kind: ParticleKind;
  drift: number;
};

const PARTICLE_STYLE: Record<
  ParticleKind,
  { background: string; boxShadow: string; border?: string }
> = {
  frost: {
    background: "hsl(0 0% 100% / 0.88)",
    border: "1px solid hsl(212 55% 24% / 0.22)",
    boxShadow: "0 0 10px hsl(212 55% 24% / 0.12), 0 1px 3px hsl(212 55% 24% / 0.1)",
  },
  navy: {
    background: "hsl(212 55% 24% / 0.38)",
    boxShadow: "0 0 8px hsl(212 55% 24% / 0.2)",
  },
  primary: {
    background: "hsl(352 78% 44% / 0.28)",
    boxShadow: "0 0 8px hsl(352 78% 44% / 0.18)",
  },
  gold: {
    background: "radial-gradient(circle, hsl(42 90% 52%) 0%, hsl(42 80% 55% / 0.4) 45%, transparent 72%)",
    boxShadow: "0 0 12px hsl(42 80% 55% / 0.55)",
  },
};

function pickKind(index: number): ParticleKind {
  if (index % 5 === 0) return "gold";
  if (index % 4 === 0) return "primary";
  if (index % 2 === 0) return "navy";
  return "frost";
}

type LightSectionParticlesProps = {
  density?: number;
  className?: string;
};

export function LightSectionParticles({
  density = 56,
  className,
}: LightSectionParticlesProps) {
  const reducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: density }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size:
          pickKind(i) === "gold"
            ? Math.random() * 3 + 4
            : Math.random() * 3.5 + 2.5,
        duration: Math.random() * 8 + 10,
        delay: Math.random() * 6,
        kind: pickKind(i),
        drift: (Math.random() - 0.5) * 32,
      }))
    );
  }, [density]);

  if (reducedMotion) {
    return (
      <div
        className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
        aria-hidden
        data-testid="light-section-particles-static"
      >
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 17 + 8) % 94}%`,
              top: `${(i * 23 + 5) % 88}%`,
              width: i % 5 === 0 ? 5 : 3,
              height: i % 5 === 0 ? 5 : 3,
              background:
                i % 5 === 0
                  ? "hsl(42 80% 55% / 0.55)"
                  : i % 2 === 0
                    ? "hsl(212 55% 24% / 0.28)"
                    : "hsl(0 0% 100% / 0.85)",
              boxShadow: "0 0 6px hsl(212 55% 24% / 0.12)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
      data-testid="light-section-particles"
    >
      {particles.map((p) => {
        const visual = PARTICLE_STYLE[p.kind];
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              top: -12,
              background: visual.background,
              boxShadow: visual.boxShadow,
              border: visual.border,
            }}
            animate={{
              y: ["0vh", "115vh"],
              x:
                p.kind === "gold" || p.kind === "primary"
                  ? [0, p.drift, -p.drift * 0.7, 0]
                  : [0, p.drift * 0.45, -p.drift * 0.25, 0],
              opacity:
                p.kind === "gold"
                  ? [0, 1, 0.75, 0]
                  : p.kind === "navy" || p.kind === "primary"
                    ? [0, 0.85, 0.55, 0]
                    : [0, 0.9, 0.55, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}
