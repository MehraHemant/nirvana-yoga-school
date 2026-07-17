"use client";

import type { ModuleFlags } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import type { ModulePanelProps } from "./types";

type ModuleFlagsPanelProps = ModulePanelProps & {
  flags: ModuleFlags;
  onChange: (flags: ModuleFlags) => void;
};

const FLAG_ITEMS: { key: keyof ModuleFlags; label: string; section: string }[] =
  [
    { key: "showExam", label: "Live · Exam & Certification", section: "8" },
    {
      key: "showAccommodation",
      label: "Live · Accommodation & Food",
      section: "9",
    },
    { key: "showWhyNirvana", label: "Live · Why Nirvana", section: "11" },
    { key: "showTravel", label: "Live · Travel Guide", section: "12" },
    { key: "showInstagram", label: "Live · Instagram Feed", section: "13" },
    { key: "showMap", label: "Live · Map Section", section: "" },
  ];

/**
 * Toggle panel for optional shared/static page sections (page-level live gates).
 * Shared content must also be live and have data to render on the public page.
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
      title="Optional sections"
      subtitle="Page-level live toggles for shared/static bands"
      description={description}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="admin-flags-grid">
        {FLAG_ITEMS.map((item) => (
          <label key={item.key} className="admin-checkbox admin-checkbox-row">
            <input
              type="checkbox"
              checked={flags[item.key]}
              onChange={(e) =>
                onChange({ ...flags, [item.key]: e.target.checked })
              }
            />
            <span>
              {item.section ? `${item.section}. ` : ""}
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
