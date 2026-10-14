/**
 * Normalizes a title or label into a URL slug.
 *
 * @param value - Raw title or slug candidate
 */
export function slugifyText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Allocates a unique slug by appending `-2`, `-3`, etc. when needed.
 *
 * @param baseSlug - Preferred slug stem
 * @param isTaken - Returns true when the candidate already exists
 * @returns Unused slug
 */
export async function allocateUniqueSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugifyText(baseSlug) || "untitled-post";
  let candidate = root;
  let n = 2;
  while (await isTaken(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}

/**
 * Allocates a free slug by appending `-copy` / `-copy-N`.
 *
 * @param baseSlug - Original slug to derive from
 * @param isTaken - Returns true when the candidate already exists
 * @returns Unused slug
 */
export async function allocateCopySlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = baseSlug.replace(/-copy(?:-\d+)?$/, "");
  let candidate = `${root}-copy`;
  let n = 2;
  while (await isTaken(candidate)) {
    candidate = `${root}-copy-${n}`;
    n += 1;
  }
  return candidate;
}
