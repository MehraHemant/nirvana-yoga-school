export function parseUsdPrice(price: string): number | null {
  const match = price.match(/\$?\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  return Number.parseFloat(match[1].replace(/,/g, ""));
}

export function formatUsd(amount: number): string {
  return `$${Math.round(amount)} USD`;
}
