export function retreatEnquireHref(title: string): string {
  const text = encodeURIComponent(
    `Hi Nirvana Yoga School, I would like to enquire about the ${title}.`,
  );
  return `https://wa.me/918218564835?text=${text}`;
}

export function parseUsdPrice(price: string): number | null {
  const match = price.match(/\$?\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  return Number.parseFloat(match[1].replace(/,/g, ""));
}

export function formatUsd(amount: number): string {
  return `$${Math.round(amount)} USD`;
}
