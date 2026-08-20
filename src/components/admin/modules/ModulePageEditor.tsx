"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { createEmptyGalleryModule } from "@/content/mappers/gallery-module";
import {
  dropOrphanPricingOptions,
  roomFeesFromLinkedItems,
  upsertCoursePricingForRoom,
} from "@/content/mappers/page-room-fees";
import { normalizeVenueHero } from "@/content/mappers/venue-hero";
import { createEmptyVideosModule } from "@/content/mappers/videos-module";
import {
  createEmptyPageModules,
  DEFAULT_ONLINE_HUB_WHY_ONLINE,
} from "@/content/page-modules-defaults";
import { pagePath } from "@/content/pages/path";
import { getPageRef } from "@/content/pages/registry";
import type { HeroType, PageModulesDocument } from "@/content/types";
import type { ResolvedFaq } from "@/content/types/faqs";
import { createDefaultOnlineHubModules } from "@/lib/cms/online-hub-defaults";
import {
  getHeroLayoutConfig,
  type PageLayoutId,
  publicViewHref,
} from "@/lib/cms/page-layout-registry";
import { createEmptyResidentialLife } from "@/lib/cms/structural-defaults";
import { AdminSaveBar } from "../AdminSaveBar";
import { AdminSectionJumpNav } from "../AdminSectionJumpNav";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ResidentialLifeFields } from "../LodgingFields";
import { PageSeoFields } from "../PageSeoFields";
import { scrollToSection, toSectionDomId } from "../sectionDomId";
import { useSectionScrollSpy } from "../useSectionScrollSpy";
import { EligibilityModuleEditor } from "./EligibilityModuleEditor";
import { PageFaqAssignmentsEditor } from "../PageFaqAssignmentsEditor";
import { FaqModuleEditor } from "./FaqModuleEditor";
import { GalleryModuleEditor } from "./GalleryModuleEditor";
import { HeroModuleEditor } from "./HeroModuleEditor";
import { ModuleLiveField } from "./ModuleLiveField";
import { InclusionsModuleEditor } from "./InclusionsModuleEditor";
import { ModuleFlagsPanel } from "./ModuleFlagsPanel";
import { OverviewModuleEditor } from "./OverviewModuleEditor";
import { PricingModuleEditor } from "./PricingModuleEditor";
import { ScheduleModuleEditor } from "./ScheduleModuleEditor";
import { StickyNavModuleEditor } from "./StickyNavModuleEditor";
import { SyllabusModuleEditor } from "./SyllabusModuleEditor";
import { TeachersModuleEditor } from "./TeachersModuleEditor";
import type { ModulePanelProps } from "./types";
import { VideosModuleEditor } from "./VideosModuleEditor";
import { WhyOnlineModuleEditor } from "./WhyOnlineModuleEditor";

/** Module panel ids that can be filtered per layout. */
export type ModulePanelId =
  | "module-meta"
  | "module-hero"
  | "module-sticky-nav"
  | "module-overview"
  | "module-why-online"
  | "module-inclusions"
  | "module-eligibility"
  | "module-syllabus"
  | "module-schedule"
  | "module-accommodation"
  | "module-gallery"
  | "module-videos"
  | "module-teachers"
  | "module-flags"
  | "module-pricing"
  | "module-faq";

type ModulePageEditorProps = {
  initial: PageModulesDocument;
  slug: string;
  backHref: string;
  backLabel: string;
  onSave: (modules: PageModulesDocument) => Promise<void>;
  /** When set, only these panels render (residential = all). */
  visiblePanels?: ModulePanelId[];
  /** Optional subtitle under the title */
  layoutHint?: string;
  /** Public preview override */
  previewHref?: string;
  /** Layout family — drives venue hero normalization and tip copy */
  layoutId?: PageLayoutId;
};

/**
 * Default hero type when scaffolding empty modules for a layout family.
 *
 * @param layoutId - Resolved page layout id
 */
function defaultHeroTypeForLayout(layoutId?: PageLayoutId): HeroType {
  return layoutId ? getHeroLayoutConfig(layoutId).defaultType : "page-minimal";
}

const MODULE_SECTIONS: Array<{
  id: ModulePanelId;
  step: number;
  label: string;
  hint: string;
  /** Key on PageModulesDocument used for `_id` panel anchors (meta uses doc.meta) */
  moduleKey?: keyof PageModulesDocument | "meta";
}> = [
  {
    id: "module-meta",
    step: 0,
    label: "Page metadata",
    hint: "SEO",
    moduleKey: "meta",
  },
  {
    id: "module-hero",
    step: 1,
    label: "Hero",
    hint: "Top banner",
    moduleKey: "hero",
  },
  {
    id: "module-sticky-nav",
    step: 2,
    label: "Sticky nav",
    hint: "Section links",
    moduleKey: "stickyNav",
  },
  {
    id: "module-overview",
    step: 3,
    label: "Overview",
    hint: "Intro copy",
    moduleKey: "overview",
  },
  {
    id: "module-why-online",
    step: 4,
    label: "Why online",
    hint: "Benefits band",
    moduleKey: "whyOnline",
  },
  {
    id: "module-inclusions",
    step: 5,
    label: "Inclusions",
    hint: "What's included",
    moduleKey: "inclusions",
  },
  {
    id: "module-eligibility",
    step: 6,
    label: "Admission",
    hint: "Requirements",
    moduleKey: "eligibility",
  },
  {
    id: "module-syllabus",
    step: 7,
    label: "Syllabus",
    hint: "Curriculum",
    moduleKey: "syllabus",
  },
  {
    id: "module-schedule",
    step: 8,
    label: "Schedule",
    hint: "Daily routine",
    moduleKey: "schedule",
  },
  {
    id: "module-accommodation",
    step: 9,
    label: "Lodging & food",
    hint: "Per-page",
    moduleKey: "residentialLife",
  },
  {
    id: "module-gallery",
    step: 10,
    label: "Gallery",
    hint: "Photos",
    moduleKey: "gallery",
  },
  {
    id: "module-videos",
    step: 11,
    label: "Videos",
    hint: "YouTube playlist",
    moduleKey: "videos",
  },
  {
    id: "module-teachers",
    step: 12,
    label: "Teachers",
    hint: "From faculty",
    moduleKey: "teachers",
  },
  { id: "module-flags", step: 13, label: "Shared live", hint: "Global bands" },
  {
    id: "module-pricing",
    step: 14,
    label: "Pricing",
    hint: "Dates & fees",
    moduleKey: "pricing",
  },
  {
    id: "module-faq",
    step: 15,
    label: "FAQ",
    hint: "Questions",
    moduleKey: "faqs",
  },
];

/** Start with the first visible panel open; jump-to opens one at a time. */
const DEFAULT_OPEN: Record<string, boolean> = {};

/**
 * Residential course panels.
 * Gallery/teachers/videos stay on venue or hub layouts only.
 */
export const RESIDENTIAL_MODULE_PANELS: ModulePanelId[] = MODULE_SECTIONS.map(
  (s) => s.id,
).filter(
  (id) =>
    id !== "module-videos" &&
    id !== "module-gallery" &&
    id !== "module-teachers",
);

/** Hub / marketing layout panels. */
export const HUB_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-overview",
  "module-inclusions",
  "module-teachers",
  "module-accommodation",
  "module-pricing",
  "module-flags",
  "module-faq",
];

/** Online courses hub — hero/overview/why-online/FAQ; course grid is auto from DB. */
export const ONLINE_HUB_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-sticky-nav",
  "module-overview",
  "module-why-online",
  "module-faq",
];

/** Editorial / gallery layout panels. */
export const EDITORIAL_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-overview",
  "module-faq",
];

/** Venue layout panels — SEO + page title first, then gallery, videos, map Live, FAQ. */
export const VENUE_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-gallery",
  "module-videos",
  "module-flags",
  "module-faq",
];

/** Kirtan layout panels. */
export const KIRTAN_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-sticky-nav",
  "module-overview",
  "module-inclusions",
  "module-eligibility",
  "module-syllabus",
  "module-accommodation",
  "module-pricing",
  "module-flags",
  "module-faq",
];

/**
 * Resolves admin panel DOM id from module `_id` or stable module-* fallback.
 *
 * @param panelId - Stable module panel id (e.g. `module-hero`)
 * @param module - Module object that may carry `_id`
 */
function modulePanelDomId(panelId: ModulePanelId, module?: unknown): string {
  if (panelId === "module-meta" || panelId === "module-flags") {
    return panelId;
  }
  return toSectionDomId(panelId.replace(/^module-/, ""), module);
}

/**
 * Ensures the editor always receives a complete modules document.
 *
 * @param value - Modules from the API (may be partial/empty)
 * @param fallbackTitle - Title used when scaffolding a missing hero
 * @param venueLayout - When true, coerce hero to simple-banner for DarkMediaHero
 */
function normalizeModules(
  value: PageModulesDocument | null | undefined,
  fallbackTitle = "",
  venueLayout = false,
  onlineHubLayout = false,
  layoutId?: PageLayoutId,
): PageModulesDocument {
  let doc: PageModulesDocument;
  if (value?.hero && typeof value.hero.type === "string") {
    doc = value;
  } else {
    const scaffold = createEmptyPageModules(
      venueLayout
        ? "simple-banner"
        : defaultHeroTypeForLayout(layoutId),
    );
    if (fallbackTitle.trim()) {
      scaffold.hero = { ...scaffold.hero, title: fallbackTitle.trim() };
    }
    doc = scaffold;
  }

  if (onlineHubLayout) {
    doc = {
      ...doc,
      whyOnline: doc.whyOnline ?? {
        ...DEFAULT_ONLINE_HUB_WHY_ONLINE,
        items: DEFAULT_ONLINE_HUB_WHY_ONLINE.items.map((item) => ({
          ...item,
        })),
      },
      flags: {
        ...doc.flags,
        showExam: false,
      },
      stickyNav: {
        ...doc.stickyNav,
        items: doc.stickyNav.items.filter((item) => item.id !== "#exam"),
      },
    };
  }

  // Lodging-linked pages: drop legacy pricing rows without roomId, keep batches array.
  if (doc.residentialLife) {
    doc = {
      ...doc,
      pricing: {
        ...doc.pricing,
        options: dropOrphanPricingOptions(doc.pricing.options ?? []),
        batches: doc.pricing.batches ?? [],
      },
    };
  } else if (!Array.isArray(doc.pricing.batches)) {
    doc = {
      ...doc,
      pricing: { ...doc.pricing, batches: [] },
    };
  }

  if (!venueLayout) return doc;

  const fallbackImage =
    doc.gallery?.images?.[0]?.url ||
    (doc.hero.type === "page-minimal" ? doc.hero.heroImage : "") ||
    (doc.hero.type === "simple-banner" ? doc.hero.backgroundImage : "") ||
    "";
  return {
    ...doc,
    hero: normalizeVenueHero(doc.hero, fallbackImage),
    gallery: doc.gallery ?? createEmptyGalleryModule(),
    videos: doc.videos ?? createEmptyVideosModule(),
  };
}

/**
 * Layout-aware module editor — panels match the live page composition.
 *
 * @param props - Initial modules, slug, navigation, optional panel filter
 */
export function ModulePageEditor({
  initial,
  slug,
  backHref,
  backLabel,
  onSave,
  visiblePanels,
  layoutHint,
  previewHref: previewHrefProp,
  layoutId,
}: ModulePageEditorProps) {
  const isVenueLayout = layoutId === "venue";
  const isOnlineHubLayout = layoutId === "onlineHub";
  const [modules, setModules] = useState(() =>
    normalizeModules(initial, slug, isVenueLayout, isOnlineHubLayout, layoutId),
  );
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(
      normalizeModules(initial, slug, isVenueLayout, isOnlineHubLayout, layoutId),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>(() => {
    const first = visiblePanels?.[0] ?? "module-meta";
    return { ...DEFAULT_OPEN, [first]: true };
  });
  const dirty = useMemo(
    () => JSON.stringify(modules) !== baseline,
    [modules, baseline],
  );

  const sections = useMemo(() => {
    const orderedIds = visiblePanels?.length
      ? [...visiblePanels]
      : [...RESIDENTIAL_MODULE_PANELS];
    if (!orderedIds.includes("module-meta")) {
      orderedIds.unshift("module-meta");
    }

    return orderedIds
      .filter((id, index, list) => list.indexOf(id) === index)
      .flatMap((id, index) => {
        const section = MODULE_SECTIONS.find((entry) => entry.id === id);
        if (!section) return [];
        const moduleValue =
          section.moduleKey === "meta"
            ? modules.meta
            : section.moduleKey
              ? modules[section.moduleKey]
              : undefined;
        const label =
          isVenueLayout && section.id === "module-hero"
            ? "Page title"
            : isVenueLayout && section.id === "module-meta"
              ? "SEO"
              : isVenueLayout && section.id === "module-flags"
                ? "Map live"
                : section.label;
        return [
          {
            ...section,
            label,
            step: index + 1,
            domId: modulePanelDomId(section.id, moduleValue),
          },
        ];
      });
  }, [visiblePanels, modules, isVenueLayout]);

  const sectionIds = useMemo(
    () => sections.map((section) => section.domId),
    [sections],
  );
  const activeId = useSectionScrollSpy(sectionIds);
  const showJumpNav = sections.length >= 6;

  /** Stable panel key → current DOM id (respects module `_id`). */
  const domIdFor = useCallback(
    (panelId: ModulePanelId): string =>
      sections.find((s) => s.id === panelId)?.domId ??
      modulePanelDomId(panelId),
    [sections],
  );

  const previewHref = useMemo(() => {
    if (previewHrefProp) return previewHrefProp;
    const ref = getPageRef(slug);
    if (ref) return pagePath(ref);
    return publicViewHref("site", slug);
  }, [previewHrefProp, slug]);

  const pageTitle =
    modules.hero?.type === "page-minimal"
      ? modules.hero.title
      : modules.hero && "title" in modules.hero
        ? modules.hero.title
        : slug;

  const panelProps = useCallback(
    (
      stableId: ModulePanelId,
      step: number,
      description?: string,
    ): ModulePanelProps => ({
      panelId: domIdFor(stableId),
      step,
      description,
      open: openPanels[stableId] ?? false,
      onOpenChange: (open) => {
        if (!open) {
          setOpenPanels((prev) => ({ ...prev, [stableId]: false }));
          return;
        }
        const next: Record<string, boolean> = {};
        for (const section of sections) {
          next[section.id] = section.id === stableId;
        }
        setOpenPanels(next);
      },
    }),
    [openPanels, domIdFor, sections],
  );

  const show = (id: ModulePanelId) =>
    id === "module-meta" || !visiblePanels || visiblePanels.includes(id);

  function jumpTo(domId: string) {
    const section = sections.find((s) => s.domId === domId);
    if (section) {
      const next: Record<string, boolean> = {};
      for (const entry of sections) {
        next[entry.id] = entry.id === section.id;
      }
      setOpenPanels(next);
    }
    requestAnimationFrame(() => scrollToSection(domId));
  }

  function expandAll() {
    const all: Record<string, boolean> = {};
    for (const section of sections) {
      all[section.id] = true;
    }
    setOpenPanels(all);
  }

  function collapseAll() {
    setOpenPanels({});
  }

  /**
   * Mirrors assigned catalog FAQs into page modules for the public fallback path.
   *
   * @param faqs - Assigned FAQ rows from the catalog
   */
  function syncModulesFaqsFromAssignments(faqs: ResolvedFaq[]) {
    setModules((prev) => ({
      ...prev,
      faqs: {
        ...prev.faqs,
        live: prev.faqs?.live !== false,
        items: faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
        })),
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await onSave(modules);
      setBaseline(JSON.stringify(modules));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const stepOf = (id: ModulePanelId) =>
    sections.find((s) => s.id === id)?.step ?? 1;

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <Link href={backHref} className="admin-back-link">
          ← {backLabel}
        </Link>
        <div className="admin-editor-title-row">
          <div>
            <h1 className="admin-title">{pageTitle}</h1>
            <p className="admin-subtitle">
              {layoutHint ? `${layoutHint} · ` : ""}
              {slug}
            </p>
          </div>
          <div className="admin-editor-toolbar">
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={expandAll}
            >
              Expand all
            </button>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={collapseAll}
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      <div className="admin-tip-banner">
        <strong>Quick guide:</strong>{" "}
        {isVenueLayout ? (
          <>
            Photo gallery is the main content for this page. Edit the hero
            banner image and title, manage gallery sections, then add YouTube
            URLs under Videos (Live + at least one URL to show). Changes save to
            the database and show on <code>/venue/{slug}</code>.
          </>
        ) : (
          <>
            Panels match this page&apos;s live layout. Lodging &amp; food are
            edited on this page. Shared section Live toggles appear below when
            applicable.
          </>
        )}
      </div>

      <div className="admin-editor-layout">
        {showJumpNav ? (
          <AdminSectionJumpNav
            items={sections.map(({ domId, step, label, hint }) => ({
              id: domId,
              step,
              label,
              hint,
            }))}
            activeId={activeId}
            onJump={jumpTo}
          />
        ) : null}

        <div className="admin-editor-sections">
          {show("module-meta") ? (
            <div className="admin-section-shell">
              <CollapsiblePanel
                id={domIdFor("module-meta")}
                step={stepOf("module-meta")}
                title="SEO & page details"
                subtitle="Optional search and social overrides"
                description="Empty fields use the site defaults."
                open={openPanels["module-meta"] ?? false}
                onOpenChange={(open) => {
                  if (!open) {
                    setOpenPanels((prev) => ({
                      ...prev,
                      "module-meta": false,
                    }));
                    return;
                  }
                  const next: Record<string, boolean> = {};
                  for (const section of sections) {
                    next[section.id] = section.id === "module-meta";
                  }
                  setOpenPanels(next);
                }}
              >
                <PageSeoFields
                  value={modules.meta}
                  onChange={(meta) => setModules({ ...modules, meta })}
                />
              </CollapsiblePanel>
            </div>
          ) : null}
          {isVenueLayout && show("module-hero") ? (
            <div className="admin-section-shell">
              <HeroModuleEditor
                hero={modules.hero}
                onChange={(hero) => setModules({ ...modules, hero })}
                layoutId={layoutId}
                {...panelProps("module-hero", stepOf("module-hero"))}
              />
            </div>
          ) : null}
          {isVenueLayout && show("module-gallery") ? (
            <div className="admin-section-shell">
              <GalleryModuleEditor
                gallery={modules.gallery ?? createEmptyGalleryModule()}
                onChange={(gallery) => setModules({ ...modules, gallery })}
                {...panelProps("module-gallery", stepOf("module-gallery"))}
              />
            </div>
          ) : null}
          {show("module-videos") ? (
            <div className="admin-section-shell">
              <VideosModuleEditor
                videos={modules.videos ?? createEmptyVideosModule()}
                onChange={(videos) => setModules({ ...modules, videos })}
                {...panelProps(
                  "module-videos",
                  stepOf("module-videos"),
                  "Video playlist band — Live must be on and at least one YouTube URL or Cloudinary upload set to show on the public page.",
                )}
              />
            </div>
          ) : null}
          {!isVenueLayout && show("module-hero") ? (
            <div className="admin-section-shell">
              <HeroModuleEditor
                hero={modules.hero}
                onChange={(hero) => setModules({ ...modules, hero })}
                layoutId={layoutId}
                {...panelProps("module-hero", stepOf("module-hero"))}
              />
            </div>
          ) : null}
          {show("module-sticky-nav") ? (
            <div className="admin-section-shell">
              <StickyNavModuleEditor
                items={modules.stickyNav.items}
                live={modules.stickyNav.live}
                sectionId={modules.stickyNav._id}
                onSectionIdChange={(_id) =>
                  setModules({
                    ...modules,
                    stickyNav: { ...modules.stickyNav, _id },
                  })
                }
                onLiveChange={(live) =>
                  setModules({
                    ...modules,
                    stickyNav: { ...modules.stickyNav, live },
                  })
                }
                onChange={(items) =>
                  setModules({
                    ...modules,
                    stickyNav: { ...modules.stickyNav, items },
                  })
                }
                {...panelProps(
                  "module-sticky-nav",
                  stepOf("module-sticky-nav"),
                  "Links that stick below the hero — must match section IDs on the page.",
                )}
              />
            </div>
          ) : null}
          {show("module-overview") ? (
            <div className="admin-section-shell">
              <OverviewModuleEditor
                overview={modules.overview}
                onChange={(overview) => setModules({ ...modules, overview })}
                welcomeStyle={isOnlineHubLayout}
                hideSupportingCopy={layoutId === "residentialCourse"}
                {...panelProps(
                  "module-overview",
                  stepOf("module-overview"),
                  isOnlineHubLayout
                    ? "YTT-style welcome overview — copy, vision/promise, highlights, and a single video (URL + optional poster)."
                    : "Intro section with lead copy, media panel, and glance stats.",
                )}
              />
            </div>
          ) : null}
          {show("module-why-online") ? (
            <div className="admin-section-shell">
              <WhyOnlineModuleEditor
                whyOnline={
                  modules.whyOnline ??
                  createDefaultOnlineHubModules().whyOnline!
                }
                onChange={(whyOnline) => setModules({ ...modules, whyOnline })}
                {...panelProps(
                  "module-why-online",
                  stepOf("module-why-online"),
                  "Benefits band under overview — eyebrow, title, description, and reorderable benefit rows.",
                )}
              />
            </div>
          ) : null}
          {show("module-inclusions") ? (
            <div className="admin-section-shell">
              <InclusionsModuleEditor
                inclusions={modules.inclusions}
                onChange={(inclusions) =>
                  setModules({ ...modules, inclusions })
                }
                {...panelProps(
                  "module-inclusions",
                  stepOf("module-inclusions"),
                  "Bullet list of what is included in the program.",
                )}
              />
            </div>
          ) : null}
          {show("module-eligibility") ? (
            <div className="admin-section-shell">
              <EligibilityModuleEditor
                eligibility={modules.eligibility}
                onChange={(eligibility) =>
                  setModules({ ...modules, eligibility })
                }
                {...panelProps(
                  "module-eligibility",
                  stepOf("module-eligibility"),
                  "Admission requirements shown as numbered cards.",
                )}
              />
            </div>
          ) : null}
          {show("module-syllabus") ? (
            <div className="admin-section-shell">
              <SyllabusModuleEditor
                syllabus={modules.syllabus}
                onChange={(syllabus) => setModules({ ...modules, syllabus })}
                {...panelProps(
                  "module-syllabus",
                  stepOf("module-syllabus"),
                  "Curriculum chapters — each chapter can have bullet topics.",
                )}
              />
            </div>
          ) : null}
          {show("module-schedule") ? (
            <div className="admin-section-shell">
              <ScheduleModuleEditor
                schedule={modules.schedule}
                onChange={(schedule) => setModules({ ...modules, schedule })}
                {...panelProps(
                  "module-schedule",
                  stepOf("module-schedule"),
                  "Daily ashram routine — time and activity for each row.",
                )}
              />
            </div>
          ) : null}
          {show("module-accommodation") ? (
            <div className="admin-section-shell">
              <CollapsiblePanel
                id={domIdFor("module-accommodation")}
                step={stepOf("module-accommodation")}
                title="Lodging & food"
                subtitle="Per-room Live and prices"
                description="Lists shared Course accommodation rooms. Toggle Live and set prices here — source of truth for room fees. Edit room photos/names under Shared sections."
                open={openPanels["module-accommodation"] ?? false}
                onOpenChange={
                  panelProps(
                    "module-accommodation",
                    stepOf("module-accommodation"),
                  ).onOpenChange
                }
              >
                <ResidentialLifeFields
                  catalog="course"
                  pageSlug={slug}
                  doc={modules.residentialLife ?? createEmptyResidentialLife()}
                  onChange={(residentialLife) => {
                    // Live allowlist only — keep pricing.options so fees survive
                    // toggling a room off and back on in the same session.
                    setModules({
                      ...modules,
                      residentialLife,
                    });
                  }}
                  roomFees={roomFeesFromLinkedItems(modules.pricing.options)}
                  onRoomFeeChange={(room, fee) => {
                    setModules({
                      ...modules,
                      pricing: {
                        ...modules.pricing,
                        options: upsertCoursePricingForRoom(
                          modules.pricing.options,
                          room,
                          fee,
                        ),
                      },
                    });
                  }}
                />
              </CollapsiblePanel>
            </div>
          ) : null}
          {!isVenueLayout && show("module-gallery") ? (
            <div className="admin-section-shell">
              <GalleryModuleEditor
                gallery={modules.gallery ?? createEmptyGalleryModule()}
                onChange={(gallery) => setModules({ ...modules, gallery })}
                {...panelProps("module-gallery", stepOf("module-gallery"))}
              />
            </div>
          ) : null}
          {show("module-teachers") ? (
            <div className="admin-section-shell">
              <TeachersModuleEditor
                teachers={modules.teachers ?? { selectedSlugs: [] }}
                onChange={(teachers) => setModules({ ...modules, teachers })}
                {...panelProps(
                  "module-teachers",
                  stepOf("module-teachers"),
                  "Select faculty from the Teachers data store for this page.",
                )}
              />
            </div>
          ) : null}
          {show("module-flags") ? (
            <div className="admin-section-shell">
              <ModuleFlagsPanel
                flags={modules.flags}
                onChange={(flags) => setModules({ ...modules, flags })}
                visibleKeys={isVenueLayout ? ["showMap"] : undefined}
                {...panelProps(
                  "module-flags",
                  stepOf("module-flags"),
                  isVenueLayout
                    ? "Uncheck Live · Map to hide the map on this venue page. Edit the map embed under Shared sections."
                    : undefined,
                )}
              />
            </div>
          ) : null}
          {show("module-pricing") ? (
            <div className="admin-section-shell">
              <PricingModuleEditor
                pricing={modules.pricing}
                onChange={(pricing) => setModules({ ...modules, pricing })}
                roomCatalog="course"
                pageSlug={slug}
                roomFees={roomFeesFromLinkedItems(modules.pricing.options)}
                {...panelProps(
                  "module-pricing",
                  stepOf("module-pricing"),
                  "Add batch dates and seats. Lists Shared Live rooms; set fees under Lodging & food. Per-page lodging Live only affects the accommodation gallery.",
                )}
              />
            </div>
          ) : null}
          {show("module-faq") ? (
            <div className="admin-section-shell">
              {layoutId === "residentialCourse" ? (
                <CollapsiblePanel
                  {...panelProps(
                    "module-faq",
                    stepOf("module-faq"),
                    "Assign FAQs from the shared catalog or edit them inline. Changes sync to this page and the public FAQ section.",
                  )}
                  title="FAQ"
                  subtitle={`${modules.faqs?.items?.length ?? 0} question${
                    (modules.faqs?.items?.length ?? 0) === 1 ? "" : "s"
                  } on page`}
                  actions={
                    <ModuleLiveField
                      id="module-faq-live"
                      value={modules.faqs?.live !== false}
                      onChange={(live) =>
                        setModules({
                          ...modules,
                          faqs: { ...modules.faqs, live },
                        })
                      }
                    />
                  }
                >
                  <PageFaqAssignmentsEditor
                    contextType="page"
                    contextKey={slug}
                    adminTag="course"
                    idPrefix="module-faq"
                    onSaved={() => {
                      void fetch(
                        `/api/admin/faq-assignments?contextType=page&contextKey=${encodeURIComponent(slug)}`,
                      )
                        .then((res) => res.json())
                        .then((body: { faqs?: ResolvedFaq[] }) => {
                          if (body.faqs) {
                            syncModulesFaqsFromAssignments(body.faqs);
                          }
                        })
                        .catch(() => undefined);
                    }}
                  />
                </CollapsiblePanel>
              ) : (
                <FaqModuleEditor
                  faqs={modules.faqs}
                  onChange={(faqs) => setModules({ ...modules, faqs })}
                  {...panelProps(
                    "module-faq",
                    stepOf("module-faq"),
                    "Questions and answers shown in the FAQ accordion.",
                  )}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>

      <AdminSaveBar
        title={pageTitle || "Page modules"}
        subtitle={slug}
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref={previewHref}
      />
    </div>
  );
}
