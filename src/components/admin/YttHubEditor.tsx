"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { ImageListField } from "@/components/admin/ImageListField";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { toSectionDomId } from "@/components/admin/sectionDomId";
import { SectionIdField } from "@/components/admin/SectionIdField";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import type { YttHubContent } from "@/content/types/shared-sections";

type YttHubEditorProps = {
  /** YTT hub global_settings document */
  initial: YttHubContent;
  onSave: (doc: YttHubContent) => Promise<void>;
  backHref?: string;
  backLabel?: string;
};

const YTT_HUB_JUMP_DEFS = [
  { slug: "meta", label: "Page metadata", key: "meta" as const },
  { slug: "hero", label: "Hero", key: "hero" as const },
  { slug: "sticky-nav", label: "Sticky nav", key: "stickyNav" as const },
  { slug: "overview", label: "Overview", key: "overview" as const },
  { slug: "why-rishikesh", label: "Why Rishikesh", key: "whyRishikesh" as const },
  { slug: "courses", label: "Courses", key: "courses" as const },
  { slug: "eligibility", label: "Eligibility", key: "eligibility" as const },
  { slug: "faq", label: "FAQ", key: "faq" as const },
] as const;

type SectionIdKey = keyof NonNullable<YttHubContent["sectionIds"]>;

/**
 * Resolves a section id object for admin panel DOM ids from `doc.sectionIds`.
 *
 * @param doc - Current YTT hub document
 * @param key - Section key in `sectionIds`
 */
function sectionIdRef(
  doc: YttHubContent,
  key: SectionIdKey,
): { _id?: string } {
  return { _id: doc.sectionIds?.[key] };
}

/**
 * Admin editor for the YTT hub page (`global_settings.yttHub`).
 *
 * @param props - Initial content and save handler
 */
export function YttHubEditor({
  initial,
  onSave,
  backHref = "/admin/sections/other",
  backLabel = "Other pages",
}: YttHubEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;
  const courseKeys = useStableListKeys(doc.courses.length);
  const faqKeys = useStableListKeys(doc.faqs.length);
  const navKeys = useStableListKeys(doc.nav.length);

  const jumpItems = useMemo(() => {
    return YTT_HUB_JUMP_DEFS.map((def) => {
      const section =
        def.key === "meta"
          ? doc.meta
          : sectionIdRef(doc, def.key);
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

  /** Resolves panel DOM id for a YTT hub jump-nav slug. */
  function panelId(slug: (typeof YTT_HUB_JUMP_DEFS)[number]["slug"]): string {
    const def = YTT_HUB_JUMP_DEFS.find((d) => d.slug === slug);
    if (!def) return toSectionDomId(slug);
    const section =
      def.key === "meta" ? doc.meta : sectionIdRef(doc, def.key);
    return toSectionDomId(def.slug, section);
  }

  /** Patches one key on `doc.sectionIds`. */
  function patchSectionId(key: SectionIdKey, _id: string) {
    setDoc({
      ...doc,
      sectionIds: { ...doc.sectionIds, [key]: _id },
    });
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
          <h1 className="admin-title">YTT Hub</h1>
          <p className="admin-subtitle">
            Stored in shared settings (`yttHub`) — matches the live hub layout.
          </p>
        </div>
        <a
          href="/yoga-teacher-training-in-rishikesh-india"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview
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

          <CollapsiblePanel id={panelId("hero")} title="Hero" defaultOpen>
            <SectionIdField
              fieldId="ytt-hub-hero-id"
              value={doc.sectionIds?.hero}
              onChange={(_id) => patchSectionId("hero", _id)}
            />
            <ImageField
              label="Hero image"
              value={doc.heroImage}
              onChange={(heroImage) => setDoc({ ...doc, heroImage })}
            />
            <TextField
              label="Pill"
              value={doc.intro.pill}
              onChange={(pill) =>
                setDoc({ ...doc, intro: { ...doc.intro, pill } })
              }
            />
            <TextField
              label="Title"
              value={doc.intro.title}
              onChange={(title) =>
                setDoc({ ...doc, intro: { ...doc.intro, title } })
              }
            />
            <TextField
              label="Lead"
              value={doc.intro.lead}
              onChange={(lead) =>
                setDoc({ ...doc, intro: { ...doc.intro, lead } })
              }
              multiline
            />
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("sticky-nav")} title="Sticky nav">
            <SectionIdField
              fieldId="ytt-hub-sticky-nav-id"
              value={doc.sectionIds?.stickyNav}
              onChange={(_id) => patchSectionId("stickyNav", _id)}
            />
            {doc.nav.map((item, index) => (
              <div key={navKeys.keys[index]} className="admin-grid-2">
                <TextField
                  label="Id"
                  value={item.id}
                  onChange={(id) => {
                    const nav = [...doc.nav];
                    nav[index] = { ...item, id: id as `#${string}` };
                    setDoc({ ...doc, nav });
                  }}
                />
                <TextField
                  label="Label"
                  value={item.label}
                  onChange={(label) => {
                    const nav = [...doc.nav];
                    nav[index] = { ...item, label };
                    setDoc({ ...doc, nav });
                  }}
                />
              </div>
            ))}
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("overview")} title="Overview">
            <SectionIdField
              fieldId="ytt-hub-overview-id"
              value={doc.sectionIds?.overview}
              onChange={(_id) => patchSectionId("overview", _id)}
            />
            <ImageField
              label="Overview image"
              value={doc.overviewImage}
              onChange={(overviewImage) => setDoc({ ...doc, overviewImage })}
            />
            <ImageField
              label="Inset image"
              value={doc.overviewInsetImage}
              onChange={(overviewInsetImage) =>
                setDoc({ ...doc, overviewInsetImage })
              }
            />
            <StringListField
              label="Overview points"
              items={doc.intro.overviewPoints}
              onChange={(overviewPoints) =>
                setDoc({ ...doc, intro: { ...doc.intro, overviewPoints } })
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("why-rishikesh")} title="Why Rishikesh">
            <SectionIdField
              fieldId="ytt-hub-why-rishikesh-id"
              value={doc.sectionIds?.whyRishikesh}
              onChange={(_id) => patchSectionId("whyRishikesh", _id)}
            />
            <TextField
              label="Title"
              value={doc.whyRishikesh.title}
              onChange={(title) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, title },
                })
              }
            />
            <StringListField
              label="Paragraphs"
              items={doc.whyRishikesh.paragraphs}
              onChange={(paragraphs) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, paragraphs },
                })
              }
            />
            <ImageListField
              label="Images"
              items={doc.whyRishikesh.images}
              onChange={(images) =>
                setDoc({
                  ...doc,
                  whyRishikesh: {
                    ...doc.whyRishikesh,
                    images: images.map((img) => img.url),
                  },
                })
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("courses")} title="Courses">
            <SectionIdField
              fieldId="ytt-hub-courses-id"
              value={doc.sectionIds?.courses}
              onChange={(_id) => patchSectionId("courses", _id)}
            />
            <TextField
              label="Intro title"
              value={doc.coursesIntro.title}
              onChange={(title) =>
                setDoc({
                  ...doc,
                  coursesIntro: { ...doc.coursesIntro, title },
                })
              }
            />
            <StringListField
              label="Intro paragraphs"
              items={doc.coursesIntro.paragraphs}
              onChange={(paragraphs) =>
                setDoc({
                  ...doc,
                  coursesIntro: { ...doc.coursesIntro, paragraphs },
                })
              }
            />
            {doc.courses.map((course, index) => (
              <div key={courseKeys.keys[index]} className="admin-nested-card">
                <TextField
                  label="Course title"
                  value={course.title}
                  onChange={(title) => {
                    const courses = [...doc.courses];
                    courses[index] = { ...course, title };
                    setDoc({ ...doc, courses });
                  }}
                />
                <TextField
                  label="Fee"
                  value={course.fee}
                  onChange={(fee) => {
                    const courses = [...doc.courses];
                    courses[index] = { ...course, fee };
                    setDoc({ ...doc, courses });
                  }}
                />
                <TextField
                  label="Href"
                  value={course.href}
                  onChange={(href) => {
                    const courses = [...doc.courses];
                    courses[index] = { ...course, href };
                    setDoc({ ...doc, courses });
                  }}
                />
              </div>
            ))}
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("eligibility")} title="Eligibility">
            <SectionIdField
              fieldId="ytt-hub-eligibility-id"
              value={doc.sectionIds?.eligibility}
              onChange={(_id) => patchSectionId("eligibility", _id)}
            />
            <TextField
              label="Title"
              value={doc.eligibility.title}
              onChange={(title) =>
                setDoc({
                  ...doc,
                  eligibility: { ...doc.eligibility, title },
                })
              }
            />
            <StringListField
              label="Paragraphs"
              items={doc.eligibility.paragraphs}
              onChange={(paragraphs) =>
                setDoc({
                  ...doc,
                  eligibility: { ...doc.eligibility, paragraphs },
                })
              }
            />
          </CollapsiblePanel>

          <p className="admin-hint admin-editor-hint">
            Faculty list:{" "}
            <a href="/admin/sections/teachers" className="admin-link">
              Teachers
            </a>
          </p>

          <CollapsiblePanel id={panelId("faq")} title="FAQ">
            <SectionIdField
              fieldId="ytt-hub-faq-id"
              value={doc.sectionIds?.faq}
              onChange={(_id) => patchSectionId("faq", _id)}
            />
            {doc.faqs.map((faq, index) => (
              <div key={faqKeys.keys[index]} className="admin-nested-card">
                <TextField
                  label="Question"
                  value={faq.question}
                  onChange={(question) => {
                    const faqs = [...doc.faqs];
                    faqs[index] = { ...faq, question };
                    setDoc({ ...doc, faqs });
                  }}
                />
                <TextField
                  label="Answer"
                  value={faq.answer}
                  onChange={(answer) => {
                    const faqs = [...doc.faqs];
                    faqs[index] = { ...faq, answer };
                    setDoc({ ...doc, faqs });
                  }}
                  multiline
                />
              </div>
            ))}
          </CollapsiblePanel>
        </div>
      </div>

      <AdminSaveBar
        title="YTT Hub"
        subtitle="global_settings.yttHub"
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/yoga-teacher-training-in-rishikesh-india"
      />
    </div>
  );
}
