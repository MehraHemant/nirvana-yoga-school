const CACHE_HEADER = "public, s-maxage=3600, stale-while-revalidate=86400";

/**
 * JSON response with public CDN-friendly cache headers.
 *
 * @param data - Serializable response body
 * @param init - Optional status/init
 */
export function jsonCached(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": CACHE_HEADER,
      ...(init?.headers ?? {}),
    },
  });
}
