"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function SnowParticles() {
  const [particles, setParticles] = useState<
    { id: number; x: number; size: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/60"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            top: -10,
          }}
          animate={{ y: ["0vh", "110vh"], opacity: [0, 0.8, 0] }}
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
