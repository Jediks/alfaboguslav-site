"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ParticleKind = "flake" | "navy" | "gold";

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
  { background: string; boxShadow?: string; border?: string }
> = {
  flake: {
    background: "hsl(0 0% 100% / 0.92)",
    boxShadow: "0 0 8px hsl(212 55% 24% / 0.06), 0 1px 2px hsl(212 55% 24% / 0.04)",
    border: "1px solid hsl(212 55% 24% / 0.06)",
  },
  navy: {
    background: "hsl(212 55% 24% / 0.14)",
    boxShadow: "0 0 4px hsl(212 55% 24% / 0.08)",
  },
  gold: {
    background: "radial-gradient(circle, hsl(42 80% 55% / 0.85) 0%, transparent 72%)",
    boxShadow: "0 0 8px hsl(42 80% 55% / 0.4)",
  },
};

type LightSectionParticlesProps = {
  density?: number;
};

export function LightSectionParticles({ density = 42 }: LightSectionParticlesProps) {
  const reducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: density }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * (i % 4 === 0 ? 4 : 2.5) + 1.5,
        duration: Math.random() * 14 + 16,
        delay: Math.random() * 10,
        kind: i % 6 === 0 ? "gold" : i % 4 === 0 ? "navy" : "flake",
        drift: (Math.random() - 0.5) * 28,
      }))
    );
  }, [density]);

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
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
              top: -8,
              background: visual.background,
              boxShadow: visual.boxShadow,
              border: visual.border,
            }}
            animate={{
              y: ["0vh", "110vh"],
              x:
                p.kind === "gold"
                  ? [0, p.drift, -p.drift * 0.65, 0]
                  : [0, p.drift * 0.35, -p.drift * 0.2, 0],
              opacity:
                p.kind === "gold"
                  ? [0, 0.9, 0.55, 0]
                  : p.kind === "navy"
                    ? [0, 0.5, 0.3, 0]
                    : [0, 0.75, 0.45, 0],
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
