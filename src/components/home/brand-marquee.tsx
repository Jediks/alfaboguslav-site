"use client";

import { cn } from "@/lib/utils";
import { getBrandMonogram } from "@/lib/utils/initials";

type BrandMarqueeProps = {
  brands: string[];
  className?: string;
};

function BrandChip({ name }: { name: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border/50 bg-white px-4 py-2 shadow-sm">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/5 text-[10px] font-bold text-brand-blue">
        {getBrandMonogram(name)}
      </span>
      <span className="text-sm font-semibold text-brand-blue/75">{name}</span>
    </span>
  );
}

export function BrandMarquee({ brands, className }: BrandMarqueeProps) {
  const doubled = [...brands, ...brands];

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex h-12 items-center md:h-14">
        <div
          className="flex w-max shrink-0 items-center gap-4 will-change-transform"
          style={{ animation: "marquee 50s linear infinite" }}
        >
          {doubled.map((brand, i) => (
            <BrandChip key={`${brand}-${i}`} name={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}
