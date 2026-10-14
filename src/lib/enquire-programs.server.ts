import type { SearchableSelectOption } from "@/components/ui";
import {
  ONLINE_COURSE_SLUGS,
  RESIDENTIAL_COURSE_SLUGS,
  RETREAT_SLUGS,
} from "@/content/pages/slugs";
import { getPageLabel } from "@/content/repositories/page-labels";

/**
 * Builds enquiry form program presets from published page titles in Postgres.
 */
export async function buildEnquireProgramOptions(): Promise<
  SearchableSelectOption[]
> {
  const refs = [
    ...RESIDENTIAL_COURSE_SLUGS.map((slug) => ({
      type: "course" as const,
      slug,
    })),
    ...ONLINE_COURSE_SLUGS.map((slug) => ({
      type: "online" as const,
      slug,
    })),
    ...RETREAT_SLUGS.map((slug) => ({
      type: "retreat" as const,
      slug,
    })),
    {
      type: "site" as const,
      slug: "kirtan-vocal-and-instrumental-music-training",
    },
  ];

  const options: SearchableSelectOption[] = [
    {
      value: "General enquiry",
      label: "General enquiry",
      hint: "Not sure which program yet",
    },
  ];

  for (const ref of refs) {
    const label = await getPageLabel(ref.type, ref.slug);
    options.push({
      value: label,
      hint:
        ref.type === "course"
          ? "Residential YTT · Rishikesh"
          : ref.type === "online"
            ? "Online course"
            : ref.type === "retreat"
              ? "Yoga retreat · Rishikesh"
              : "Residential program",
    });
  }

  return options;
}
