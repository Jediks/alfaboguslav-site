"use client";

import type { Product } from "@/types/database";
import { cn } from "@/lib/utils";

type CatalogTagFiltersProps = {
  products: Product[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  allLabel: string;
};

function popularTags(products: Product[], limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const tag of product.b2b_tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function CatalogTagFilters({
  products,
  activeTag,
  onTagChange,
  allLabel,
}: CatalogTagFiltersProps) {
  const tags = popularTags(products);
  if (tags.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onTagChange(null)}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
          activeTag === null
            ? "bg-primary text-white"
            : "bg-white/90 text-brand-blue hover:bg-primary/10"
        )}
      >
        {allLabel}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onTagChange(activeTag === tag ? null : tag)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            activeTag === tag
              ? "bg-primary text-white"
              : "bg-white/90 text-brand-blue hover:bg-primary/10"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
