"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { createEmptyPageModules } from "@/content/page-modules-defaults";
import { pagePath } from "@/content/pages/path";
import { getPageRef } from "@/content/pages/registry";
import type { PageModulesDocument } from "@/content/types";
import { publicViewHref } from "@/lib/cms/page-layout-registry";
import { AdminSaveBar } from "../AdminSaveBar";
import { AdminSectionJumpNav } from "../AdminSectionJumpNav";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { PageSeoFields } from "../PageSeoFields";
import { scrollToSection, toSectionDomId } from "../sectionDomId";
import {
  SharedSectionLinks,
  type SharedSectionLink,
} from "../SharedSectionLinks";
import { useSectionScrollSpy } from "../useSectionScrollSpy";
import { EligibilityModuleEditor } from "./EligibilityModuleEditor";
import { FaqModuleEditor } from "./FaqModuleEditor";
import { HeroModuleEditor } from "./HeroModuleEditor";
import { InclusionsModuleEditor } from "./InclusionsModuleEditor";
import { ModuleFlagsPanel } from "./ModuleFlagsPanel";
import { OverviewModuleEditor } from "./OverviewModuleEditor";
import { PricingModuleEditor } from "./PricingModuleEditor";
import { ScheduleModuleEditor } from "./ScheduleModuleEditor";
import { StickyNavModuleEditor } from "./StickyNavModuleEditor";
import { SyllabusModuleEditor } from "./SyllabusModuleEditor";
import type { ModulePanelProps } from "./types";

/** Module panel ids that can be filtered per layout. */
export type ModulePanelId =
  | "module-meta"
  | "module-hero"
  | "module-sticky-nav"
  | "module-overview"
  | "module-inclusions"
  | "module-eligibility"
  | "module-syllabus"
  | "module-schedule"
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
  /** Deep-links to shared global_settings editors */
  sharedLinks?: SharedSectionLink[];
  /** Optional subtitle under the title */
  layoutHint?: string;
  /** Public preview override */
  previewHref?: string;
};

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
    id: "module-inclusions",
    step: 4,
    label: "Inclusions",
    hint: "What's included",
    moduleKey: "inclusions",
  },
  {
    id: "module-eligibility",
    step: 5,
    label: "Admission",
    hint: "Requirements",
    moduleKey: "eligibility",
  },
  {
    id: "module-syllabus",
    step: 6,
    label: "Syllabus",
    hint: "Curriculum",
    moduleKey: "syllabus",
  },
  {
    id: "module-schedule",
    step: 7,
    label: "Schedule",
    hint: "Daily routine",
    moduleKey: "schedule",
  },
  { id: "module-flags", step: 8, label: "Optional", hint: "Show/hide" },
  {
    id: "module-pricing",
    step: 9,
    label: "Pricing",
    hint: "Dates & fees",
    moduleKey: "pricing",
  },
  {
    id: "module-faq",
    step: 10,
    label: "FAQ",
    hint: "Questions",
    moduleKey: "faqs",
  },
];

const DEFAULT_OPEN: Record<string, boolean> = {
  "module-meta": true,
  "module-hero": true,
  "module-sticky-nav": true,
};

/** Full residential course panel set. */
export const RESIDENTIAL_MODULE_PANELS: ModulePanelId[] = MODULE_SECTIONS.map(
  (s) => s.id,
);

/** Hub / marketing layout panels. */
export const HUB_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-overview",
  "module-inclusions",
  "module-pricing",
  "module-flags",
  "module-faq",
];

/** Editorial / gallery layout panels. */
export const EDITORIAL_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-overview",
  "module-faq",
];

/** Venue layout panels. */
export const VENUE_MODULE_PANELS: ModulePanelId[] = [
  "module-meta",
  "module-hero",
  "module-sticky-nav",
  "module-overview",
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
 */
function normalizeModules(
  value: PageModulesDocument | null | undefined,
  fallbackTitle = "",
): PageModulesDocument {
  if (value?.hero && typeof value.hero.type === "string") {
    return value;
  }
  const scaffold = createEmptyPageModules("page-minimal");
  if (fallbackTitle.trim()) {
    scaffold.hero = { ...scaffold.hero, title: fallbackTitle.trim() };
  }
  return scaffold;
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
  sharedLinks = [],
  layoutHint,
  previewHref: previewHrefProp,
}: ModulePageEditorProps) {
  const [modules, setModules] = useState(() => normalizeModules(initial, slug));
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(normalizeModules(initial, slug)),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [openPanels, setOpenPanels] =
    useState<Record<string, boolean>>(DEFAULT_OPEN);
  const dirty = useMemo(
    () => JSON.stringify(modules) !== baseline,
    [modules, baseline],
  );

  const sections = useMemo(() => {
    const allowed = visiblePanels
      ? new Set(visiblePanels)
      : new Set(RESIDENTIAL_MODULE_PANELS);
    // Always include page SEO at the top
    allowed.add("module-meta");
    return MODULE_SECTIONS.filter((s) => allowed.has(s.id)).map((s, index) => {
      const moduleValue =
        s.moduleKey === "meta"
          ? modules.meta
          : s.moduleKey
            ? modules[s.moduleKey]
            : undefined;
      const domId = modulePanelDomId(s.id, moduleValue);
      return {
        ...s,
        step: index + 1,
        domId,
      };
    });
  }, [visiblePanels, modules]);

  const sectionIds = useMemo(
    () => sections.map((section) => section.domId),
    [sections],
  );
  const activeId = useSectionScrollSpy(sectionIds);

  /** Stable panel key → current DOM id (respects module `_id`). */
  function domIdFor(panelId: ModulePanelId): string {
    return (
      sections.find((s) => s.id === panelId)?.domId ??
      modulePanelDomId(panelId)
    );
  }

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
      onOpenChange: (open) =>
        setOpenPanels((prev) => ({ ...prev, [stableId]: open })),
    }),
    // domIdFor closes over `sections` / modules._id
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: track modules + openPanels
    [openPanels, modules, sections],
  );

  const show = (id: ModulePanelId) =>
    id === "module-meta" || !visiblePanels || visiblePanels.includes(id);

  function jumpTo(domId: string) {
    const section = sections.find((s) => s.domId === domId);
    if (section) {
      setOpenPanels((prev) => ({ ...prev, [section.id]: true }));
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
        <strong>Quick guide:</strong> Panels match this page&apos;s live layout.
        Shared accommodation / reviews / FAQs are linked below when applicable.
      </div>

      <div className="admin-editor-layout">
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

        <div className="admin-editor-sections">
          {show("module-meta") ? (
            <div className="admin-section-shell">
              <CollapsiblePanel
                id={domIdFor("module-meta")}
                step={stepOf("module-meta")}
                title="Page metadata"
                subtitle="SEO title, description, OG image — overrides site defaults when set"
                description="Used by the public page generateMetadata; empty fields fall through to site defaults."
                open={openPanels["module-meta"] ?? true}
                onOpenChange={(open) =>
                  setOpenPanels((prev) => ({ ...prev, "module-meta": open }))
                }
              >
                <PageSeoFields
                  value={modules.meta}
                  onChange={(meta) => setModules({ ...modules, meta })}
                />
              </CollapsiblePanel>
            </div>
          ) : null}
          {show("module-hero") ? (
            <div className="admin-section-shell">
              <HeroModuleEditor
                hero={modules.hero}
                onChange={(hero) => setModules({ ...modules, hero })}
                {...panelProps(
                  "module-hero",
                  stepOf("module-hero"),
                  "Page top banner — pick a layout, then fill in title, images, and CTAs.",
                )}
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
                {...panelProps(
                  "module-overview",
                  stepOf("module-overview"),
                  "Intro section with lead copy, media panel, quote, and glance stats.",
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
                  "Bullet lists of what is and is not included in the program.",
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
          {show("module-flags") ? (
            <div className="admin-section-shell">
              <ModuleFlagsPanel
                flags={modules.flags}
                onChange={(flags) => setModules({ ...modules, flags })}
                {...panelProps(
                  "module-flags",
                  stepOf("module-flags"),
                  "Turn optional sections on or off without deleting content.",
                )}
              />
            </div>
          ) : null}
          {sharedLinks.length > 0 ? (
            <div className="admin-section-shell">
              <SharedSectionLinks links={sharedLinks} />
            </div>
          ) : null}
          {show("module-pricing") ? (
            <div className="admin-section-shell">
              <PricingModuleEditor
                pricing={modules.pricing}
                onChange={(pricing) => setModules({ ...modules, pricing })}
                {...panelProps(
                  "module-pricing",
                  stepOf("module-pricing"),
                  "Room types, fees, and upcoming batch dates.",
                )}
              />
            </div>
          ) : null}
          {show("module-faq") ? (
            <div className="admin-section-shell">
              <FaqModuleEditor
                faqs={modules.faqs}
                onChange={(faqs) => setModules({ ...modules, faqs })}
                {...panelProps(
                  "module-faq",
                  stepOf("module-faq"),
                  "Questions and answers shown in the FAQ accordion.",
                )}
              />
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
