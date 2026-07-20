import {
  isNavPageRef,
  NAV_DROPDOWN_ENTRIES,
  type NavDropdownItemRef,
  type NavDropdownKey,
  type NavPageRef,
} from "@/content/navigation/entries";
import { getPageLabel } from "@/content/repositories/page-labels";
import type { NavLink, NavPageTarget } from "@/content/types/navigation";

function sorted<T extends { sort: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort - b.sort);
}

/**
 * Builds a nav link for a CMS page reference.
 *
 * @param ref - Page type and slug
 */
async function toPageLink(ref: NavPageRef): Promise<NavLink & NavPageTarget> {
  return {
    label: await getPageLabel(ref.type, ref.slug),
    type: ref.type,
    slug: ref.slug,
  };
}

/**
 * Converts a dropdown config entry into a nav link.
 *
 * @param item - Page ref or static href
 */
async function toNavLink(item: NavDropdownItemRef): Promise<NavLink> {
  if (isNavPageRef(item)) return toPageLink(item);
  return { label: item.label, href: item.href };
}

/**
 * Build sorted dropdown links for a section — labels from the database.
 *
 * @param key - Dropdown section key
 */
export async function buildDropdownItems(
  key: NavDropdownKey,
): Promise<NavLink[]> {
  const config = NAV_DROPDOWN_ENTRIES[key];
  const items = await Promise.all(sorted(config.items).map(toNavLink));

  if (config.seeAll) {
    items.push({
      label: `See all — ${await getPageLabel(config.seeAll.type, config.seeAll.slug)}`,
      type: config.seeAll.type,
      slug: config.seeAll.slug,
    });
  }

  return items;
}
