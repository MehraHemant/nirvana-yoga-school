"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { ImageListField } from "@/components/admin/ImageListField";
import { SharedSectionLinks } from "@/components/admin/SharedSectionLinks";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { HeroModuleEditor } from "@/components/admin/modules/HeroModuleEditor";
import { ModuleFlagsPanel } from "@/components/admin/modules/ModuleFlagsPanel";
import { StickyNavModuleEditor } from "@/components/admin/modules/StickyNavModuleEditor";
import { createEmptyPageModules } from "@/content/page-modules-defaults";
import type { PageModulesDocument, RetreatDocument } from "@/content/types";
import { sharedSectionLinksForLayout } from "@/lib/cms/page-layout-registry";

type RetreatEditorProps = {
  /** Retreat product document */
  initialRetreat: RetreatDocument;
  /** Hero / sticky nav modules */
  initialModules: PageModulesDocument | null;
  slug: string;
  backHref?: string;
  backLabel?: string;
  onSave: (payload: {
    retreat: RetreatDocument;
    modules: PageModulesDocument;
  }) => Promise<void>;
};

/**
 * Retreat product editor aligned to live sections — highlights, day schedule,
 * packages; drops residential eligibility/syllabus/flags.
 *
 * @param props - Retreat document, modules, and save handler
 */
export function RetreatEditor({
  initialRetreat,
  initialModules,
  slug,
  backHref = "/admin/sections/retreats",
  backLabel = "Retreats",
  onSave,
}: RetreatEditorProps) {
  const [retreat, setRetreat] = useState(initialRetreat);
  const [modules, setModules] = useState<PageModulesDocument>(() => {
    if (initialModules?.hero) return initialModules;
    const scaffold = createEmptyPageModules("page-minimal");
    scaffold.hero = {
      type: "page-minimal",
      title: initialRetreat.title,
      subtitle: initialRetreat.description,
      heroImage: initialRetreat.heroImage,
      ctaLabel: initialRetreat.ctaLabel,
      ctaHref: initialRetreat.ctaHref,
    };
    return scaffold;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const highlightKeys = useStableListKeys(retreat.highlights.length);
  const dayKeys = useStableListKeys(retreat.schedule.length);
  const packageKeys = useStableListKeys(retreat.packages.length);
  const dateKeys = useStableListKeys(retreat.dates.length);
  const faqKeys = useStableListKeys(retreat.faqs.length);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await onSave({ retreat, modules });
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
        <div>
          <Link href={backHref} className="admin-back-link">
            ← {backLabel}
          </Link>
          <h1 className="admin-title">{retreat.title}</h1>
          <p className="admin-subtitle">
            Retreat layout — schedule, packages, lodging links (no syllabus).
          </p>
        </div>
        <a
          href={`/retreat/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview
        </a>
      </div>

      <div className="admin-section-shell">
        <HeroModuleEditor
          hero={modules.hero}
          onChange={(hero) => setModules({ ...modules, hero })}
          panelId="module-hero"
          step={1}
          open
          onOpenChange={() => {}}
        />
      </div>

      <CollapsiblePanel title="Highlights">
        {retreat.highlights.map((item, index) => (
          <div key={highlightKeys.keys[index]} className="admin-nested-card">
            <TextField
              label="Title"
              value={item.title}
              onChange={(title) => {
                const highlights = [...retreat.highlights];
                highlights[index] = { ...item, title };
                setRetreat({ ...retreat, highlights });
              }}
            />
            <TextField
              label="Description"
              value={item.description}
              onChange={(description) => {
                const highlights = [...retreat.highlights];
                highlights[index] = { ...item, description };
                setRetreat({ ...retreat, highlights });
              }}
              multiline
            />
            <ImageField
              label="Image"
              value={item.image}
              onChange={(image) => {
                const highlights = [...retreat.highlights];
                highlights[index] = { ...item, image };
                setRetreat({ ...retreat, highlights });
              }}
            />
          </div>
        ))}
      </CollapsiblePanel>

      <div className="admin-section-shell">
        <StickyNavModuleEditor
          items={modules.stickyNav.items}
          onChange={(items) =>
            setModules({ ...modules, stickyNav: { items } })
          }
          panelId="module-sticky-nav"
          step={3}
          onOpenChange={() => {}}
        />
      </div>

      <CollapsiblePanel title="Overview">
        <TextField
          label="Eyebrow"
          value={retreat.eyebrow}
          onChange={(eyebrow) => setRetreat({ ...retreat, eyebrow })}
        />
        <TextField
          label="Title"
          value={retreat.title}
          onChange={(title) => setRetreat({ ...retreat, title })}
        />
        <TextField
          label="Description"
          value={retreat.description}
          onChange={(description) => setRetreat({ ...retreat, description })}
          multiline
        />
        <TextField
          label="Overview body"
          value={retreat.overview}
          onChange={(overview) => setRetreat({ ...retreat, overview })}
          multiline
        />
        <ImageListField
          label="Overview images"
          items={retreat.overviewImages}
          onChange={(images) =>
            setRetreat({
              ...retreat,
              overviewImages: images.map((img) => img.url),
            })
          }
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Inclusions">
        <StringListField
          label="Included"
          items={retreat.inclusions}
          onChange={(inclusions) => setRetreat({ ...retreat, inclusions })}
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Day schedule">
        {retreat.schedule.map((day, index) => (
          <div key={dayKeys.keys[index]} className="admin-nested-card">
            <TextField
              label={`Day ${day.day} title`}
              value={day.title}
              onChange={(title) => {
                const schedule = [...retreat.schedule];
                schedule[index] = { ...day, title };
                setRetreat({ ...retreat, schedule });
              }}
            />
            <TextField
              label="Note"
              value={day.note ?? ""}
              onChange={(note) => {
                const schedule = [...retreat.schedule];
                schedule[index] = { ...day, note };
                setRetreat({ ...retreat, schedule });
              }}
            />
            <StringListField
              label="Activities (time — activity)"
              items={day.activities.map((a) => `${a.time} — ${a.activity}`)}
              onChange={(lines) => {
                const activities = lines.map((line) => {
                  const [time, ...rest] = line.split("—");
                  return {
                    time: (time ?? "").trim(),
                    activity: rest.join("—").trim() || line.trim(),
                  };
                });
                const schedule = [...retreat.schedule];
                schedule[index] = { ...day, activities };
                setRetreat({ ...retreat, schedule });
              }}
            />
          </div>
        ))}
      </CollapsiblePanel>

      <div className="admin-section-shell">
        <ModuleFlagsPanel
          flags={modules.flags}
          onChange={(flags) => setModules({ ...modules, flags })}
          panelId="module-flags"
          step={5}
          description="Page-level Live for shared lodging, Why Nirvana, and map. Edit shared media under Shared sections."
          open
          onOpenChange={() => {}}
        />
      </div>

      <div className="admin-section-shell">
        <SharedSectionLinks
          links={sharedSectionLinksForLayout("retreat")}
          step={6}
        />
      </div>

      <CollapsiblePanel title="Accommodation (page copy)">
        <p className="admin-hint">
          Room/food galleries are shared — edit under Shared sections → Retreat
          lodging. This body is retreat-specific intro copy only.
        </p>
        <TextField
          label="Body"
          value={retreat.accommodation.body}
          onChange={(body) =>
            setRetreat({
              ...retreat,
              accommodation: { ...retreat.accommodation, body },
            })
          }
          multiline
        />
        <StringListField
          label="Facilities"
          items={retreat.accommodation.facilities ?? []}
          onChange={(facilities) =>
            setRetreat({
              ...retreat,
              accommodation: { ...retreat.accommodation, facilities },
            })
          }
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Packages & dates">
        {retreat.packages.map((pkg, index) => (
          <div key={packageKeys.keys[index]} className="admin-nested-card">
            <TextField
              label="Package title"
              value={pkg.title}
              onChange={(title) => {
                const packages = [...retreat.packages];
                packages[index] = { ...pkg, title };
                setRetreat({ ...retreat, packages });
              }}
            />
            <div className="admin-grid-2">
              <TextField
                label="Price"
                value={pkg.price}
                onChange={(price) => {
                  const packages = [...retreat.packages];
                  packages[index] = { ...pkg, price };
                  setRetreat({ ...retreat, packages });
                }}
              />
              <TextField
                label="Original price"
                value={pkg.originalPrice ?? ""}
                onChange={(originalPrice) => {
                  const packages = [...retreat.packages];
                  packages[index] = { ...pkg, originalPrice };
                  setRetreat({ ...retreat, packages });
                }}
              />
            </div>
          </div>
        ))}
        {retreat.dates.map((date, index) => (
          <div key={dateKeys.keys[index]} className="admin-grid-2">
            <TextField
              label="Date range"
              value={date.range}
              onChange={(range) => {
                const dates = [...retreat.dates];
                dates[index] = { ...date, range };
                setRetreat({ ...retreat, dates });
              }}
            />
            <TextField
              label="Availability"
              value={date.availability}
              onChange={(availability) => {
                const dates = [...retreat.dates];
                dates[index] = { ...date, availability };
                setRetreat({ ...retreat, dates });
              }}
            />
          </div>
        ))}
      </CollapsiblePanel>

      <CollapsiblePanel title="FAQ">
        {retreat.faqs.map((faq, index) => (
          <div key={faqKeys.keys[index]} className="admin-nested-card">
            <TextField
              label="Question"
              value={faq.question}
              onChange={(question) => {
                const faqs = [...retreat.faqs];
                faqs[index] = { ...faq, question };
                setRetreat({ ...retreat, faqs });
              }}
            />
            <TextField
              label="Answer"
              value={faq.answer}
              onChange={(answer) => {
                const faqs = [...retreat.faqs];
                faqs[index] = { ...faq, answer };
                setRetreat({ ...retreat, faqs });
              }}
              multiline
            />
          </div>
        ))}
      </CollapsiblePanel>

      <AdminSaveBar
        title={retreat.title}
        subtitle={slug}
        saving={saving}
        saved={saved}
        dirty
        error={error}
        onSave={handleSave}
        previewHref={`/retreat/${slug}`}
      />
    </div>
  );
}
