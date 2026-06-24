"use client";

import { motion } from "framer-motion";

type SparkleBurstProps = {
  active: boolean;
};

const SPARKLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  distance: 40 + (i % 5) * 18,
  size: 4 + (i % 3) * 2,
  delay: (i % 6) * 0.02,
}));

export function SparkleBurst({ active }: SparkleBurstProps) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {SPARKLES.map((s) => {
        const rad = (s.angle * Math.PI) / 180;
        const x = Math.cos(rad) * s.distance;
        const y = Math.sin(rad) * s.distance;
        return (
          <motion.span
            key={s.id}
            className="absolute left-1/2 top-1/2 rounded-full bg-gold"
            style={{ width: s.size, height: s.size }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x, y, opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.85, delay: s.delay, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </div>
  );
}
