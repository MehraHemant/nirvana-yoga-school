"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { toSectionDomId } from "@/components/admin/sectionDomId";
import { SectionIdField } from "@/components/admin/SectionIdField";
import {
  DragHandle,
  SortableList,
  SortableRow,
  reorderItems,
  withSortField,
} from "@/components/admin/SortableList";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import type { SitePageDocument, SitePagePerson } from "@/content/types";

type TeachersFacultyEditorProps = {
  /** Teacher page document from MySQL */
  initial: SitePageDocument;
  /** Persist handler (PUT /api/admin/pages/teacher) */
  onSave: (doc: SitePageDocument) => Promise<void>;
  /** Back link target */
  backHref?: string;
  /** Back link label */
  backLabel?: string;
};

const TEACHERS_JUMP_DEFS = [
  { slug: "meta", label: "Page metadata" },
  { slug: "hero", label: "Hero band" },
  { slug: "faculty", label: "Faculty section" },
  { slug: "home-teaser", label: "Home teaser" },
  { slug: "profiles", label: "Faculty profiles" },
] as const;

/**
 * Admin editor shaped like the public `/teacher` UI:
 * hero band + faculty profiles (bio, education, experience, expertise).
 * Not the generic course module editor.
 *
 * @param props - Initial document and save handler
 */
export function TeachersFacultyEditor({
  initial,
  onSave,
  backHref = "/admin/sections/teachers",
  backLabel = "Teachers",
}: TeachersFacultyEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;

  const people = doc.people ?? [];
  const presentation = doc.presentation ?? {};
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    people.length,
  );

  const jumpItems = useMemo(() => {
    return TEACHERS_JUMP_DEFS.map((def) => {
      const section =
        def.slug === "meta"
          ? doc.meta
          : def.slug === "hero"
            ? { _id: presentation.heroId }
            : def.slug === "faculty"
              ? { _id: presentation.facultyId }
              : def.slug === "home-teaser"
                ? { _id: presentation.homeTeaserId }
                : undefined;
      return {
        id: toSectionDomId(def.slug, section),
        label: def.label,
      };
    });
  }, [doc.meta, presentation.facultyId, presentation.heroId, presentation.homeTeaserId]);

  const sectionIds = useMemo(
    () => jumpItems.map((item) => item.id),
    [jumpItems],
  );
  const activeSectionId = useSectionScrollSpy(sectionIds);

  /** Resolves panel DOM id for a teachers jump-nav slug. */
  function panelId(slug: (typeof TEACHERS_JUMP_DEFS)[number]["slug"]): string {
    const section =
      slug === "meta"
        ? doc.meta
        : slug === "hero"
          ? { _id: presentation.heroId }
          : slug === "faculty"
            ? { _id: presentation.facultyId }
            : slug === "home-teaser"
              ? { _id: presentation.homeTeaserId }
              : undefined;
    return toSectionDomId(slug, section);
  }

  function handlePeopleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const next = withSortField(
      reorderItems(people, fromIndex, toIndex),
    ) as SitePagePerson[];
    setDoc({ ...doc, people: next });
  }

  function updatePerson(index: number, patch: Partial<SitePagePerson>) {
    const next = [...people];
    next[index] = { ...people[index], ...patch };
    setDoc({ ...doc, people: next });
  }

  function updatePresentation(
    patch: NonNullable<SitePageDocument["presentation"]>,
  ) {
    setDoc({
      ...doc,
      presentation: { ...presentation, ...patch },
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const next = {
        ...doc,
        sections: doc.sections ?? [],
        people,
        presentation,
      };
      await onSave(next);
      setBaseline(JSON.stringify(next));
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
          <h1 className="admin-title">Faculty</h1>
          <p className="admin-subtitle">
            Matches the public teachers page — hero + profile cards with
            education, experience, and expertise.
          </p>
        </div>
        <a
          href="/teacher"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview /teacher
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
            title="Hero band"
            subtitle="Background image, eyebrow, title, lead, quote"
            defaultOpen
          >
            <SectionIdField
              fieldId="teachers-hero-id"
              value={presentation.heroId}
              onChange={(heroId) => updatePresentation({ heroId })}
            />
            <ImageField
              label="Hero background image"
              value={doc.image}
              onChange={(image) => setDoc({ ...doc, image })}
            />
            <TextField
              label="Eyebrow"
              value={doc.eyebrow}
              onChange={(eyebrow) => setDoc({ ...doc, eyebrow })}
              hint='e.g. "Our Spiritual Indian Gurus"'
            />
            <TextField
              label="Title"
              value={doc.title}
              onChange={(title) => setDoc({ ...doc, title })}
              hint='Shown as the main H1 (e.g. "Faculty of Nirvana")'
            />
            <TextField
              label="Hero lead"
              value={presentation.heroLead ?? doc.description}
              onChange={(heroLead) =>
                setDoc({
                  ...doc,
                  description: heroLead,
                  presentation: { ...presentation, heroLead },
                })
              }
              multiline
              rows={3}
            />
            <TextField
              label="Hero quote"
              value={presentation.heroQuote ?? ""}
              onChange={(heroQuote) =>
                setDoc({
                  ...doc,
                  presentation: { ...presentation, heroQuote },
                })
              }
              multiline
              rows={2}
              hint="Italic quote under the lead on desktop"
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("faculty")}
            title="Faculty section header"
            subtitle="Above the profile cards on /teacher"
          >
            <SectionIdField
              fieldId="teachers-faculty-id"
              value={presentation.facultyId}
              onChange={(facultyId) => updatePresentation({ facultyId })}
            />
            <TextField
              label="Section eyebrow"
              value={presentation.sectionEyebrow ?? ""}
              onChange={(sectionEyebrow) =>
                updatePresentation({ sectionEyebrow })
              }
            />
            <TextField
              label="Section title"
              value={presentation.sectionTitle ?? ""}
              onChange={(sectionTitle) => updatePresentation({ sectionTitle })}
            />
            <TextField
              label="Section description"
              value={presentation.sectionDescription ?? ""}
              onChange={(sectionDescription) =>
                updatePresentation({ sectionDescription })
              }
              multiline
              rows={2}
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("home-teaser")}
            title="Homepage teachers strip"
            subtitle="Copy for the home Teachers section"
          >
            <SectionIdField
              fieldId="teachers-home-teaser-id"
              value={presentation.homeTeaserId}
              onChange={(homeTeaserId) => updatePresentation({ homeTeaserId })}
            />
            <TextField
              label="Home eyebrow"
              value={presentation.homeEyebrow ?? ""}
              onChange={(homeEyebrow) => updatePresentation({ homeEyebrow })}
            />
            <TextField
              label="Home title"
              value={presentation.homeTitle ?? ""}
              onChange={(homeTitle) => updatePresentation({ homeTitle })}
              hint="Plain text — accent phrase can stay in the component"
            />
            <TextField
              label="Home description"
              value={presentation.homeDescription ?? ""}
              onChange={(homeDescription) =>
                updatePresentation({ homeDescription })
              }
              multiline
              rows={3}
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("profiles")}
            title="Faculty profiles"
            subtitle={`${people.length} teachers — order = display order`}
            defaultOpen
          >
            <SortableList ids={keys} onReorder={handlePeopleReorder}>
              {people.map((person, index) => (
                <SortableRow key={keys[index]} id={keys[index]}>
                  {({ dragHandleProps }) => (
                    <div className="admin-nested-card">
                      <div className="admin-nested-card-head">
                        <span className="admin-nested-card-title">
                          <DragHandle dragHandleProps={dragHandleProps} />
                          <span className="admin-nested-card-index">
                            #{index + 1}
                          </span>
                          <strong>{person.name || "Untitled"}</strong>
                        </span>
                        <button
                          type="button"
                          className="admin-btn-sm admin-btn-sm--ghost"
                          onClick={() => {
                            removeKey(index);
                            setDoc({
                              ...doc,
                              people: people.filter((_, i) => i !== index),
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <TextField
                        label="Name"
                        value={person.name}
                        onChange={(name) => updatePerson(index, { name })}
                      />
                      <ImageField
                        label="Portrait"
                        value={person.image ?? ""}
                        onChange={(image) => updatePerson(index, { image })}
                      />
                      <TextField
                        label="Experience summary"
                        value={person.summary ?? ""}
                        onChange={(summary) => updatePerson(index, { summary })}
                        hint='Eyebrow under the name (e.g. "9 years of teaching")'
                      />
                      <TextField
                        label="Biography"
                        value={person.bio ?? ""}
                        onChange={(bio) => updatePerson(index, { bio })}
                        multiline
                        rows={5}
                      />
                      <StringListField
                        label="Education"
                        items={person.education ?? []}
                        onChange={(education) =>
                          updatePerson(index, { education })
                        }
                        addLabel="Add education line"
                      />
                      <StringListField
                        label="Experience"
                        items={person.experience ?? []}
                        onChange={(experience) =>
                          updatePerson(index, { experience })
                        }
                        addLabel="Add experience line"
                      />
                      <StringListField
                        label="Expertise"
                        items={person.expertise ?? []}
                        onChange={(expertise) =>
                          updatePerson(index, { expertise })
                        }
                        addLabel="Add expertise tag"
                      />
                    </div>
                  )}
                </SortableRow>
              ))}
            </SortableList>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                addKey();
                setDoc({
                  ...doc,
                  people: [
                    ...people,
                    {
                      name: "New teacher",
                      summary: "",
                      bio: "",
                      education: [],
                      experience: [],
                      expertise: [],
                    },
                  ],
                });
              }}
            >
              Add teacher
            </button>
          </CollapsiblePanel>
        </div>
      </div>

      <AdminSaveBar
        title="Faculty"
        subtitle="/teacher"
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/teacher"
      />
    </div>
  );
}
