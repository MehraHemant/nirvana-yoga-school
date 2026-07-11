import type {
  EligibilityModule,
  FaqsModule,
  HeroModule,
  HeroType,
  InclusionsModule,
  OverviewModule,
  PricingModule,
  ScheduleModule,
  SyllabusModule,
} from "@/content/types/page-modules";
import type { StickyNavItem } from "@/content/types/shared";

/** Supported reusable module keys aligned with PageModulesDocument. */
export type ModuleLibraryKey =
  | "hero"
  | "stickyNav"
  | "overview"
  | "inclusions"
  | "eligibility"
  | "syllabus"
  | "schedule"
  | "pricing"
  | "faqs";

/** Payload union keyed by module type. */
export type ModuleLibraryPayload =
  | HeroModule
  | { items: StickyNavItem[] }
  | OverviewModule
  | InclusionsModule
  | EligibilityModule
  | SyllabusModule
  | ScheduleModule
  | PricingModule
  | FaqsModule;

/** Stored library item record. */
export type ModuleLibraryItemRecord = {
  id: string;
  moduleKey: ModuleLibraryKey;
  variant: string | null;
  name: string;
  payload: ModuleLibraryPayload;
  createdAt: string;
  updatedAt: string;
};

/** Create request body. */
export type CreateModuleLibraryItemInput = {
  moduleKey: ModuleLibraryKey;
  variant?: string | null;
  name: string;
  payload: ModuleLibraryPayload;
};

/** Update request body. */
export type UpdateModuleLibraryItemInput = {
  name?: string;
  payload?: ModuleLibraryPayload;
};

/** Human labels for admin UI. */
export const MODULE_LIBRARY_LABELS: Record<ModuleLibraryKey, string> = {
  hero: "Hero",
  stickyNav: "Sticky navigation",
  overview: "Overview",
  inclusions: "Inclusions",
  eligibility: "Admission standards",
  syllabus: "Syllabus",
  schedule: "Daily schedule",
  pricing: "Dates & pricing",
  faqs: "FAQ",
};

/** Hero variant labels. */
export const HERO_VARIANT_LABELS: Record<HeroType, string> = {
  "bento-media": "Bento gallery",
  "split-copy": "Split product",
  "simple-banner": "Simple banner",
  "page-minimal": "Page minimal",
};
