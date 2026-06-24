export function getPriceForQuantity(
  tiers: { min_quantity: number; price: number }[],
  quantity: number
): number {
  const sorted = [...tiers].sort((a, b) => b.min_quantity - a.min_quantity);
  const tier = sorted.find((t) => quantity >= t.min_quantity);
  return tier?.price ?? sorted[sorted.length - 1]?.price ?? 0;
}

/** Deterministic UAH formatting — avoids SSR/client ICU mismatch (₴ vs грн). */
export function formatPrice(amount: number, locale = "uk-UA"): string {
  const isUk = locale.startsWith("uk");
  const number = new Intl.NumberFormat(isUk ? "uk-UA" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return isUk ? `${number}\u00a0₴` : `${number} UAH`;
}
