export function onlineEnquireHref(courseTitle: string): string {
  const text = encodeURIComponent(
    `Hi Nirvana Yoga School, I would like to enquire about the ${courseTitle} online course.`,
  );
  return `https://wa.me/919876543210?text=${text}`;
}

/** Parse "$299 USD" → 299 for discount display. */
export function parseUsdPrice(price: string): number | null {
  const match = price.match(/\$?\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  return Number.parseFloat(match[1].replace(/,/g, ""));
}

export function formatUsd(amount: number): string {
  return `$${Math.round(amount)} USD`;
}
