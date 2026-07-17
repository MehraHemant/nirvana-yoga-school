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
