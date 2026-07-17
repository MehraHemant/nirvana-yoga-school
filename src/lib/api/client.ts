/**
 * Fetches a JSON API response. Relative paths are resolved against the site
 * origin so this is safe in both browser and server components.
 *
 * @param url - Absolute URL or site-relative path (e.g. `/api/content/header`)
 * @returns Parsed `{ data, source }` payload, or null data on failure
 */
export async function fetchApi<T>(
  url: string,
): Promise<{ data: T | null; source: string }> {
  try {
    const resolved =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : new URL(
            url,
            process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
              process.env.SITE_URL?.trim() ||
              "http://localhost:3000",
          ).toString();

    const res = await fetch(resolved);
    if (!res.ok) return { data: null, source: "error" };
    return res.json();
  } catch {
    return { data: null, source: "error" };
  }
}
