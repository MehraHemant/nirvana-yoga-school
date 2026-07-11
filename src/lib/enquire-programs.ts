import type { SearchableSelectOption } from "@/components/ui";
import { getPageLabel } from "@/content/data/navigation/labels";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
} from "@/content/pages/slugs";

const RETREAT_PROGRAM_SLUGS = RETREAT_SLUGS.filter(
  (slug) => slug !== "retreat-booking",
);

/** Preset programs for the enquiry form — residential, online, and retreats. */
export const ENQUIRE_PROGRAM_OPTIONS: SearchableSelectOption[] = [
  {
    value: "General enquiry",
    label: "General enquiry",
    hint: "Not sure which program yet",
  },
  ...RESIDENTIAL_COURSE_SLUGS.map((slug) => ({
    value: getPageLabel("course", slug),
    hint: "Residential YTT · Rishikesh",
  })),
  ...ONLINE_COURSE_SLUGS.map((slug) => ({
    value: getPageLabel("online", slug),
    hint: "Online course",
  })),
  ...RETREAT_PROGRAM_SLUGS.map((slug) => ({
    value: getPageLabel("retreat", slug),
    hint: "Yoga retreat · Rishikesh",
  })),
  {
    value: getPageLabel("site", "kirtan-vocal-and-instrumental-music-training"),
    hint: "Residential program",
  },
];

export const ACCOMMODATION_PREFERENCE_OPTIONS: SearchableSelectOption[] = [
  {
    value: "",
    label: "Not sure yet",
    hint: "We can recommend the best fit after your enquiry",
  },
  {
    value: "Private Room",
    label: "Private Room",
    hint: "Attached bathroom · ideal for quiet rest",
  },
  {
    value: "2-Shared Room",
    label: "2-Shared Room",
    hint: "Twin sharing · balcony options available",
  },
  {
    value: "3-Shared Room",
    label: "3-Shared Room",
    hint: "Triple sharing · clean and community-oriented",
  },
  {
    value: "4-Shared Dorm",
    label: "4-Shared Dorm",
    hint: "Budget-friendly · all essential amenities",
  },
];

/** @deprecated Use ACCOMMODATION_PREFERENCE_OPTIONS */
export const ENQUIRE_ACCOMMODATION_OPTIONS =
  ACCOMMODATION_PREFERENCE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label ?? option.value,
  }));

/**
 * Build the public enquiry page URL, optionally pre-filling the program field.
 *
 * @param program - Display title to pre-select in the form
 */
export function enquireNowHref(program?: string): string {
  if (!program?.trim()) return "/enquire-now";
  return `/enquire-now?program=${encodeURIComponent(program.trim())}`;
}
