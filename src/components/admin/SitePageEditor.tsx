"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { pagePath } from "@/content/pages/path";
import { getPageRef } from "@/content/pages/registry";
import type { SitePageDocument } from "@/content/types";
import { AdminSaveBar } from "./AdminSaveBar";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { PageSeoFields } from "./PageSeoFields";
import { SectionEditor } from "./SectionEditor";
import {
  SortableList,
  SortableRow,
  reorderItems,
  withSortField,
} from "./SortableList";
import { StringListField } from "./StringListField";
import { TextField } from "./TextField";
import { useStableListKeys } from "./useStableListKeys";

type SitePageEditorProps = {
  initial: SitePageDocument;
  onSave: (doc: SitePageDocument) => Promise<void>;
};

/**
 * Full dynamic editor for a `SitePageDocument` and all nested fields.
 *
 * @param props - Initial page document and persist handler
 */
export function SitePageEditor({ initial, onSave }: SitePageEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const packages = doc.packages ?? [];
  const gallery = doc.gallery ?? [];
  const cards = doc.cards ?? [];
  const people = doc.people ?? [];
  const highlights = doc.highlights ?? [];
  const sectionKeys = useStableListKeys(doc.sections.length);
  const packageKeys = useStableListKeys(packages.length);
  const galleryKeys = useStableListKeys(gallery.length);
  const cardKeys = useStableListKeys(cards.length);
  const peopleKeys = useStableListKeys(people.length);
  const highlightKeys = useStableListKeys(highlights.length);

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

      <div className="admin-section-block">
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

      <CollapsiblePanel title="Gallery" subtitle={`${gallery.length} images`}>
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
                setDoc({ ...doc, cards: cards.filter((_, i) => i !== index) });
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
        title="Teachers / people"
        subtitle={`${people.length} profiles`}
      >
        {people.map((person, index) => (
          <div key={peopleKeys.keys[index]} className="admin-nested-card">
            <TextField
              label="Name"
              value={person.name}
              onChange={(name) => {
                const next = [...people];
                next[index] = { ...person, name };
                setDoc({ ...doc, people: next });
              }}
            />
            <ImageField
              label="Photo"
              value={person.image ?? ""}
              onChange={(image) => {
                const next = [...people];
                next[index] = { ...person, image };
                setDoc({ ...doc, people: next });
              }}
            />
            <TextField
              label="Summary"
              value={person.summary ?? ""}
              onChange={(summary) => {
                const next = [...people];
                next[index] = { ...person, summary };
                setDoc({ ...doc, people: next });
              }}
              multiline
            />
            <TextField
              label="Bio"
              value={person.bio ?? ""}
              onChange={(bio) => {
                const next = [...people];
                next[index] = { ...person, bio };
                setDoc({ ...doc, people: next });
              }}
              multiline
              rows={5}
            />
            <StringListField
              label="Education"
              items={person.education ?? []}
              onChange={(education) => {
                const next = [...people];
                next[index] = { ...person, education };
                setDoc({ ...doc, people: next });
              }}
            />
            <StringListField
              label="Experience"
              items={person.experience ?? []}
              onChange={(experience) => {
                const next = [...people];
                next[index] = { ...person, experience };
                setDoc({ ...doc, people: next });
              }}
            />
            <StringListField
              label="Expertise"
              items={person.expertise ?? []}
              onChange={(expertise) => {
                const next = [...people];
                next[index] = { ...person, expertise };
                setDoc({ ...doc, people: next });
              }}
            />
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => {
                peopleKeys.removeKey(index);
                setDoc({
                  ...doc,
                  people: people.filter((_, i) => i !== index),
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
            peopleKeys.addKey();
            setDoc({
              ...doc,
              people: [...people, { name: "New teacher" }],
            });
          }}
        >
          Add person
        </button>
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Highlights"
        subtitle={`${highlights.length} items`}
      >
        {highlights.map((item, index) => (
          <div key={highlightKeys.keys[index]} className="admin-nested-card">
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

      <AdminSaveBar
        title={doc.title || "Page"}
        subtitle={doc.slug}
        saving={saving}
        saved={saved}
        error={error}
        onSave={handleSave}
        previewHref={previewHref}
      />
    </div>
  );
}
