import { getPageRef } from "@/content/pages/registry";
import { getOnlineCourse } from "@/content/repositories/online-course";
import { getResidentialCourse } from "@/content/repositories/residential-course";
import { getSitePage } from "@/content/repositories/site-page";
import type { PageDocument } from "@/content/types/page";
import type { PageRef } from "@/content/types/page-ref";

/** Load full page data from a type + slug ref. */
export async function loadPage(ref: PageRef): Promise<PageDocument | null> {
  switch (ref.type) {
    case "course": {
      const result = await getResidentialCourse(ref.slug);
      if (!result.data) return null;
      return { kind: "course", slug: ref.slug, course: result.data };
    }
    case "online": {
      const result = await getOnlineCourse(ref.slug);
      if (!result.data) return null;
      return { kind: "online", slug: ref.slug, course: result.data };
    }
    case "retreat":
    case "venue":
    case "site": {
      const result = await getSitePage(ref.slug);
      if (!result.data) return null;
      return { kind: ref.type, slug: ref.slug, page: result.data };
    }
  }
}

export async function loadPageBySlug(
  slug: string,
): Promise<PageDocument | null> {
  const ref = getPageRef(slug);
  if (!ref) return null;
  return loadPage(ref);
}
