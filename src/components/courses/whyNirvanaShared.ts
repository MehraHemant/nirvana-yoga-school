import type { WhyNirvanaContent } from "@/content/types/shared-sections";

export type WhyNirvanaHighlight = WhyNirvanaContent["highlights"][number];

export type WhyNirvanaCardWash = {
  base: string;
  glow: string;
};

/** Five light pastel washes — peach, sage, mint, blush, blue. */
export const WHY_NIRVANA_CARD_WASHES: WhyNirvanaCardWash[] = [
  {
    base: "bg-linear-to-br from-[#f8e8e2] via-[#fdf6f3] to-white",
    glow: "from-[#f0ddd6]/28",
  },
  {
    base: "bg-linear-to-br from-[#d8ece2] via-[#f2f9f5] to-white",
    glow: "from-[#c5ddd0]/25",
  },
  {
    base: "bg-linear-to-bl from-[#e8f3ec] via-[#f6fbf8] to-white",
    glow: "from-[#d4e8dc]/25",
  },
  {
    base: "bg-linear-to-tr from-primary/8 via-[#fbf4f5] to-white",
    glow: "from-primary/10",
  },
  {
    base: "bg-linear-to-tr from-[#d8e8f4] via-[#f2f7fb] to-white",
    glow: "from-[#c5d8ea]/25",
  },
];

export const CHECKERBOARD_COLUMNS = 3;

/** Line-art flourishes for text-card corners (not icon chips). */
export const FLOURISH_PATHS = [
  "M10 58c14-22 32-22 46 2 10 16 24 12 32-8",
  "M70 70c-18-22-8-40 8-46-14 10-10 28 6 36 12 6 8 20-8 18",
  "M22 66h44V40H22zm10-26v-8h24v8",
];

export type CheckerboardCell =
  | { kind: "text"; item: WhyNirvanaHighlight; index: number }
  | { kind: "image"; src: string; alt: string; index: number };

/**
 * Stable 32-bit hash so the same seed always maps to the same wash.
 * @param value Highlight title used as the hash seed.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Picks a wash from the palette by hashing the highlight title.
 * @param title Highlight title used as a stable seed.
 * @param index Card index used when title is empty.
 */
export function getWhyNirvanaCardWash(
  title: string,
  index: number,
): WhyNirvanaCardWash {
  const seed = title.trim() || String(index);
  return WHY_NIRVANA_CARD_WASHES[
    hashString(seed) % WHY_NIRVANA_CARD_WASHES.length
  ];
}

/**
 * Repeating checkerboard wash — cycles palette by grid slot so gradients
 * form a visible pattern across the section.
 *
 * @param slot - Flat grid index in row-major order
 */
export function getWhyNirvanaCardWashBySlot(slot: number): WhyNirvanaCardWash {
  return WHY_NIRVANA_CARD_WASHES[slot % WHY_NIRVANA_CARD_WASHES.length];
}

/**
 * Dedupes real image URLs and drops empty values.
 * @param sources Candidate URL lists (banner, hero, gallery).
 */
export function uniqueImageUrls(
  ...sources: Array<string[] | string | null | undefined>
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const source of sources) {
    const items = Array.isArray(source) ? source : source ? [source] : [];
    for (const raw of items) {
      const url = raw.trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

/**
 * Whether a 3-column checkerboard slot should prefer a photo.
 * @param index Flat cell index in row-major order.
 */
function isImageSlot(index: number): boolean {
  const row = Math.floor(index / CHECKERBOARD_COLUMNS);
  const col = index % CHECKERBOARD_COLUMNS;
  return (row + col) % 2 === 1;
}

/**
 * Alt text for a checkerboard photo, preferring nearby highlight titles.
 * @param highlights CMS highlight rows.
 * @param photoIndex How many photos have been placed so far.
 */
function photoAlt(highlights: WhyNirvanaHighlight[], photoIndex: number): string {
  if (highlights.length === 0) return "Nirvana Yoga School";
  return (
    highlights[photoIndex % highlights.length]?.title.trim() ||
    "Nirvana Yoga School"
  );
}

/**
 * Maps CMS highlights onto text cells and photos onto image cells.
 * Image slots always render a photo when the pool is non-empty, cycling URLs.
 * @param highlights CMS highlight rows.
 * @param photos Deduped real photo URLs from banner and page media.
 */
export function buildCheckerboardCells(
  highlights: WhyNirvanaHighlight[],
  photos: string[],
): CheckerboardCell[] {
  const cells: CheckerboardCell[] = [];
  let highlightIndex = 0;
  let photoIndex = 0;
  let slot = 0;

  while (highlightIndex < highlights.length) {
    const wantImage = isImageSlot(slot);
    if (wantImage && photos.length > 0) {
      cells.push({
        kind: "image",
        src: photos[photoIndex % photos.length],
        alt: photoAlt(highlights, photoIndex),
        index: photoIndex,
      });
      photoIndex += 1;
    } else {
      cells.push({
        kind: "text",
        item: highlights[highlightIndex],
        index: highlightIndex,
      });
      highlightIndex += 1;
    }
    slot += 1;
  }

  while (isImageSlot(slot) && photos.length > 0) {
    cells.push({
      kind: "image",
      src: photos[photoIndex % photos.length],
      alt: photoAlt(highlights, photoIndex),
      index: photoIndex,
    });
    photoIndex += 1;
    slot += 1;
  }

  return cells;
}
