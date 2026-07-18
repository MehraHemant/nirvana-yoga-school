"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { SectionIdField } from "@/components/admin/SectionIdField";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import {
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import { toSectionDomId } from "@/components/admin/sectionDomId";
import { TextField } from "@/components/admin/TextField";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import type {
  BookingPageContent,
  EnquirePageContent,
} from "@/content/types/dedicated-pages";

type EnquirePageEditorProps = {
  /** Initial enquiry or booking content_data document */
  initial: EnquirePageContent | BookingPageContent;
  /** Persist handler */
  onSave: (doc: EnquirePageContent | BookingPageContent) => Promise<void>;
  backHref?: string;
  backLabel?: string;
  pageLabel?: string;
  previewHref?: string;
};

const ENQUIRE_JUMP_DEFS = [
  { slug: "meta", label: "Page metadata", key: "meta" as const },
  { slug: "hero", label: "Hero", key: "hero" as const },
  { slug: "steps", label: "Steps", key: "stepsSection" as const },
  { slug: "form", label: "Form copy", key: "form" as const },
  { slug: "map", label: "Map", key: "map" as const },
] as const;

/**
 * Admin editor for `/enquire-now` content_data (SEO, hero, steps, form, map).
 *
 * @param props - Initial document and save handler
 */
export function EnquirePageEditor({
  initial,
  onSave,
  backHref = "/admin/sections/other",
  backLabel = "Other pages",
  pageLabel = "Enquire",
  previewHref = "/enquire-now",
}: EnquirePageEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;
  const stepKeys = useStableListKeys(doc.steps.length);
  const isBooking = doc.kind === "booking";
  const showEnquirySections = doc.kind === "enquire";
  const jumpDefs = showEnquirySections
    ? ENQUIRE_JUMP_DEFS
    : ENQUIRE_JUMP_DEFS.filter(
        (definition) =>
          definition.key !== "form" && definition.key !== "map",
      );

  const jumpItems = useMemo(() => {
    return jumpDefs.map((def) => {
      const section =
        def.key === "meta"
          ? doc.meta
          : def.key === "stepsSection"
            ? doc.stepsSection
            : doc[def.key];
      return {
        id: toSectionDomId(def.slug, section),
        label: def.label,
      };
    });
  }, [doc, jumpDefs]);

  const sectionIds = useMemo(
    () => jumpItems.map((item) => item.id),
    [jumpItems],
  );
  const activeSectionId = useSectionScrollSpy(sectionIds);

  /** Resolves panel DOM id for an enquire jump-nav slug. */
  function panelId(slug: (typeof ENQUIRE_JUMP_DEFS)[number]["slug"]): string {
    const def = jumpDefs.find((d) => d.slug === slug);
    if (!def) return toSectionDomId(slug);
    const section =
      def.key === "meta"
        ? doc.meta
        : def.key === "stepsSection"
          ? doc.stepsSection
          : doc[def.key];
    return toSectionDomId(def.slug, section);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await onSave(doc);
      setBaseline(JSON.stringify(doc));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`admin-editor${isBooking ? " admin-booking-editor" : ""}`}
    >
      <div className="admin-editor-header">
        <div>
          <Link href={backHref} className="admin-back-link">
            ← {backLabel}
          </Link>
          <h1 className="admin-title">{pageLabel}</h1>
          <p className="admin-subtitle">
            {isBooking
              ? "Booking hero and customer guidance."
              : `Hero, enquiry steps, form copy, and map for ${previewHref}.`}
          </p>
        </div>
        <a
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview {previewHref}
        </a>
      </div>

      <div className="admin-editor-layout">
        {jumpItems.length >= 4 ? (
          <AdminSectionJumpNav items={jumpItems} activeId={activeSectionId} />
        ) : null}

        <div className="admin-editor-sections">
          <CollapsiblePanel
            id={panelId("meta")}
            title="Page metadata"
            subtitle="SEO title, description, OG image — overrides site defaults when set"
            defaultOpen
          >
            <PageSeoFields
              value={doc.meta}
              onChange={(meta) => setDoc({ ...doc, meta })}
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("hero")}
            title="Hero"
            subtitle="Image and intro copy"
            defaultOpen
            actions={
              <SectionLiveField
                id={`${pageLabel.toLowerCase()}-hero-live`}
                value={doc.hero.live}
                onChange={(live) =>
                  setDoc({ ...doc, hero: { ...doc.hero, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="enquire-hero-id"
              value={doc.hero._id}
              onChange={(_id) =>
                setDoc({ ...doc, hero: { ...doc.hero, _id } })
              }
            />
            <ImageField
              label="Hero image"
              value={doc.hero.image}
              onChange={(image) =>
                setDoc({ ...doc, hero: { ...doc.hero, image } })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.hero.eyebrow}
                onChange={(eyebrow) =>
                  setDoc({ ...doc, hero: { ...doc.hero, eyebrow } })
                }
              />
              <TextField
                label="Title"
                value={doc.hero.title}
                onChange={(title) =>
                  setDoc({ ...doc, hero: { ...doc.hero, title } })
                }
              />
            </div>
            <TextField
              label="Lead"
              value={doc.hero.lead}
              onChange={(lead) =>
                setDoc({ ...doc, hero: { ...doc.hero, lead } })
              }
              multiline
              rows={3}
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("steps")}
            title={isBooking ? "Booking steps" : "Steps"}
            subtitle={
              isBooking
                ? "Short guidance shown before the booking flow"
                : "How-it-works cards"
            }
            actions={
              <SectionLiveField
                id={`${pageLabel.toLowerCase()}-steps-live`}
                value={doc.stepsSection?.live}
                onChange={(live) =>
                  setDoc({
                    ...doc,
                    stepsSection: { ...doc.stepsSection, live },
                  })
                }
              />
            }
          >
            <SectionIdField
              fieldId="enquire-steps-id"
              value={doc.stepsSection?._id}
              onChange={(_id) =>
                setDoc({
                  ...doc,
                  stepsSection: { ...doc.stepsSection, _id },
                })
              }
            />
            <div className="admin-nested-list-head">
              <span className="admin-label">Steps</span>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => {
                  stepKeys.addKey();
                  const nextNum = String(doc.steps.length + 1).padStart(2, "0");
                  setDoc({
                    ...doc,
                    steps: [
                      ...doc.steps,
                      { step: nextNum, title: "", body: "" },
                    ],
                  });
                }}
              >
                Add step
              </button>
            </div>
            <SortableList
              ids={stepKeys.keys}
              className="admin-booking-steps"
              onReorder={(fromIndex, toIndex) => {
                stepKeys.reorderKeys(fromIndex, toIndex);
                setDoc({
                  ...doc,
                  steps: reorderItems(doc.steps, fromIndex, toIndex),
                });
              }}
            >
              {doc.steps.map((item, index) => (
                <SortableRow key={stepKeys.keys[index]} id={stepKeys.keys[index]}>
                  {({ dragHandleProps }) => (
                    <NestedItemCard
                      title={item.title || `Step ${index + 1}`}
                      index={index}
                      dragHandleProps={dragHandleProps}
                      onRemove={() => {
                        stepKeys.removeKey(index);
                        setDoc({
                          ...doc,
                          steps: doc.steps.filter((_, i) => i !== index),
                        });
                      }}
                    >
                      <div className="admin-grid-2">
                        <TextField
                          label="Title"
                          value={item.title}
                          onChange={(title) => {
                            const steps = [...doc.steps];
                            steps[index] = { ...item, title };
                            setDoc({ ...doc, steps });
                          }}
                        />
                        <TextField
                          label={isBooking ? "Label (optional)" : "Step number"}
                          value={item.step}
                          onChange={(step) => {
                            const steps = [...doc.steps];
                            steps[index] = { ...item, step };
                            setDoc({ ...doc, steps });
                          }}
                        />
                      </div>
                      <TextField
                        label="Description"
                        value={item.body}
                        onChange={(body) => {
                          const steps = [...doc.steps];
                          steps[index] = { ...item, body };
                          setDoc({ ...doc, steps });
                        }}
                        multiline
                        rows={2}
                      />
                    </NestedItemCard>
                  )}
                </SortableRow>
              ))}
            </SortableList>
          </CollapsiblePanel>

          {showEnquirySections ? (
            <>
          <CollapsiblePanel
            id={panelId("form")}
            title="Form copy"
            subtitle="Labels next to the enquiry form"
          >
            <SectionIdField
              fieldId="enquire-form-id"
              value={doc.form._id}
              onChange={(_id) =>
                setDoc({ ...doc, form: { ...doc.form, _id } })
              }
            />
            <TextField
              label="Eyebrow"
              value={doc.form.eyebrow}
              onChange={(eyebrow) =>
                setDoc({ ...doc, form: { ...doc.form, eyebrow } })
              }
            />
            <TextField
              label="Title"
              value={doc.form.title}
              onChange={(title) =>
                setDoc({ ...doc, form: { ...doc.form, title } })
              }
            />
            <TextField
              label="Lead"
              value={doc.form.lead}
              onChange={(lead) =>
                setDoc({ ...doc, form: { ...doc.form, lead } })
              }
              multiline
              rows={3}
            />
            <TextField
              label="Submit label"
              value={doc.form.submitLabel}
              onChange={(submitLabel) =>
                setDoc({ ...doc, form: { ...doc.form, submitLabel } })
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("map")}
            title="Map"
            subtitle="Show or hide the map embed"
          >
            <SectionIdField
              fieldId="enquire-map-id"
              value={doc.map._id}
              onChange={(_id) => setDoc({ ...doc, map: { ...doc.map, _id } })}
            />
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={doc.map.show}
                onChange={(event) =>
                  setDoc({
                    ...doc,
                    map: { ...doc.map, show: event.target.checked },
                  })
                }
              />
              <span>Show map section</span>
            </label>
          </CollapsiblePanel>
            </>
          ) : null}
        </div>
      </div>

      <AdminSaveBar
        title={pageLabel}
        subtitle="content_data"
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
