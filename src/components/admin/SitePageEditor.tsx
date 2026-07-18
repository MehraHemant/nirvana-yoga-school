"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { pagePath } from "@/content/pages/path";
import { getPageRef } from "@/content/pages/registry";
import { teacherSlug } from "@/content/teachers-slug";
import type { SitePageDocument } from "@/content/types";
import { AdminSaveBar } from "./AdminSaveBar";
import { AdminSectionJumpNav } from "./AdminSectionJumpNav";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { PageSeoFields } from "./PageSeoFields";
import { SectionEditor } from "./SectionEditor";
import {
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "./SortableList";
import { TeachersPicker } from "./TeachersPicker";
import { TextField } from "./TextField";
import { useSectionScrollSpy } from "./useSectionScrollSpy";
import { useStableListKeys } from "./useStableListKeys";

type SitePageEditorProps = {
  initial: SitePageDocument;
  onSave: (doc: SitePageDocument) => Promise<void>;
};

const SITE_PAGE_JUMP_ITEMS = [
  { id: "section-page-seo", label: "Page SEO" },
  { id: "section-page-metadata", label: "Page metadata" },
  { id: "section-page-content", label: "Content sections" },
  { id: "section-page-packages", label: "Pricing packages" },
  { id: "section-page-gallery", label: "Gallery" },
  { id: "section-page-cards", label: "Program cards" },
  { id: "section-page-people", label: "Teachers / people" },
  { id: "section-page-highlights", label: "Highlights" },
];

/**
 * Full dynamic editor for a `SitePageDocument` and all nested fields.
 *
 * @param props - Initial page document and persist handler
 */
export function SitePageEditor({ initial, onSave }: SitePageEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;
  const activeSectionId = useSectionScrollSpy(
    SITE_PAGE_JUMP_ITEMS.map((item) => item.id),
  );
  const packages = doc.packages ?? [];
  const gallery = doc.gallery ?? [];
  const cards = doc.cards ?? [];
  const people = doc.people ?? [];
  const highlights = doc.highlights ?? [];
  const sectionKeys = useStableListKeys(doc.sections.length);
  const packageKeys = useStableListKeys(packages.length);
  const galleryKeys = useStableListKeys(gallery.length);
  const cardKeys = useStableListKeys(cards.length);
  const highlightKeys = useStableListKeys(highlights.length);
  const selectedTeacherSlugs = people.map((person) => teacherSlug(person.name));

  const previewHref = useMemo(() => {
    const ref = getPageRef(doc.slug);
    if (!ref) return `/${doc.slug}`;
    return pagePath(ref);
  }, [doc.slug]);

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

  function handleSectionReorder(fromIndex: number, toIndex: number) {
    sectionKeys.reorderKeys(fromIndex, toIndex);
    const sections = withSortField(
      reorderItems(doc.sections, fromIndex, toIndex),
    ) as typeof doc.sections;
    setDoc({ ...doc, sections });
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <div>
          <Link href="/admin/sections/other" className="admin-back-link">
            ← Other pages
          </Link>
          <h1 className="admin-title">{doc.title}</h1>
          <p className="admin-subtitle">{doc.slug}</p>
        </div>
      </div>

      <div className="admin-editor-layout">
        <AdminSectionJumpNav
          items={SITE_PAGE_JUMP_ITEMS}
          activeId={activeSectionId}
        />
        <div className="admin-editor-sections">
          <CollapsiblePanel
            id="section-page-seo"
            title="Page SEO"
            subtitle="Title, description, OG image, keywords, noIndex"
            defaultOpen
          >
            <PageSeoFields
              value={doc.meta}
              onChange={(meta) => setDoc({ ...doc, meta })}
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id="section-page-metadata"
            title="Page metadata"
            subtitle="Hero, description, CTAs"
            defaultOpen
          >
            <div className="admin-grid-2">
              <TextField
                label="Title"
                value={doc.title}
                onChange={(title) => setDoc({ ...doc, title })}
              />
              <TextField
                label="Eyebrow"
                value={doc.eyebrow}
                onChange={(eyebrow) => setDoc({ ...doc, eyebrow })}
              />
            </div>
            <TextField
              label="Description"
              value={doc.description}
              onChange={(description) => setDoc({ ...doc, description })}
              multiline
              rows={3}
              hint="Page lead / fallback meta description when Page SEO description is empty"
            />
            <ImageField
              label="Hero image"
              value={doc.image}
              onChange={(image) => setDoc({ ...doc, image })}
            />
            <div className="admin-grid-2">
              <TextField
                label="CTA label"
                value={doc.ctaLabel ?? ""}
                onChange={(ctaLabel) => setDoc({ ...doc, ctaLabel })}
              />
              <TextField
                label="CTA link"
                value={doc.ctaHref ?? ""}
                onChange={(ctaHref) => setDoc({ ...doc, ctaHref })}
                placeholder="/enquire-now or #section"
              />
            </div>
          </CollapsiblePanel>

          <div id="section-page-content" className="admin-section-block">
            <div className="admin-field-header">
              <h2 className="admin-block-title">Content sections</h2>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => {
                  sectionKeys.addKey();
                  setDoc({
                    ...doc,
                    sections: [
                      ...doc.sections,
                      {
                        title: "New section",
                        body: "",
                        layout: "default",
                        items: [],
                      },
                    ],
                  });
                }}
              >
                Add section
              </button>
            </div>
            <SortableList
              ids={sectionKeys.keys}
              onReorder={handleSectionReorder}
            >
              {doc.sections.map((section, index) => (
                <SortableRow
                  key={sectionKeys.keys[index]}
                  id={sectionKeys.keys[index]}
                >
                  {({ dragHandleProps }) => (
                    <SectionEditor
                      section={section}
                      index={index}
                      dragHandleProps={dragHandleProps}
                      onChange={(next) => {
                        const sections = [...doc.sections];
                        sections[index] = next;
                        setDoc({ ...doc, sections });
                      }}
                      onRemove={() => {
                        sectionKeys.removeKey(index);
                        setDoc({
                          ...doc,
                          sections: doc.sections.filter((_, i) => i !== index),
                        });
                      }}
                    />
                  )}
                </SortableRow>
              ))}
            </SortableList>
          </div>

          <CollapsiblePanel
            id="section-page-packages"
            title="Pricing packages"
            subtitle={`${packages.length} packages`}
          >
            {packages.map((pkg, index) => (
              <div key={packageKeys.keys[index]} className="admin-nested-card">
                <TextField
                  label="Room / package name"
                  value={pkg.title}
                  onChange={(title) => {
                    const next = [...packages];
                    next[index] = { ...pkg, title };
                    setDoc({ ...doc, packages: next });
                  }}
                />
                <TextField
                  label="Price"
                  value={pkg.price}
                  onChange={(price) => {
                    const next = [...packages];
                    next[index] = { ...pkg, price };
                    setDoc({ ...doc, packages: next });
                  }}
                  placeholder="549 USD (732 USD)"
                />
                <ImageField
                  label="Package image"
                  value={pkg.image ?? ""}
                  onChange={(image) => {
                    const next = [...packages];
                    next[index] = { ...pkg, image };
                    setDoc({ ...doc, packages: next });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-sm--ghost"
                  onClick={() => {
                    packageKeys.removeKey(index);
                    setDoc({
                      ...doc,
                      packages: packages.filter((_, i) => i !== index),
                    });
                  }}
                >
                  Remove package
                </button>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                packageKeys.addKey();
                setDoc({
                  ...doc,
                  packages: [...packages, { title: "New package", price: "" }],
                });
              }}
            >
              Add package
            </button>
          </CollapsiblePanel>

          <CollapsiblePanel
            id="section-page-gallery"
            title="Gallery"
            subtitle={`${gallery.length} images`}
          >
            {gallery.map((item, index) => (
              <div key={galleryKeys.keys[index]} className="admin-nested-card">
                <ImageField
                  label="Image"
                  value={item.url}
                  onChange={(url) => {
                    const next = [...gallery];
                    next[index] = { ...item, url };
                    setDoc({ ...doc, gallery: next });
                  }}
                />
                <TextField
                  label="Category"
                  value={item.category}
                  onChange={(category) => {
                    const next = [...gallery];
                    next[index] = { ...item, category };
                    setDoc({ ...doc, gallery: next });
                  }}
                  placeholder="practice, accommodation, campus…"
                />
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-sm--ghost"
                  onClick={() => {
                    galleryKeys.removeKey(index);
                    setDoc({
                      ...doc,
                      gallery: gallery.filter((_, i) => i !== index),
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                galleryKeys.addKey();
                setDoc({
                  ...doc,
                  gallery: [...gallery, { url: "", category: "general" }],
                });
              }}
            >
              Add gallery image
            </button>
          </CollapsiblePanel>

          <CollapsiblePanel
            id="section-page-cards"
            title="Program cards"
            subtitle={`${cards.length} cards`}
          >
            {cards.map((card, index) => (
              <div key={cardKeys.keys[index]} className="admin-nested-card">
                <TextField
                  label="Title"
                  value={card.title}
                  onChange={(title) => {
                    const next = [...cards];
                    next[index] = { ...card, title };
                    setDoc({ ...doc, cards: next });
                  }}
                />
                <TextField
                  label="Description"
                  value={card.description}
                  onChange={(description) => {
                    const next = [...cards];
                    next[index] = { ...card, description };
                    setDoc({ ...doc, cards: next });
                  }}
                  multiline
                />
                <TextField
                  label="Link"
                  value={card.href ?? ""}
                  onChange={(href) => {
                    const next = [...cards];
                    next[index] = { ...card, href };
                    setDoc({ ...doc, cards: next });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-sm--ghost"
                  onClick={() => {
                    cardKeys.removeKey(index);
                    setDoc({
                      ...doc,
                      cards: cards.filter((_, i) => i !== index),
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                cardKeys.addKey();
                setDoc({
                  ...doc,
                  cards: [...cards, { title: "", description: "" }],
                });
              }}
            >
              Add card
            </button>
          </CollapsiblePanel>

          <CollapsiblePanel
            id="section-page-people"
            title="Teachers / people"
            subtitle={`${people.length} selected from faculty`}
            description="Pick faculty from the Teachers data store. Edit full profiles under Teachers — not here."
          >
            <TeachersPicker
              selectedSlugs={selectedTeacherSlugs}
              onChange={(_slugs, nextPeople) =>
                setDoc({ ...doc, people: nextPeople })
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id="section-page-highlights"
            title="Highlights"
            subtitle={`${highlights.length} items`}
          >
            {highlights.map((item, index) => (
              <div
                key={highlightKeys.keys[index]}
                className="admin-nested-card"
              >
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(title) => {
                    const next = [...highlights];
                    next[index] = { ...item, title };
                    setDoc({ ...doc, highlights: next });
                  }}
                />
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(description) => {
                    const next = [...highlights];
                    next[index] = { ...item, description };
                    setDoc({ ...doc, highlights: next });
                  }}
                  multiline
                />
                <ImageField
                  label="Image"
                  value={item.image ?? ""}
                  onChange={(image) => {
                    const next = [...highlights];
                    next[index] = { ...item, image };
                    setDoc({ ...doc, highlights: next });
                  }}
                />
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-sm--ghost"
                  onClick={() => {
                    highlightKeys.removeKey(index);
                    setDoc({
                      ...doc,
                      highlights: highlights.filter((_, i) => i !== index),
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                highlightKeys.addKey();
                setDoc({
                  ...doc,
                  highlights: [...highlights, { title: "", description: "" }],
                });
              }}
            >
              Add highlight
            </button>
          </CollapsiblePanel>
        </div>
      </div>

      <AdminSaveBar
        title={doc.title || "Page"}
        subtitle={doc.slug}
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
