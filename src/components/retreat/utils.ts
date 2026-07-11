import { enquireNowHref } from "@/lib/enquire-programs";

export function retreatEnquireHref(title: string): string {
  return enquireNowHref(title);
}

export function parseUsdPrice(price: string): number | null {
  const match = price.match(/\$?\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  return Number.parseFloat(match[1].replace(/,/g, ""));
}

export function formatUsd(amount: number): string {
  return `$${Math.round(amount)} USD`;
}
