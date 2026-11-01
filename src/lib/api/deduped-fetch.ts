const inflightGets = new Map<string, Promise<Response>>();

/**
 * Shares one in-flight GET for the same URL.
 * Admin pages remount their loaders in development, and the second call was
 * starting another identical request before the first finished.
 *
 * @param input - Request URL or Request
 * @param init - Fetch options. Non-GET calls are not shared.
 */
export function dedupedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  if (method !== "GET" || typeof input !== "string") {
    return fetch(input, init);
  }

  const existing = inflightGets.get(input);
  if (existing) return existing.then((response) => response.clone());

  const pending = fetch(input, init).finally(() => {
    inflightGets.delete(input);
  });
  inflightGets.set(input, pending);
  return pending.then((response) => response.clone());
}
