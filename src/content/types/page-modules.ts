import type {
  CourseImageDetail,
  CoursePricingOption,
  CourseScheduleItem,
  CourseSyllabusSection,
  FAQ,
  StickyNavItem,
} from "@/content/types/shared";
import type {
  SitePageCard,
  SitePageGalleryImage,
  SitePagePerson,
} from "@/content/types/site-page";

/** Hero layout variants — fields in CMS change per type. */
export type HeroType =
  | "bento-media"
  | "split-copy"
  | "simple-banner"
  | "page-minimal";

export type MetaItem = { label: string; value: string };

export type BentoMediaHero = {
  type: "bento-media";
  title: string;
  subtitle?: string;
  duration?: string;
  level?: string;
  certification?: string;
  fee?: string;
  certBadge?: string;
  heroImages?: string[];
  images?: string[];
  imageDetails?: CourseImageDetail[];
  videos?: string[];
  disableSupplemental?: boolean;
};

export type SplitCopyHero = {
  type: "split-copy";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  metaItems?: MetaItem[];
  ctaPrimary?: string;
  ctaPrimaryHref?: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
  previewType: "image" | "video";
  previewUrl: string;
};

export type SimpleBannerHero = {
  type: "simple-banner";
  title: string;
  subtitle?: string;
  backgroundImage: string;
  metaItems?: MetaItem[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type PageMinimalHero = {
  type: "page-minimal";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  heroImage: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type HeroModule =
  | BentoMediaHero
  | SplitCopyHero
  | SimpleBannerHero
  | PageMinimalHero;

export type OverviewMediaItem = {
  type: "image" | "video";
  url: string;
  title?: string;
  description?: string;
};

export type GlanceItem = {
  label: string;
  value: string;
  hint?: string;
};

export type OverviewModule = {
  eyebrow: string;
  title: string;
  lead: string;
  supportingCopy?: string;
  quote?: { text: string; attribution: string };
  glance: GlanceItem[];
  media: {
    mode: "image" | "video" | "carousel";
    items: OverviewMediaItem[];
  };
};

export type InclusionsModule = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items: string[];
  exclusions?: string[];
};

export type EligibilityRequirement = {
  num: string;
  title: string;
  desc: string;
};

export type EligibilityModule = {
  eyebrow?: string;
  title?: string;
  description?: string;
  requirements: EligibilityRequirement[];
  showAllianceBadge?: boolean;
};

export type SyllabusModule = {
  description: string;
  chapters: CourseSyllabusSection[];
};

export type ScheduleModule = {
  description: string;
  items: CourseScheduleItem[];
};

export type PricingBatch = {
  dates: string;
  spaces: string;
  status: string;
  statusColor: string;
  tone: "open" | "fast" | "last";
};

export type PricingModule = {
  description: string;
  duration?: string;
  options: CoursePricingOption[];
  batches?: PricingBatch[];
};

export type FaqsModule = {
  items: FAQ[];
  categories?: string[];
};

export type TeachersModule = {
  people: SitePagePerson[];
};

export type GalleryModule = {
  images: SitePageGalleryImage[];
};

export type ProgramsModule = {
  cards: SitePageCard[];
};

export type ModuleFlags = {
  showExam: boolean;
  showAccommodation: boolean;
  showWhyNirvana: boolean;
  showTravel: boolean;
  showInstagram: boolean;
  showMap: boolean;
};

/** Full page content stored in `Page.pageModules` JSON. */
export type PageModulesDocument = {
  hero: HeroModule;
  stickyNav: { items: StickyNavItem[] };
  overview: OverviewModule;
  inclusions: InclusionsModule;
  eligibility: EligibilityModule;
  syllabus: SyllabusModule;
  schedule: ScheduleModule;
  pricing: PricingModule;
  faqs: FaqsModule;
  teachers?: TeachersModule;
  gallery?: GalleryModule;
  programs?: ProgramsModule;
  flags: ModuleFlags;
};

/** Mapped props bundle for frontend page clients. */
export type MappedPageModules = {
  modules: PageModulesDocument;
  heroImages: string[];
  metaItems: MetaItem[];
  videos: string[];
  imageDetails?: CourseImageDetail[];
};
