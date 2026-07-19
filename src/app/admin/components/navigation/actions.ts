"use server";

import { revalidatePath } from "next/cache";
import type { NavItem, NavLink } from "@/content/data/navigation/types";
import type { GlobalHeader } from "@/content/types/global-settings";
import { getServerSession, requireAdmin } from "@/lib/cms/auth";
import { invalidateGlobalSettingsCache } from "@/lib/cms/cache";
import {
  DEFAULT_HEADER_CTAS,
  normalizeHeaderCtas,
  prepareHeaderForSave,
} from "@/lib/cms/header-fields";
import { db } from "@/lib/db";

/** Row shape for `navigation_items` create payloads. */
type NavigationItemCreateInput = {
  groupId: string;
  sortOrder: number;
  itemType: string;
  href?: string;
  label?: string;
  pageType?: string;
  pageSlug?: string;
};

/**
 * Loads the live header navigation from global settings.
 *
 * @returns Header nav items (empty when unset)
 */
export async function loadHeaderNavigation(): Promise<NavItem[]> {
  const record = await db.globalSettings.findUnique({
    where: { key: "header" },
  });
  if (!record?.value || typeof record.value !== "object") return [];
  const header = record.value as unknown as GlobalHeader;
  return Array.isArray(header.navigation) ? header.navigation : [];
}

/**
 * Saves the live site header navigation and syncs matching menu groups.
 *
 * @param navigation - Full primary-nav tree
 */
export async function saveHeaderNavigationAction(
  navigation: NavItem[],
): Promise<{ ok?: true; error?: string }> {
  requireAdmin(await getServerSession());

  if (!Array.isArray(navigation)) {
    return { error: "Invalid navigation payload." };
  }

  const record = await db.globalSettings.findUnique({
    where: { key: "header" },
  });
  const previous =
    record?.value && typeof record.value === "object"
      ? (record.value as unknown as GlobalHeader)
      : null;

  const nextHeader = prepareHeaderForSave({
    navigation,
    logo: previous?.logo ?? {
      light: "/logo.png",
      dark: "/logo_white.png",
      lightAlt: "Nirvana Yoga School",
      darkAlt: "Nirvana Yoga School",
      href: "/",
    },
    ctas: previous
      ? normalizeHeaderCtas(previous)
      : DEFAULT_HEADER_CTAS.map((c) => ({ ...c })),
    signInUrl: previous?.signInUrl,
    cta: previous?.cta,
  });

  await db.globalSettings.upsert({
    where: { key: "header" },
    update: { value: nextHeader },
    create: {
      key: "header",
      value: nextHeader,
    },
  });

  await syncNavigationGroupsFromHeader(navigation);

  revalidatePath("/admin/components/navigation");
  revalidatePath("/admin/navigation");
  revalidatePath("/api/content/header");
  return { ok: true };
}

/**
 * Saves the full header document (branding + navigation) and syncs menu groups.
 *
 * @param header - Complete global header settings
 */
export async function saveFullHeaderAction(
  header: GlobalHeader,
): Promise<{ ok?: true; error?: string }> {
  requireAdmin(await getServerSession());

  if (!header || !Array.isArray(header.navigation)) {
    return { error: "Invalid header payload." };
  }

  const nextHeader = prepareHeaderForSave(header);

  await db.globalSettings.upsert({
    where: { key: "header" },
    update: { value: nextHeader },
    create: {
      key: "header",
      value: nextHeader,
    },
  });

  await syncNavigationGroupsFromHeader(nextHeader.navigation);

  invalidateGlobalSettingsCache("header");
  revalidatePath("/");
  revalidatePath("/admin/components/header");
  revalidatePath("/admin/components/navigation");
  revalidatePath("/admin/settings/header");
  revalidatePath("/admin/navigation");
  revalidatePath("/api/content/header");
  return { ok: true };
}

/**
 * Loads the full global header settings document.
 *
 * @returns Header settings or null when unset
 */
export async function loadFullHeader(): Promise<GlobalHeader | null> {
  const record = await db.globalSettings.findUnique({
    where: { key: "header" },
  });
  if (!record?.value || typeof record.value !== "object") return null;
  return record.value as unknown as GlobalHeader;
}

/**
 * Mirrors dropdown children into `navigation_groups` for the legacy group UI.
 *
 * @param navigation - Header nav tree
 */
export async function syncNavigationGroupsFromHeader(
  navigation: NavItem[],
): Promise<void> {
  for (const item of navigation) {
    if (item.type !== "dropdown") continue;
    const key = groupKeyFromLabel(item.label);
    const group = await db.navigationGroup.upsert({
      where: { key },
      create: { key, label: item.label },
      update: { label: item.label },
    });
    await db.navigationItem.deleteMany({ where: { groupId: group.id } });
    for (const [index, child] of item.items.entries()) {
      await db.navigationItem.create({
        data: navLinkToGroupItem(group.id, index + 1, child),
      });
    }
  }
}

/**
 * Builds a stable group key from a dropdown label.
 *
 * @param label - Dropdown label (e.g. ONLINE COURSES)
 */
function groupKeyFromLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

/**
 * Maps a header nav link into a navigation_items row.
 *
 * @param groupId - Parent group id
 * @param sortOrder - Display order
 * @param link - Header dropdown child
 */
function navLinkToGroupItem(
  groupId: string,
  sortOrder: number,
  link: NavLink,
): NavigationItemCreateInput {
  if ("href" in link) {
    return {
      groupId,
      sortOrder,
      itemType: "static",
      href: link.href,
      label: link.label,
    };
  }
  return {
    groupId,
    sortOrder,
    itemType: "page",
    pageType: link.type,
    pageSlug: link.slug,
    label: link.label,
  };
}
