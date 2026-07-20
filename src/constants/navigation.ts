import { pagePath } from "@/content/pages/path";
import type { NavItem, NavLink } from "@/content/types/navigation";

export type {
  NavItem,
  NavLink,
  NavPageTarget,
} from "@/content/types/navigation";

/**
 * Resolves the href for a nav dropdown link.
 *
 * @param link - Nav link row
 */
export function navLinkHref(link: NavLink): string {
  if ("href" in link) return link.href;
  return pagePath({ type: link.type, slug: link.slug });
}

/**
 * Resolves the href for a top-level nav item when configured.
 *
 * @param item - Nav item row
 */
export function navItemHref(item: NavItem): string | undefined {
  if (item.href) return item.href;
  if (item.page) return pagePath(item.page);
  return undefined;
}

export { SIGN_IN_URL } from "@/lib/cms/structural-defaults";
