import type { PageRef, PageType } from "@/content/types/page-ref";

const SEGMENT_BY_TYPE: Record<Exclude<PageType, "site">, string> = {
  course: "course",
  online: "online-course",
  retreat: "retreat",
  venue: "venue",
};

/** Resolve the public URL for a page ref. */
export function pagePath(ref: Pick<PageRef, "type" | "slug">): string {
  if (ref.type === "site") return `/${ref.slug}`;
  return `/${SEGMENT_BY_TYPE[ref.type]}/${ref.slug}`;
}

export function legacyRedirectForSlug(slug: string, type: PageType) {
  return {
    source: `/${slug}`,
    destination: pagePath({ type, slug }),
    permanent: true as const,
  };
}
