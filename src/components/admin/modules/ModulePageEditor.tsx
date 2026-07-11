"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { pagePath } from "@/content/pages/path";
import { getPageRef } from "@/content/pages/registry";
import type { PageModulesDocument } from "@/content/types";
import { AdminSaveBar } from "../AdminSaveBar";
import { EligibilityModuleEditor } from "./EligibilityModuleEditor";
import { FaqModuleEditor } from "./FaqModuleEditor";
import { HeroModuleEditor } from "./HeroModuleEditor";
import { InclusionsModuleEditor } from "./InclusionsModuleEditor";
import { ModuleFlagsPanel } from "./ModuleFlagsPanel";
import { ModuleNav } from "./ModuleNav";
import { OverviewModuleEditor } from "./OverviewModuleEditor";
import { PricingModuleEditor } from "./PricingModuleEditor";
import { ScheduleModuleEditor } from "./ScheduleModuleEditor";
import { StickyNavModuleEditor } from "./StickyNavModuleEditor";
import { SyllabusModuleEditor } from "./SyllabusModuleEditor";
import type { ModulePanelProps } from "./types";

type ModulePageEditorProps = {
  initial: PageModulesDocument;
  slug: string;
  backHref: string;
  backLabel: string;
  onSave: (modules: PageModulesDocument) => Promise<void>;
};

const MODULE_SECTIONS = [
  { id: "module-hero", step: 1, label: "Hero", hint: "Top banner" },
  {
    id: "module-sticky-nav",
    step: 2,
    label: "Sticky nav",
    hint: "Section links",
  },
  { id: "module-overview", step: 3, label: "Overview", hint: "Intro copy" },
  {
    id: "module-inclusions",
    step: 4,
    label: "Inclusions",
    hint: "What's included",
  },
  {
    id: "module-eligibility",
    step: 5,
    label: "Admission",
    hint: "Requirements",
  },
  { id: "module-syllabus", step: 6, label: "Syllabus", hint: "Curriculum" },
  { id: "module-schedule", step: 7, label: "Schedule", hint: "Daily routine" },
  { id: "module-flags", step: 8, label: "Optional", hint: "Show/hide" },
  { id: "module-pricing", step: 9, label: "Pricing", hint: "Dates & fees" },
  { id: "module-faq", step: 10, label: "FAQ", hint: "Questions" },
] as const;

const DEFAULT_OPEN: Record<string, boolean> = {
  "module-hero": true,
  "module-sticky-nav": true,
};

/**
 * Fixed-order module editor matching live page composition.
 *
 * @param props - Initial modules, slug, navigation, and save handler
 */
export function ModulePageEditor({
  initial,
  slug,
  backHref,
  backLabel,
  onSave,
}: ModulePageEditorProps) {
  const [modules, setModules] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState("module-hero");
  const [openPanels, setOpenPanels] =
    useState<Record<string, boolean>>(DEFAULT_OPEN);

  const previewHref = useMemo(() => {
    const ref = getPageRef(slug);
    return ref ? pagePath(ref) : `/${slug}`;
  }, [slug]);

  const pageTitle =
    modules.hero.type === "page-minimal"
      ? modules.hero.title
      : "title" in modules.hero
        ? modules.hero.title
        : slug;

  const panelProps = useCallback(
    (id: string, step: number, description?: string): ModulePanelProps => ({
      panelId: id,
      step,
      description,
      open: openPanels[id] ?? false,
      onOpenChange: (open) =>
        setOpenPanels((prev) => ({ ...prev, [id]: open })),
    }),
    [openPanels],
  );

  function jumpTo(id: string) {
    setActiveId(id);
    setOpenPanels((prev) => ({ ...prev, [id]: true }));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function expandAll() {
    const all: Record<string, boolean> = {};
    for (const section of MODULE_SECTIONS) {
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
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <Link href={backHref} className="admin-back-link">
          ← {backLabel}
        </Link>
        <div className="admin-editor-title-row">
          <div>
            <h1 className="admin-title">{pageTitle}</h1>
            <p className="admin-subtitle">{slug}</p>
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
        <strong>Quick guide:</strong> Use the sidebar to jump between sections.
        Upload images with the camera button or pick from the media library.
        Paste multiple list items at once with &ldquo;Paste many&rdquo;. Save
        when done — preview opens the live page.
      </div>

      <div className="admin-editor-layout">
        <ModuleNav
          items={[...MODULE_SECTIONS]}
          activeId={activeId}
          onJump={jumpTo}
        />

        <div className="admin-editor-sections">
          <div className="admin-section-shell">
            <HeroModuleEditor
              hero={modules.hero}
              onChange={(hero) => setModules({ ...modules, hero })}
              {...panelProps(
                "module-hero",
                1,
                "Page top banner — pick a layout, then fill in title, images, and CTAs.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <StickyNavModuleEditor
              items={modules.stickyNav.items}
              onChange={(items) =>
                setModules({ ...modules, stickyNav: { items } })
              }
              {...panelProps(
                "module-sticky-nav",
                2,
                "Links that stick below the hero — must match section IDs on the page.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <OverviewModuleEditor
              overview={modules.overview}
              onChange={(overview) => setModules({ ...modules, overview })}
              {...panelProps(
                "module-overview",
                3,
                "Intro section with lead copy, media panel, quote, and glance stats.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <InclusionsModuleEditor
              inclusions={modules.inclusions}
              onChange={(inclusions) => setModules({ ...modules, inclusions })}
              {...panelProps(
                "module-inclusions",
                4,
                "Bullet lists of what is and is not included in the program.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <EligibilityModuleEditor
              eligibility={modules.eligibility}
              onChange={(eligibility) =>
                setModules({ ...modules, eligibility })
              }
              {...panelProps(
                "module-eligibility",
                5,
                "Admission requirements shown as numbered cards.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <SyllabusModuleEditor
              syllabus={modules.syllabus}
              onChange={(syllabus) => setModules({ ...modules, syllabus })}
              {...panelProps(
                "module-syllabus",
                6,
                "Curriculum chapters — each chapter can have bullet topics.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <ScheduleModuleEditor
              schedule={modules.schedule}
              onChange={(schedule) => setModules({ ...modules, schedule })}
              {...panelProps(
                "module-schedule",
                7,
                "Daily ashram routine — time and activity for each row.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <ModuleFlagsPanel
              flags={modules.flags}
              onChange={(flags) => setModules({ ...modules, flags })}
              {...panelProps(
                "module-flags",
                8,
                "Turn optional sections on or off without deleting content.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <PricingModuleEditor
              pricing={modules.pricing}
              onChange={(pricing) => setModules({ ...modules, pricing })}
              {...panelProps(
                "module-pricing",
                9,
                "Room types, fees, and upcoming batch dates.",
              )}
            />
          </div>
          <div className="admin-section-shell">
            <FaqModuleEditor
              faqs={modules.faqs}
              onChange={(faqs) => setModules({ ...modules, faqs })}
              {...panelProps(
                "module-faq",
                10,
                "Questions and answers shown in the FAQ accordion.",
              )}
            />
          </div>
        </div>
      </div>

      <AdminSaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={handleSave}
        previewHref={previewHref}
      />
    </div>
  );
}
