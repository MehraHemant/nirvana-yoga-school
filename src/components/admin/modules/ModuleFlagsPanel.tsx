"use client";

import Link from "next/link";
import type { ModuleFlags } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { SectionLiveField } from "../SectionLiveField";
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
  const mapOnly = visibleKeys?.length === 1 && visibleKeys[0] === "showMap";
  const items = visibleKeys?.length
    ? SHARED_LIVE_ITEMS.filter((item) => visibleKeys.includes(item.key))
    : SHARED_LIVE_ITEMS;

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Shared sections"
      subtitle={
        mapOnly
          ? "Show or hide the map on this page"
          : "Show or hide on this page"
      }
      description={description}
      open={open}
      onOpenChange={onOpenChange}
    >
      <ul className="admin-flags-list">
        {items.map((item) => (
          <li key={item.key} className="admin-flags-row">
            <span className="admin-flags-row__label">{item.label}</span>
            <SectionLiveField
              id={`${panelId}-${item.key}`}
              value={flags[item.key]}
              onChange={(live) => onChange({ ...flags, [item.key]: live })}
            />
          </li>
        ))}
      </ul>
      <div className="admin-flags-footer">
        <p className="admin-hint admin-hint--tight">
          Content is edited under Shared sections.
        </p>
        <Link
          href="/admin/sections/shared"
          className="admin-btn-sm admin-btn-sm--ghost"
        >
          Edit shared content →
        </Link>
      </div>
    </CollapsiblePanel>
  );
}
