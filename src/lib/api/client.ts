export async function fetchApi<T>(url: string): Promise<{ data: T | null; source: string }> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { data: null, source: "error" };
  return res.json();
}
