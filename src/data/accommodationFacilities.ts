import type { ComponentType } from "react";
import {
  Bathroom,
  Bowl,
  Droplet,
  Flame,
  Garden,
  Laundry,
  Leaf,
  Lotus,
  Shower,
  Terrace,
  Wifi,
  Wind,
} from "@/icons";

type FacilityIcon = ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}>;

export type FacilityItem = {
  label: string;
  icon: FacilityIcon;
  note?: string;
};

export const FACILITY_ITEMS: FacilityItem[] = [
  { label: "Shower", icon: Shower },
  { label: "Terrace", icon: Terrace },
  { label: "Dining area", icon: Bowl },
  { label: "Free Wi-Fi", icon: Wifi },
  { label: "Yoga hall", icon: Lotus },
  { label: "Environment friendly", icon: Leaf },
  { label: "Garden", icon: Garden },
  { label: "Attached bathroom", icon: Bathroom },
  { label: "Hot water", icon: Flame },
  { label: "Purified drinking water", icon: Droplet },
  { label: "Paid laundry service", icon: Laundry },
  { label: "Heater", icon: Flame, note: "100 USD extra" },
  { label: "Air conditioning", icon: Wind, note: "100 USD extra" },
];

/** @deprecated Use FACILITY_ITEMS — kept for string-only consumers */
export const FACILITIES = FACILITY_ITEMS.map((item) =>
  item.note ? `${item.label} — ${item.note}` : item.label,
) as readonly string[];

const facilityByLabel = new Map(
  FACILITY_ITEMS.map((item) => [item.label.toLowerCase(), item]),
);

/** Resolve a plain facility string (e.g. from retreat CMS data) to icon + label */
export function resolveFacilityItem(label: string): FacilityItem {
  const base = label.split(" — ")[0]?.trim() ?? label;
  const note = label.includes(" — ")
    ? label.split(" — ").slice(1).join(" — ").trim()
    : undefined;
  const match = facilityByLabel.get(base.toLowerCase());

  if (match) {
    return note ? { ...match, note } : match;
  }

  return { label: base, icon: Leaf, note };
}
