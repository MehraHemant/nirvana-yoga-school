/** Admin labels for top-level `page_modules` keys. */
const PAGE_MODULE_SECTION_LABELS: Record<string, string> = {
  meta: "SEO",
  hero: "Hero",
  stickyNav: "Sticky nav",
  overview: "Overview",
  inclusions: "Inclusions",
  eligibility: "Eligibility",
  syllabus: "Syllabus",
  schedule: "Schedule",
  pricing: "Dates & pricing",
  faqs: "FAQ",
  teachers: "Teachers",
  gallery: "Gallery",
  videos: "Videos",
  programs: "Programs",
  testimonials: "Testimonials",
  whyOnline: "Why online",
  residentialLife: "Lodging & food",
  retreatAccommodation: "Lodging & food",
  flags: "Shared live",
};

/** Shorter names for image-like fields inside a module. */
const PAGE_MODULE_FIELD_LABELS: Record<string, string> = {
  image: "image",
  images: "image",
  url: "image",
  heroImages: "gallery image",
  backgroundImage: "background image",
  heroImage: "hero image",
  previewUrl: "preview image",
  ogImage: "OG image",
  poster: "video poster",
  desktopPoster: "desktop poster",
  mobilePoster: "mobile poster",
  certBadge: "certification badge",
  src: "image",
};

/**
 * Reads a nested value by a path of object keys and array indexes.
 *
 * @param document - Parsed JSON value
 * @param path - Keys from the document root
 */
function valueAtPath(document: unknown, path: string[]): unknown {
  let current = document;
  for (const key of path) {
    if (Array.isArray(current)) {
      current = current[Number(key)];
      continue;
    }
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Uses the array property name when the token sits on a list item.
 *
 * @param path - Path keys ending at the matched string
 */
function fieldKeyFromPath(path: string[]): string {
  const last = path[path.length - 1] ?? "field";
  if (/^\d+$/.test(last)) return path[path.length - 2] ?? "item";
  return last;
}

/**
 * Nearby room or title so a list image can be told apart from its siblings.
 *
 * @param document - Parsed page_modules document
 * @param path - Path keys ending at the matched string
 */
function ownerNameAlongPath(document: unknown, path: string[]): string {
  for (let depth = path.length - 1; depth >= 1; depth--) {
    const node = valueAtPath(document, path.slice(0, depth));
    if (!node || typeof node !== "object" || Array.isArray(node)) continue;
    const record = node as Record<string, unknown>;
    for (const key of ["roomType", "title", "name", "label", "caption"]) {
      const text = record[key];
      if (typeof text === "string" && text.trim()) {
        return text.trim().slice(0, 80);
      }
    }
  }
  return "";
}

/**
 * Module and field label for one matched path.
 *
 * @param moduleKey - Top-level page module key
 * @param fieldKey - Field or list that held the token
 * @param owner - Nearby room, title, or item name
 */
function pageModuleFieldLabel(
  moduleKey: string,
  fieldKey: string,
  owner: string,
): string {
  const section = PAGE_MODULE_SECTION_LABELS[moduleKey] ?? moduleKey;
  const field = PAGE_MODULE_FIELD_LABELS[fieldKey] ?? fieldKey;
  const name = owner.trim();
  if (name && name !== field) return `${section} → ${name} → ${field}`;
  return `${section} → ${field}`;
}

/**
 * Maps asset ids to module/field labels inside one page_modules document.
 * Walks the document once for every asset that already matched the page.
 *
 * @param document - Parsed page_modules document
 * @param tokensByAssetId - Match tokens for assets that hit this page
 */
export function describePageModuleHitsByAsset(
  document: unknown,
  tokensByAssetId: Map<string, string[]>,
): Map<string, string[]> {
  const ownersByToken = new Map<string, string[]>();
  for (const [assetId, tokens] of tokensByAssetId) {
    for (const token of tokens) {
      if (token.length < 8) continue;
      const owners = ownersByToken.get(token);
      if (owners) {
        if (!owners.includes(assetId)) owners.push(assetId);
      } else {
        ownersByToken.set(token, [assetId]);
      }
    }
  }

  const labels = new Map<string, Set<string>>();
  if (ownersByToken.size === 0) return new Map();

  /**
   * Records one field label for an asset.
   *
   * @param assetId - Media asset id
   * @param label - Module and field label
   */
  function record(assetId: string, label: string) {
    const bucket = labels.get(assetId) ?? new Set<string>();
    bucket.add(label);
    labels.set(assetId, bucket);
  }

  /**
   * Walks one node and records labels when a string contains a token.
   *
   * @param value - Current JSON node
   * @param path - Keys from the document root
   */
  function visit(value: unknown, path: string[]) {
    if (typeof value === "string") {
      const matched = new Set<string>();
      for (const [token, owners] of ownersByToken) {
        if (!value.includes(token)) continue;
        for (const assetId of owners) matched.add(assetId);
      }
      if (matched.size === 0) return;
      const label = pageModuleFieldLabel(
        path[0] ?? "module",
        fieldKeyFromPath(path),
        ownerNameAlongPath(document, path),
      );
      for (const assetId of matched) record(assetId, label);
      return;
    }
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        visit(value[index], [...path, String(index)]);
      }
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(
        value as Record<string, unknown>,
      )) {
        visit(child, [...path, key]);
      }
    }
  }

  visit(document, []);
  return new Map(
    [...labels.entries()].map(([assetId, bucket]) => [assetId, [...bucket]]),
  );
}

/**
 * Admin editor href when a usage label starts with a page slug.
 *
 * @param label - Usage reference label (`slug → module → field`)
 */
export function usageReferenceHref(label: string): string | null {
  const slug = label.split(" → ")[0]?.trim() ?? "";
  if (slug === "page") return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return `/admin/pages/${encodeURIComponent(slug)}`;
}
