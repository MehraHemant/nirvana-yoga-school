import {
  isNavPageRef,
  NAV_DROPDOWN_ENTRIES,
  type NavDropdownItemRef,
  type NavDropdownKey,
  type NavPageRef,
} from "@/content/data/navigation/entries";
import { getPageLabel } from "@/content/data/navigation/labels";
import type { NavLink, NavPageTarget } from "@/content/data/navigation/types";

function sorted<T extends { sort: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort - b.sort);
}

function toPageLink(ref: NavPageRef): NavLink & NavPageTarget {
  return {
    label: getPageLabel(ref.type, ref.slug),
    type: ref.type,
    slug: ref.slug,
  };
}

function toNavLink(item: NavDropdownItemRef): NavLink {
  if (isNavPageRef(item)) return toPageLink(item);
  return { label: item.label, href: item.href };
}

/** Build sorted dropdown links for a section — labels from page content data. */
export function buildDropdownItems(key: NavDropdownKey): NavLink[] {
  const config = NAV_DROPDOWN_ENTRIES[key];
  const items = sorted(config.items).map(toNavLink);

  if (config.seeAll) {
    items.push({
      label: `See all — ${getPageLabel(config.seeAll.type, config.seeAll.slug)}`,
      type: config.seeAll.type,
      slug: config.seeAll.slug,
    });
  }

  return items;
}
