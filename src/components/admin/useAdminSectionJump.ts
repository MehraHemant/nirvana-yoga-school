"use client";

import { useMemo } from "react";
import type { AdminSectionJumpItem } from "./AdminSectionJumpNav";
import { toSectionDomId } from "./sectionDomId";
import { useSectionScrollSpy } from "./useSectionScrollSpy";

/** Static information for a section listed in the admin jump navigation. */
export type AdminSectionJumpDefinition = {
  /** Stable fallback slug when the CMS section has no `_id`. */
  slug: string;
  /** Human-readable navigation label. */
  label: string;
  /** Optional numbered badge for ordered editors. */
  step?: number;
  /** Optional secondary navigation label. */
  hint?: string;
};

type UseAdminSectionJumpOptions<TSection> = {
  /** Sections in the order rendered by the editor. */
  sections: readonly AdminSectionJumpDefinition[];
  /** Resolves the current CMS section for a stable definition slug. */
  getSection: (slug: string) => TSection | undefined;
};

/**
 * Builds section jump items and tracks the active panel for an admin editor.
 * Uses the CMS `_id` when present and a stable `section-*` fallback otherwise.
 *
 * @param options - Ordered section definitions and their current CMS values
 */
export function useAdminSectionJump<TSection>({
  sections,
  getSection,
}: UseAdminSectionJumpOptions<TSection>) {
  const items = useMemo<AdminSectionJumpItem[]>(
    () =>
      sections.map((section) => ({
        id: toSectionDomId(section.slug, getSection(section.slug)),
        label: section.label,
        step: section.step,
        hint: section.hint,
      })),
    [getSection, sections],
  );
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useSectionScrollSpy(sectionIds);

  return {
    items,
    activeId,
    /** Returns the current DOM id for a section, respecting its CMS `_id`. */
    panelId: (slug: string) => toSectionDomId(slug, getSection(slug)),
  };
}
