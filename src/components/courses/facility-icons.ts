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

const FACILITY_ICONS: Record<string, FacilityIcon> = {
  shower: Shower,
  terrace: Terrace,
  bowl: Bowl,
  wifi: Wifi,
  lotus: Lotus,
  leaf: Leaf,
  garden: Garden,
  bathroom: Bathroom,
  flame: Flame,
  droplet: Droplet,
  laundry: Laundry,
  wind: Wind,
};

/**
 * Resolves a facility icon key from CMS/API data to an icon component.
 *
 * @param iconKey - Stable key stored on residential life facilities
 * @returns Icon component (falls back to Leaf)
 */
export function facilityIcon(iconKey: string): FacilityIcon {
  return FACILITY_ICONS[iconKey] ?? Leaf;
}

const LABEL_TO_ICON_KEY: Record<string, string> = {
  shower: "shower",
  terrace: "terrace",
  "dining area": "bowl",
  "free wi-fi": "wifi",
  "yoga hall": "lotus",
  "environment friendly": "leaf",
  garden: "garden",
  "attached bathroom": "bathroom",
  "hot water": "flame",
  "purified drinking water": "droplet",
  "paid laundry service": "laundry",
  heater: "flame",
  "air conditioning": "wind",
};

export type ResolvedFacility = {
  label: string;
  icon: FacilityIcon;
  note?: string;
};

/**
 * Resolves a plain facility label (e.g. from retreat CMS data) to icon + label.
 *
 * @param label - Facility label, optionally with ` — note` suffix
 */
export function resolveFacilityByLabel(label: string): ResolvedFacility {
  const base = label.split(" — ")[0]?.trim() ?? label;
  const note = label.includes(" — ")
    ? label.split(" — ").slice(1).join(" — ").trim()
    : undefined;
  const iconKey = LABEL_TO_ICON_KEY[base.toLowerCase()] ?? "leaf";
  return { label: base, icon: facilityIcon(iconKey), note };
}
