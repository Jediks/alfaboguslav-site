import type { Product } from "@/types/database";

export function getProductTitle(product: Product, locale: string) {
  return locale === "en" ? product.title_en : product.title_uk;
}

export function getProductDesc(product: Product, locale: string) {
  return locale === "en" ? product.desc_en : product.desc_uk;
}
