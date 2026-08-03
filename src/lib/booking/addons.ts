import type {
  BookingAddon,
  BookingAddonKind,
  BookingAddonOption,
  BookingAddonsContent,
  BookingProgram,
  BookingSelectedAddon,
  BookingType,
} from "@/content/types/booking";

/**
 * Normalize add-on kind (legacy rows without `type` → manual).
 *
 * @param item - CMS add-on
 */
export function getAddonKind(item: BookingAddon): BookingAddonKind {
  return item.type === "course" ? "course" : "manual";
}

/**
 * Stable option id for a room under a course add-on.
 *
 * @param addonId - Parent add-on id
 * @param roomType - Room / package label from the course catalog
 */
export function courseAddonRoomOptionId(
  addonId: string,
  roomType: string,
): string {
  return `${addonId}::${roomType}`;
}

/**
 * Selectable options for an add-on.
 * Manual / legacy flat add-ons become a single synthetic choice.
 *
 * @param item - Add-on from CMS (preferably enriched)
 */
export function getAddonOptions(item: BookingAddon): BookingAddonOption[] {
  if (item.type === "course" && item.options && item.options.length > 0) {
    return item.options.map((option) => ({
      id: option.id,
      label: option.label,
      priceUsd: Math.max(0, Math.round(Number(option.priceUsd) || 0)),
    }));
  }

  if (getAddonKind(item) === "manual") {
    return [
      {
        id: item.id,
        label: item.label || "Add-on",
        priceUsd: Math.max(0, Math.round(Number(item.priceUsd) || 0)),
      },
    ];
  }

  return [];
}

/**
 * Active add-ons for a booking type and (optionally) selected program.
 *
 * @param type - Course or retreat booking
 * @param doc - Add-ons CMS document
 * @param programSlug - Selected program; when set, applies `programSlugs` filter
 */
export function filterBookingAddonsForType(
  type: BookingType,
  doc: BookingAddonsContent | null | undefined,
  programSlug?: string,
): BookingAddon[] {
  if (!doc || doc.live === false) return [];
  const slug = programSlug?.trim() ?? "";

  return (doc.items ?? []).filter((item) => {
    if (item.active === false) return false;
    if (item.appliesTo?.length && !item.appliesTo.includes(type)) return false;

    const scoped = item.programSlugs?.filter(Boolean) ?? [];
    if (scoped.length > 0) {
      if (!slug) return false;
      return scoped.includes(slug);
    }

    return true;
  });
}

/**
 * Fill labels and room options for course add-ons from the booking catalog.
 *
 * @param items - Filtered add-ons for checkout
 * @param catalogPrograms - Programs used to resolve linked course rooms
 */
export function enrichBookingAddons(
  items: BookingAddon[],
  catalogPrograms: BookingProgram[],
): BookingAddon[] {
  const bySlug = new Map(
    catalogPrograms.map((program) => [program.slug, program]),
  );

  return items.map((item) => {
    if (item.type === "course") {
      const linked = bySlug.get(item.courseSlug.trim());
      const label = item.label.trim() || linked?.title || item.courseSlug;
      const options =
        linked?.rooms.map((room) => ({
          id: courseAddonRoomOptionId(item.id, room.roomType),
          label: room.roomType,
          priceUsd: Math.max(0, Math.round(room.priceUsd)),
        })) ??
        item.options ??
        [];
      const minPrice =
        options.length > 0
          ? Math.min(...options.map((option) => option.priceUsd))
          : 0;

      return {
        ...item,
        label,
        options,
        priceUsd: minPrice,
      };
    }

    // manual / legacy
    return {
      ...item,
      type: "manual" as const,
      priceUsd: Math.max(0, Math.round(Number(item.priceUsd) || 0)),
    };
  });
}

/**
 * Resolve checkout selections to priced snapshots (one option per add-on group).
 *
 * @param catalog - Filtered + enriched active add-ons
 * @param selectedIds - Option ids (or legacy flat add-on ids)
 */
export function resolveSelectedAddons(
  catalog: BookingAddon[],
  selectedIds: string[] | undefined,
): BookingSelectedAddon[] {
  const selected = new Set(selectedIds ?? []);
  if (selected.size === 0) return [];

  const result: BookingSelectedAddon[] = [];

  for (const group of catalog) {
    const options = getAddonOptions(group);
    const picked =
      options.find((option) => selected.has(option.id)) ??
      (selected.has(group.id) && options[0] ? options[0] : undefined);

    if (!picked) continue;

    const kind = getAddonKind(group);
    const isCourse = kind === "course";

    result.push({
      id: picked.id,
      label: isCourse ? `${group.label} — ${picked.label}` : group.label,
      priceUsd: Math.max(0, Math.round(picked.priceUsd)),
      groupId: group.id,
      groupLabel: group.label,
      type: kind,
      courseSlug:
        isCourse && group.type === "course" ? group.courseSlug : undefined,
      roomType: isCourse ? picked.label : undefined,
    });
  }

  return result;
}

/**
 * Find which option id is selected for a given add-on group.
 *
 * @param group - Add-on group
 * @param selectedIds - Currently selected option ids
 */
export function getSelectedOptionIdForGroup(
  group: BookingAddon,
  selectedIds: string[],
): string | null {
  const options = getAddonOptions(group);
  const match = options.find((option) => selectedIds.includes(option.id));
  if (match) return match.id;
  if (selectedIds.includes(group.id) && options[0]) return options[0].id;
  return null;
}

/**
 * Replace the selected option for one add-on group (or clear it).
 *
 * @param selectedIds - Current selection
 * @param group - Add-on group
 * @param optionId - Option to select, or null to clear
 */
export function setAddonGroupSelection(
  selectedIds: string[],
  group: BookingAddon,
  optionId: string | null,
): string[] {
  const optionIds = new Set(getAddonOptions(group).map((option) => option.id));
  optionIds.add(group.id);
  const withoutGroup = selectedIds.filter((id) => !optionIds.has(id));
  return optionId ? [...withoutGroup, optionId] : withoutGroup;
}
