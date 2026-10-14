"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { SectionIdField } from "@/components/admin/SectionIdField";
import { toSectionDomId } from "@/components/admin/sectionDomId";
import { TextField } from "@/components/admin/TextField";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import type {
  ContactDetailItem,
  ContactPageContent,
} from "@/content/types/dedicated-pages";

type ContactPageEditorProps = {
  /** Initial contact content_data document */
  initial: ContactPageContent;
  /** Persist handler */
  onSave: (doc: ContactPageContent) => Promise<void>;
  backHref?: string;
  backLabel?: string;
};

const ICON_OPTIONS: ContactDetailItem["iconKey"][] = [
  "maps",
  "whatsapp",
  "email",
];

const CONTACT_JUMP_DEFS = [
  { slug: "meta", label: "Page metadata", key: "meta" as const },
  { slug: "hero", label: "Hero", key: "hero" as const },
  { slug: "details", label: "Contact details", key: "detailsSection" as const },
  { slug: "form", label: "Form copy", key: "form" as const },
  { slug: "map", label: "Map", key: "map" as const },
] as const;

/**
 * Admin editor for `/contact` content_data (SEO, hero, details, form, map).
 *
 * @param props - Initial document and save handler
 */
export function ContactPageEditor({
  initial,
  onSave,
  backHref = "/admin/sections/other",
  backLabel = "Other pages",
}: ContactPageEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;
  const detailKeys = useStableListKeys(doc.details.length);

  const jumpItems = useMemo(() => {
    return CONTACT_JUMP_DEFS.map((def) => {
      const section =
        def.key === "meta"
          ? doc.meta
          : def.key === "detailsSection"
            ? doc.detailsSection
            : doc[def.key];
      return {
        id: toSectionDomId(def.slug, section),
        label: def.label,
      };
    });
  }, [doc]);

  const sectionIds = useMemo(
    () => jumpItems.map((item) => item.id),
    [jumpItems],
  );
  const activeSectionId = useSectionScrollSpy(sectionIds);

  /** Resolves panel DOM id for a contact jump-nav slug. */
  function panelId(slug: (typeof CONTACT_JUMP_DEFS)[number]["slug"]): string {
    const def = CONTACT_JUMP_DEFS.find((d) => d.slug === slug);
    if (!def) return toSectionDomId(slug);
    const section =
      def.key === "meta"
        ? doc.meta
        : def.key === "detailsSection"
          ? doc.detailsSection
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
    <div className="admin-editor">
      <div className="admin-editor-header">
        <div>
          <Link href={backHref} className="admin-back-link">
            ← {backLabel}
          </Link>
          <h1 className="admin-title">Contact</h1>
          <p className="admin-subtitle">
            Hero, contact cards, form copy, and map visibility for /contact.
          </p>
        </div>
        <a
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview /contact
        </a>
      </div>

      <div className="admin-editor-layout">
        <AdminSectionJumpNav items={jumpItems} activeId={activeSectionId} />

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
          >
            <SectionIdField
              fieldId="contact-hero-id"
              value={doc.hero._id}
              onChange={(_id) => setDoc({ ...doc, hero: { ...doc.hero, _id } })}
            />
            <ImageField
              label="Hero image"
              value={doc.hero.image}
              onChange={(image) =>
                setDoc({ ...doc, hero: { ...doc.hero, image } })
              }
            />
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
            id={panelId("details")}
            title="Contact details"
            subtitle="Location, WhatsApp, email"
          >
            <SectionIdField
              fieldId="contact-details-id"
              value={doc.detailsSection?._id}
              onChange={(_id) =>
                setDoc({
                  ...doc,
                  detailsSection: { ...doc.detailsSection, _id },
                })
              }
            />
            <div className="admin-nested-list-head">
              <span className="admin-label">Detail cards</span>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => {
                  detailKeys.addKey();
                  setDoc({
                    ...doc,
                    details: [
                      ...doc.details,
                      {
                        title: "",
                        value: "",
                        href: "",
                        actionText: "",
                        iconKey: "maps",
                      },
                    ],
                  });
                }}
              >
                Add detail
              </button>
            </div>
            {doc.details.map((item, index) => (
              <div key={detailKeys.keys[index]} className="admin-nested-card">
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(title) => {
                    const details = [...doc.details];
                    details[index] = { ...item, title };
                    setDoc({ ...doc, details });
                  }}
                />
                <TextField
                  label="Value"
                  value={item.value}
                  onChange={(value) => {
                    const details = [...doc.details];
                    details[index] = { ...item, value };
                    setDoc({ ...doc, details });
                  }}
                />
                <TextField
                  label="Href"
                  value={item.href}
                  onChange={(href) => {
                    const details = [...doc.details];
                    details[index] = { ...item, href };
                    setDoc({ ...doc, details });
                  }}
                />
                <TextField
                  label="Action text"
                  value={item.actionText}
                  onChange={(actionText) => {
                    const details = [...doc.details];
                    details[index] = { ...item, actionText };
                    setDoc({ ...doc, details });
                  }}
                />
                <div className="admin-field">
                  <label className="admin-label" htmlFor={`icon-${index}`}>
                    Icon
                  </label>
                  <select
                    id={`icon-${index}`}
                    className="admin-input"
                    value={item.iconKey}
                    onChange={(event) => {
                      const details = [...doc.details];
                      details[index] = {
                        ...item,
                        iconKey: event.target
                          .value as ContactDetailItem["iconKey"],
                      };
                      setDoc({ ...doc, details });
                    }}
                  >
                    {ICON_OPTIONS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="admin-btn-sm admin-btn-sm--ghost"
                  onClick={() => {
                    detailKeys.removeKey(index);
                    setDoc({
                      ...doc,
                      details: doc.details.filter((_, i) => i !== index),
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("form")}
            title="Form copy"
            subtitle="Labels next to the contact form"
          >
            <SectionIdField
              fieldId="contact-form-id"
              value={doc.form._id}
              onChange={(_id) => setDoc({ ...doc, form: { ...doc.form, _id } })}
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
              fieldId="contact-map-id"
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
        </div>
      </div>

      <AdminSaveBar
        title="Contact"
        subtitle="content_data"
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/contact"
      />
    </div>
  );
}
