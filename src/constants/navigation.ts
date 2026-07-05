import { buildDropdownItems } from "@/content/data/navigation";
import type { NavItem, NavLink } from "@/content/data/navigation/types";
import { pagePath } from "@/content/pages/path";

export type {
  NavItem,
  NavLink,
  NavPageTarget,
} from "@/content/data/navigation/types";

export function navLinkHref(link: NavLink): string {
  if ("href" in link) return link.href;
  return pagePath({ type: link.type, slug: link.slug });
}

export function navItemHref(item: NavItem): string | undefined {
  if (item.href) return item.href;
  if (item.page) return pagePath(item.page);
  return undefined;
}

/** Primary nav — top-level items hardcoded; dropdown items from content data. */
export const PRIMARY_NAV: NavItem[] = [
  { type: "link", label: "HOME", href: "/" },
  {
    type: "dropdown",
    label: "YOGA COURSES",
    items: buildDropdownItems("courses"),
  },
  {
    type: "dropdown",
    label: "ONLINE COURSES",
    page: { type: "site", slug: "online-yoga-teacher-training-courses" },
    items: buildDropdownItems("online"),
  },
  {
    type: "dropdown",
    label: "RETREATS",
    items: buildDropdownItems("retreats"),
  },
  {
    type: "link",
    label: "TEACHERS",
    page: { type: "site", slug: "teacher" },
  },
  {
    type: "dropdown",
    label: "VENUE",
    items: buildDropdownItems("venue"),
  },
  { type: "link", label: "BLOG", href: "/blog" },
  {
    type: "link",
    label: "CONTACT",
    page: { type: "site", slug: "contact" },
  },
];

export const SIGN_IN_URL =
  "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1600&q=85";
