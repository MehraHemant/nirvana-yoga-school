import retreatsData from "@/content/data/retreats/retreats.json";
import type { RetreatDocument } from "@/content/types/retreat-page";

const RETREATS = retreatsData.retreats as RetreatDocument[];

export function getStaticRetreat(slug: string): RetreatDocument | null {
  return RETREATS.find((retreat) => retreat.slug === slug) ?? null;
}

export function getStaticRetreatSlugs(): string[] {
  return RETREATS.map((retreat) => retreat.slug);
}

export { RETREATS };
