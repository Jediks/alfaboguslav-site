"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Particle = {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  kind: "snow" | "gold";
};

export function HeroAmbience() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * (i % 3 === 0 ? 5 : 3) + 1.5,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 6,
        kind: i % 4 === 0 ? "gold" : "snow",
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            top: -10,
            background:
              p.kind === "gold"
                ? "radial-gradient(circle, rgba(212,175,55,0.9) 0%, rgba(212,175,55,0) 70%)"
                : "rgba(255,255,255,0.55)",
            boxShadow: p.kind === "gold" ? "0 0 8px rgba(212,175,55,0.5)" : undefined,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: p.kind === "gold" ? [0, 12, -8, 0] : 0,
            opacity: p.kind === "gold" ? [0, 0.9, 0.6, 0] : [0, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
