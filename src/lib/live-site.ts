export const LIVE_SITE = "https://www.nirvanayogaschoolindia.com";

export const ENROLL_BASE =
  "https://onlinecourses.nirvanayogaschoolindia.com/enroll";

/** Resolve a live-site path (`/img/...`) or pass through absolute URLs. */
export function liveImage(path: string): string {
  if (path.startsWith("http")) return path;
  return `${LIVE_SITE}${path.startsWith("/") ? path : `/${path}`}`;
}
