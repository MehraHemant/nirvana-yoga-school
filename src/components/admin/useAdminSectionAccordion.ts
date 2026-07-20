"use client";

import { useCallback, useState } from "react";

/**
 * Accordion open-state for multi-panel admin editors.
 * Opening one section (or jumping to it) collapses the rest.
 *
 * @param sectionKeys - Stable panel keys in document order
 */
export function useAdminSectionAccordion(sectionKeys: readonly string[]) {
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>(() =>
    sectionKeys[0] ? { [sectionKeys[0]]: true } : {},
  );

  /**
   * Opens or closes a panel. Opening one collapses every other panel.
   *
   * @param key - Panel key
   * @param open - Next open state
   */
  const setPanelOpen = useCallback(
    (key: string, open: boolean) => {
      if (!open) {
        setOpenPanels((prev) => ({ ...prev, [key]: false }));
        return;
      }
      const next: Record<string, boolean> = {};
      for (const sectionKey of sectionKeys) {
        next[sectionKey] = sectionKey === key;
      }
      setOpenPanels(next);
    },
    [sectionKeys],
  );

  /**
   * Opens only the target panel (used by Jump to section).
   *
   * @param key - Panel key to open
   */
  const openOnly = useCallback(
    (key: string) => {
      const next: Record<string, boolean> = {};
      for (const sectionKey of sectionKeys) {
        next[sectionKey] = sectionKey === key;
      }
      setOpenPanels(next);
    },
    [sectionKeys],
  );

  /**
   * Controlled open props for a CollapsiblePanel / module editor.
   *
   * @param key - Panel key
   */
  const panelOpenProps = useCallback(
    (key: string) => ({
      open: openPanels[key] ?? false,
      onOpenChange: (open: boolean) => setPanelOpen(key, open),
    }),
    [openPanels, setPanelOpen],
  );

  return { openPanels, setPanelOpen, openOnly, panelOpenProps };
}
