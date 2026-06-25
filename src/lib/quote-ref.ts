const QUOTE_REF_PATTERN = /\[Quote\s+(Q-[A-Z0-9]+)\]/i;

/** Extract quote reference id embedded in checkout delivery notes. */
export function parseQuoteRefFromDelivery(deliveryAddress: string): string | null {
  const match = deliveryAddress.match(QUOTE_REF_PATTERN);
  return match?.[1]?.toUpperCase() ?? null;
}

/** Strip the quote reference line from delivery text for display. */
export function stripQuoteRefLine(deliveryAddress: string): string {
  return deliveryAddress.replace(/^\[Quote\s+Q-[A-Z0-9]+\]\s*/im, "").trim();
}
