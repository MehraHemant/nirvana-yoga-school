import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
} from "@/content/pages/slugs";
import type { PageType } from "@/content/types/page-ref";

export type NavPageRef = {
  sort: number;
  type: PageType;
  slug: string;
};

/** Non-page dropdown targets (e.g. homepage anchors). */
export type NavStaticLink = {
  sort: number;
  href: string;
  label: string;
};

export type NavDropdownItemRef = NavPageRef | NavStaticLink;

export function isNavPageRef(item: NavDropdownItemRef): item is NavPageRef {
  return "type" in item && "slug" in item;
}

export type NavDropdownKey = "courses" | "online" | "retreats" | "venue";

export type NavDropdownConfig = {
  items: NavDropdownItemRef[];
  /** Appended last — label resolved from page title in content data. */
  seeAll?: NavPageRef;
};

const courseItems: NavPageRef[] = RESIDENTIAL_COURSE_SLUGS.map(
  (slug, index) => ({
    sort: index + 1,
    type: "course" as const,
    slug,
  }),
);

/** Dropdown item order — slugs + sort only; labels come from content via `getPageLabel`. */
export const NAV_DROPDOWN_ENTRIES: Record<NavDropdownKey, NavDropdownConfig> = {
  courses: {
    items: [
      ...courseItems,
      {
        sort: courseItems.length + 1,
        type: "site",
        slug: "kirtan-vocal-and-instrumental-music-training",
      },
    ],
    seeAll: {
      sort: 999,
      type: "site",
      slug: "yoga-teacher-training-in-rishikesh-india",
    },
  },
  online: {
    items: ONLINE_COURSE_SLUGS.slice(0, 4).map((slug, index) => ({
      sort: index + 1,
      type: "online" as const,
      slug,
    })),
    seeAll: {
      sort: 999,
      type: "site",
      slug: "online-yoga-teacher-training-courses",
    },
  },
  retreats: {
    items: RETREAT_SLUGS.filter((slug) => slug !== "retreat-booking").map(
      (slug, index) => ({
        sort: index + 1,
        type: "retreat" as const,
        slug,
      }),
    ),
  },
  venue: {
    items: [
      { sort: 1, href: "/#gallery", label: "Course Venue" },
      { sort: 2, type: "venue", slug: "retreat-venue" },
    ],
  },
};
