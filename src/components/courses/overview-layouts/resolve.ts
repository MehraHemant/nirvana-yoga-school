import { normalizeCmsImage } from "@/content/types/cms-image";
import type { GlanceItem, OverviewModule } from "@/content/types/page-modules";
import { resolveInlineRichTextHtml } from "@/lib/cms/blog-html";
import type {
  CourseOverviewLayoutProps,
  OverviewSpec,
  ResolvedOverview,
} from "./types";

/**
 * Maps CMS glance rows into live chip specs.
 *
 * @param glance - Overview glance items from page modules
 */
export function glanceToSpecs(glance: GlanceItem[]): OverviewSpec[] {
  return glance
    .filter((item) => Boolean(item.value?.trim()))
    .map((item, index) => ({
      index: String(index + 1).padStart(2, "0"),
      label: item.label,
      value: item.value,
      hint: item.hint?.trim() ? item.hint : undefined,
      highlight: /fee|price|tuition|cost/i.test(item.label),
    }));
}

/**
 * Legacy fallback when no glance rows exist in page modules.
 *
 * @param level - Focus level
 * @param duration - Program duration
 * @param certification - Certification line
 * @param fee - Fee display
 */
export function legacyOverviewSpecs(
  level: string,
  duration: string,
  certification: string,
  fee: string,
): OverviewSpec[] {
  return [
    {
      index: "01",
      label: "Focus Level",
      value: level,
      hint: "All training experience welcome",
    },
    {
      index: "02",
      label: "Immersive Duration",
      value: duration,
      hint: "Full-time ashram residency",
    },
    {
      index: "03",
      label: "Certification",
      value: certification,
      hint: "Worldwide standard credentials",
    },
    {
      index: "04",
      label: "Course Fee",
      value: fee,
      hint: "All-inclusive tuition & board",
      highlight: true,
    },
  ].filter((spec) => Boolean(spec.value?.trim()));
}

/** Campus still when CMS `overviewImage` and media image are empty. */
const OVERVIEW_STILL_FALLBACK = "/images/home/banner_1.webp";

/**
 * Still from CMS: dedicated `overviewImage`, else first unused media image,
 * else the local campus fallback.
 *
 * @param overview - Overview module from page-modules
 */
export function resolveOverviewStillFromModule(
  overview?: Pick<OverviewModule, "overviewImage" | "media"> | null,
): CourseOverviewLayoutProps["stillImage"] {
  const dedicated = overview?.overviewImage?.trim();
  if (dedicated) return { url: dedicated };

  const items = overview?.media?.items ?? [];
  const videosOccupyMedia =
    overview?.media?.mode === "video" ||
    items.some((item) => item.type === "video" && item.url.trim());
  if (videosOccupyMedia) {
    const first = items.find(
      (item) => item.type === "image" && item.url.trim(),
    );
    if (first) {
      return {
        url: first.url,
        alt: first.alt ?? first.title,
        clickAction: first.clickAction,
        redirectUrl: first.redirectUrl,
      };
    }
  }

  return { url: OVERVIEW_STILL_FALLBACK };
}

/**
 * Merges overview description + lead into one HTML body.
 *
 * @param description - Plain or HTML intro copy
 * @param lead - Rich-text lead body
 */
export function mergeOverviewLead(description: string, lead: string): string {
  const descHtml = resolveInlineRichTextHtml(description);
  const leadHtml = resolveInlineRichTextHtml(lead);
  if (descHtml && leadHtml) return `${descHtml}${leadHtml}`;
  return descHtml || leadHtml;
}

/**
 * Normalizes CourseOverview props for the live layout (empty-safe).
 *
 * @param props - Raw overview props matching live `CourseOverview`
 */
export function resolveOverview(
  props: CourseOverviewLayoutProps,
): ResolvedOverview {
  const {
    overview,
    description = "",
    level,
    duration,
    certification = "",
    fee = "",
    videos = [],
    featureImages = [],
    overviewImages = [],
    stillImage,
    eyebrow = "",
    title = "",
    heading = "",
    saying,
    supportingCopy = "",
    glance = [],
    htmlId = "overview",
  } = props;

  const images =
    overviewImages.length > 0
      ? overviewImages.map(normalizeCmsImage)
      : featureImages.map((url) => normalizeCmsImage(url));
  const resolvedStill = stillImage
    ? normalizeCmsImage(stillImage)
    : undefined;
  const still = resolvedStill?.url.trim()
    ? resolvedStill
    : normalizeCmsImage(OVERVIEW_STILL_FALLBACK);
  const showVideoPanel = videos.length > 0;
  const overviewHtml = mergeOverviewLead(description, overview);
  const supporting = supportingCopy.trim() ? supportingCopy : undefined;
  const resolvedHeading = heading.trim() ? heading : undefined;
  const resolvedSaying = saying?.text?.trim()
    ? { text: saying.text.trim(), author: saying.author?.trim() ?? null }
    : undefined;

  return {
    htmlId,
    eyebrow,
    title,
    heading: resolvedHeading,
    overviewHtml,
    supporting,
    saying: resolvedSaying,
    videos,
    images,
    stillImage: still,
    showVideoPanel,
    showImagePanel: !showVideoPanel && images.length > 0,
    specs:
      glance.length > 0
        ? glanceToSpecs(glance)
        : legacyOverviewSpecs(level, duration, certification, fee),
  };
}
