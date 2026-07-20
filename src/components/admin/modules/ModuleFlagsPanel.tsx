"use client";

import type { ModuleFlags } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import type { ModulePanelProps } from "./types";

type SharedFlagKey =
  | "showWhyNirvana"
  | "showMap"
  | "showInstagram"
  | "showTravel"
  | "showExam";

type ModuleFlagsPanelProps = ModulePanelProps & {
  flags: ModuleFlags;
  onChange: (flags: ModuleFlags) => void;
  /** Subset of shared Live toggles to show; defaults to all */
  visibleKeys?: SharedFlagKey[];
};

/** Live toggles for global shared bands only. */
const SHARED_LIVE_ITEMS: {
  key: SharedFlagKey;
  label: string;
}[] = [
  { key: "showWhyNirvana", label: "Why Nirvana" },
  { key: "showMap", label: "Map" },
  { key: "showInstagram", label: "Instagram" },
  { key: "showTravel", label: "Travel" },
  { key: "showExam", label: "Exam & certification" },
];

/**
 * Page-level Live toggles for shared global sections.
 *
 * @param props - Module flags and change handler
 */
export function ModuleFlagsPanel({
  flags,
  onChange,
  panelId = "module-flags",
  step = 8,
  description,
  open,
  onOpenChange,
  visibleKeys,
}: ModuleFlagsPanelProps) {
  const items = visibleKeys?.length
    ? SHARED_LIVE_ITEMS.filter((item) => visibleKeys.includes(item.key))
    : SHARED_LIVE_ITEMS;

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Shared sections (Live)"
      subtitle={
        visibleKeys?.length === 1 && visibleKeys[0] === "showMap"
          ? "Show or hide the map on this page"
          : "Show or hide global Why Nirvana, Map, Instagram, Travel, and Exam & certification on this page"
      }
      description={
        description ??
        "Shared content is edited once under Shared sections. Accommodation & food content is edited on this page."
      }
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="admin-flags-grid">
        {items.map((item) => (
          <label key={item.key} className="admin-checkbox admin-checkbox-row">
            <input
              type="checkbox"
              checked={flags[item.key]}
              onChange={(e) =>
                onChange({ ...flags, [item.key]: e.target.checked })
              }
            />
            <span>Live · {item.label}</span>
          </label>
        ))}
      </div>
      <p className="admin-hint" style={{ marginTop: "0.75rem" }}>
        Shared globals:{" "}
        <a href="/admin/sections/shared" className="admin-link">
          Why Nirvana / Map / Instagram / Travel / Exam &amp; Certification →
        </a>
      </p>
    </CollapsiblePanel>
  );
}
