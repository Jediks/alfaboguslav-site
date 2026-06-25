export function getInitials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, max)
    .join("")
    .toUpperCase();
}

export function getBrandMonogram(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, "");
  if (cleaned.length >= 2) return cleaned.slice(0, 2).toUpperCase();
  return getInitials(name, 2);
}
