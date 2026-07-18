"use client";

import type { ModuleFlags } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import type { ModulePanelProps } from "./types";

type ModuleFlagsPanelProps = ModulePanelProps & {
  flags: ModuleFlags;
  onChange: (flags: ModuleFlags) => void;
};

/** Live toggles for the four global shared bands only. */
const SHARED_LIVE_ITEMS: {
  key: keyof ModuleFlags;
  label: string;
}[] = [
  { key: "showWhyNirvana", label: "Why Nirvana" },
  { key: "showMap", label: "Map" },
  { key: "showInstagram", label: "Instagram" },
  { key: "showTravel", label: "Travel" },
];

/**
 * Page-level Live toggles for the four shared global sections.
 * Lodging/exam visibility also live here; lodging content is edited on the page.
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
}: ModuleFlagsPanelProps) {
  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Shared sections (Live)"
      subtitle="Show or hide global Why Nirvana, Map, Instagram, Travel on this page"
      description={
        description ??
        "Shared content is edited once under Shared sections. Lodging & food content is edited on this page."
      }
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="admin-flags-grid">
        {SHARED_LIVE_ITEMS.map((item) => (
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
        <label className="admin-checkbox admin-checkbox-row">
          <input
            type="checkbox"
            checked={flags.showExam}
            onChange={(e) =>
              onChange({ ...flags, showExam: e.target.checked })
            }
          />
          <span>Live · Exam &amp; certification</span>
        </label>
        <label className="admin-checkbox admin-checkbox-row">
          <input
            type="checkbox"
            checked={flags.showAccommodation}
            onChange={(e) =>
              onChange({ ...flags, showAccommodation: e.target.checked })
            }
          />
          <span>Live · Accommodation &amp; food</span>
        </label>
      </div>
      <p className="admin-hint" style={{ marginTop: "0.75rem" }}>
        Accommodation &amp; food content is edited on this page. Shared globals:{" "}
        <a href="/admin/sections/shared" className="admin-link">
          Why Nirvana / Map / Instagram / Travel →
        </a>
      </p>
    </CollapsiblePanel>
  );
}
