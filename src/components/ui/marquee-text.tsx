"use client";

import { cn } from "@/lib/utils";

type MarqueeTextProps = {
  items: string[];
  speed?: "slow" | "normal" | "fast";
  className?: string;
  reverse?: boolean;
};

export function MarqueeText({
  items,
  speed = "normal",
  className,
  reverse = false,
}: MarqueeTextProps) {
  const duration = { slow: "50s", normal: "32s", fast: "22s" }[speed];
  const doubled = [...items, ...items];

  return (
    <div className={cn("overflow-hidden", className)} aria-hidden>
      <div className="flex h-8 items-center md:h-9">
        <div
          className="flex w-max shrink-0 items-center gap-10 will-change-transform"
          style={{
            animation: `marquee ${duration} linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {doubled.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex shrink-0 items-center gap-10 text-xs font-medium uppercase tracking-[0.14em] md:text-sm"
            >
              <span className="leading-none">{item}</span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-35" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
