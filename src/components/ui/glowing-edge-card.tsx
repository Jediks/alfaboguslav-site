"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export type GlowingEdgeCardVariant = "light" | "dark";

export type GlowingEdgeCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlowingEdgeCardVariant;
  introAnimation?: boolean;
  children?: React.ReactNode;
};

const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision));
const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

function centerOfElement(rect: DOMRect) {
  return [rect.width / 2, rect.height / 2] as const;
}

function getPointerPosition(rect: DOMRect, e: ReactPointerEvent<HTMLDivElement> | PointerEvent) {
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return {
    pixels: [x, y] as const,
    percent: [clamp((100 / rect.width) * x), clamp((100 / rect.height) * y)] as const,
  };
}

function angleFromPointer(dx: number, dy: number) {
  if (dx === 0 && dy === 0) return 0;
  let angleDegrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (angleDegrees < 0) angleDegrees += 360;
  return angleDegrees;
}

function closenessToEdge(rect: DOMRect, x: number, y: number) {
  const [cx, cy] = centerOfElement(rect);
  const dx = x - cx;
  const dy = y - cy;
  let kX = Infinity;
  let kY = Infinity;
  if (dx !== 0) kX = cx / Math.abs(dx);
  if (dy !== 0) kY = cy / Math.abs(dy);
  return clamp(1 / Math.min(kX, kY), 0, 1);
}

function setPointerVars(
  el: HTMLDivElement,
  perx: number,
  pery: number,
  angle: number,
  edge: number
) {
  el.style.setProperty("--gec-pointer-x", `${round(perx)}%`);
  el.style.setProperty("--gec-pointer-y", `${round(pery)}%`);
  el.style.setProperty("--gec-pointer-deg", `${round(angle)}deg`);
  el.style.setProperty("--gec-pointer-d", `${round(edge * 100)}`);
}

export function GlowingEdgeCard({
  variant = "dark",
  introAnimation = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: GlowingEdgeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const reduceMotion = useReducedMotion();

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const position = getPointerPosition(rect, e);
      const [px, py] = position.pixels;
      const [perx, pery] = position.percent;
      const [cx, cy] = centerOfElement(rect);
      const edge = closenessToEdge(rect, px, py);
      const angle = angleFromPointer(px - cx, py - cy);

      setPointerVars(el, perx, pery, angle, edge);

      if (isAnimating) {
        setIsAnimating(false);
        el.classList.remove("glowing-edge-card--animating");
      }

      onPointerMove?.(e);
    },
    [isAnimating, onPointerMove]
  );

  const handlePointerLeave = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (el) {
        el.style.setProperty("--gec-pointer-d", "0");
      }
      onPointerLeave?.(e);
    },
    [onPointerLeave]
  );

  useEffect(() => {
    if (!introAnimation || reduceMotion || !cardRef.current) return;

    const el = cardRef.current;
    setIsAnimating(true);
    el.classList.add("glowing-edge-card--animating");

    const angleStart = 110;
    const angleEnd = 465;
    el.style.setProperty("--gec-pointer-deg", `${angleStart}deg`);

    const startTime = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      if (!el.classList.contains("glowing-edge-card--animating")) return;

      const elapsed = now - startTime;

      if (elapsed > 500 && elapsed < 1000) {
        const t = (elapsed - 500) / 500;
        const ease = 1 - Math.pow(1 - t, 3);
        el.style.setProperty("--gec-pointer-d", `${ease * 100}`);
      }

      if (elapsed > 500 && elapsed < 2000) {
        const t = (elapsed - 500) / 1500;
        const ease = t * t * t;
        el.style.setProperty(
          "--gec-pointer-deg",
          `${(angleEnd - angleStart) * (ease * 0.5) + angleStart}deg`
        );
      }

      if (elapsed >= 2000 && elapsed < 4250) {
        const t = (elapsed - 2000) / 2250;
        const ease = 1 - Math.pow(1 - t, 3);
        el.style.setProperty(
          "--gec-pointer-deg",
          `${(angleEnd - angleStart) * (0.5 + ease * 0.5) + angleStart}deg`
        );
      }

      if (elapsed > 3000 && elapsed < 4500) {
        const t = (elapsed - 3000) / 1500;
        const ease = t * t * t;
        el.style.setProperty("--gec-pointer-d", `${(1 - ease) * 100}`);
      }

      if (elapsed < 4500) {
        frameId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        el.classList.remove("glowing-edge-card--animating");
        el.style.setProperty("--gec-pointer-d", "0");
      }
    };

    const timer = window.setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, 500);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frameId);
      el.classList.remove("glowing-edge-card--animating");
    };
  }, [introAnimation, reduceMotion]);

  return (
    <div
      ref={cardRef}
      data-variant={variant}
      data-testid="glowing-edge-card"
      className={cn(
        "glowing-edge-card group relative w-full rounded-[1.75rem]",
        isAnimating && "glowing-edge-card--animating",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <div className="glowing-edge-card__mesh-border" aria-hidden />
      <div className="glowing-edge-card__mesh-bg" aria-hidden />
      <div className="glowing-edge-card__glow" aria-hidden />

      <div className="glowing-edge-card__content relative z-10 overflow-hidden rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}
