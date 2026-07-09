export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `${(value / 100_000).toFixed(2)} Lac`;
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export const statusLabels: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const statusColors: Record<string, { bg: string; text: string }> = {
  available: { bg: "#d1fae5", text: "#065f46" },
  reserved: { bg: "#fef3c7", text: "#92400e" },
  sold: { bg: "#fee2e2", text: "#991b1b" },
};
