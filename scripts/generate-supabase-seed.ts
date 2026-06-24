/**
 * Generates supabase/migrations/004_seed_products.sql from mock catalog.
 * Run: npx tsx scripts/generate-supabase-seed.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { MOCK_PRODUCTS, MOCK_PRICING } from "../src/lib/data/mock-products";

function esc(s: string) {
  return s.replace(/'/g, "''");
}

function arr(a: string[]) {
  return `ARRAY[${a.map((x) => `'${esc(x)}'`).join(", ")}]::text[]`;
}

function json(obj: unknown) {
  return `'${esc(JSON.stringify(obj))}'::jsonb`;
}

const lines = [
  "-- Auto-generated from mock-products.ts — run after 003_text_product_ids.sql",
  "truncate public.pricing_tiers cascade;",
  "truncate public.products cascade;",
  "",
];

for (const p of MOCK_PRODUCTS) {
  lines.push(`INSERT INTO public.products (
  id, title_uk, title_en, desc_uk, desc_en, images, packaging_type,
  composition, weight_grams, b2b_tags, sweet_types, created_at
) VALUES (
  '${esc(p.id)}',
  '${esc(p.title_uk)}',
  '${esc(p.title_en)}',
  '${esc(p.desc_uk)}',
  '${esc(p.desc_en)}',
  ${arr(p.images)},
  '${p.packaging_type}',
  ${json(p.composition)},
  ${p.weight_grams},
  ${arr(p.b2b_tags)},
  ${arr(p.sweet_types)},
  '${p.created_at}'
);`);
  lines.push("");
}

for (const [productId, tiers] of Object.entries(MOCK_PRICING)) {
  for (const tier of tiers) {
    lines.push(`INSERT INTO public.pricing_tiers (id, product_id, min_quantity, price) VALUES (
  '${esc(tier.id)}',
  '${esc(productId)}',
  ${tier.min_quantity},
  ${tier.price}
);`);
  }
}

const out = join(__dirname, "../supabase/migrations/004_seed_products.sql");
writeFileSync(out, lines.join("\n") + "\n");
console.log(`Wrote ${out} (${MOCK_PRODUCTS.length} products)`);
