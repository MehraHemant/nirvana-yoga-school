"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { HeroModuleEditor } from "@/components/admin/modules/HeroModuleEditor";
import { StickyNavModuleEditor } from "@/components/admin/modules/StickyNavModuleEditor";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { StringListField } from "@/components/admin/StringListField";
import {
  scrollToSection,
  toSectionDomId,
} from "@/components/admin/sectionDomId";
import { TeachersPicker } from "@/components/admin/TeachersPicker";
import { TextField } from "@/components/admin/TextField";
import { useAdminSectionAccordion } from "@/components/admin/useAdminSectionAccordion";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { createEmptyPageModules } from "@/content/page-modules-defaults";
import { teacherSlug } from "@/content/teachers-slug";
import type {
  OnlineCourseDocument,
  PageModulesDocument,
} from "@/content/types";

type OnlineCourseEditorProps = {
  /** Online course document (live body source) */
  initialCourse: OnlineCourseDocument;
  /** Page modules (hero + sticky nav only) */
  initialModules: PageModulesDocument | null;
  slug: string;
  backHref?: string;
  backLabel?: string;
  /** Save course document + modules together */
  onSave: (payload: {
    course: OnlineCourseDocument;
    modules: PageModulesDocument;
  }) => Promise<void>;
};

const ONLINE_COURSE_JUMP_SECTIONS = [
  { slug: "meta", label: "Page metadata" },
  { slug: "hero", label: "Hero" },
  { slug: "basics", label: "Trust bar / basics" },
  { slug: "sticky-nav", label: "Sticky nav" },
  { slug: "overview", label: "Overview" },
  { slug: "inclusions", label: "Inclusions" },
  { slug: "pricing", label: "Pricing" },
  { slug: "curriculum", label: "Curriculum" },
  { slug: "teachers", label: "Teachers" },
  { slug: "testimonials", label: "Testimonials" },
  { slug: "faq", label: "FAQ" },
] as const;

const ONLINE_PANEL_KEYS = ONLINE_COURSE_JUMP_SECTIONS.map(
  (section) => section.slug,
);

/**
 * Builds the modules document when a legacy online course lacks persisted modules.
 *
 * @param initialModules - Persisted modules, when available
 * @param course - Online course document used to scaffold the hero and nav
 */
function onlineCourseModules(
  initialModules: PageModulesDocument | null,
  course: OnlineCourseDocument,
): PageModulesDocument {
  if (initialModules?.hero) return initialModules;
  const scaffold = createEmptyPageModules("split-copy");
  scaffold.hero = {
    ...scaffold.hero,
    type: "split-copy",
    title: course.title,
    subtitle: course.subtitle,
    previewType: "image",
    previewUrl: course.image || "",
  };
  scaffold.stickyNav = { items: course.navItems ?? [] };
  return scaffold;
}

/**
 * Online course admin editor aligned to live sections:
 * Hero, Trust bar, Sticky nav, Overview, Inclusions, Pricing, Curriculum,
 * Teachers, Testimonials, FAQ — no residential syllabus/eligibility/flags.
 *
 * @param props - Course + modules and save handler
 */
export function OnlineCourseEditor({
  initialCourse,
  initialModules,
  slug,
  backHref = "/admin/sections/online",
  backLabel = "Online courses",
  onSave,
}: OnlineCourseEditorProps) {
  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState<PageModulesDocument>(() =>
    onlineCourseModules(initialModules, initialCourse),
  );
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({
      course: initialCourse,
      modules: onlineCourseModules(initialModules, initialCourse),
    }),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = useMemo(
    () => JSON.stringify({ course, modules }) !== baseline,
    [course, modules, baseline],
  );

  const pricingKeys = useStableListKeys(course.pricing.length);
  const syllabusKeys = useStableListKeys(course.syllabus.length);
  const testimonialKeys = useStableListKeys(course.testimonials.length);
  const faqKeys = useStableListKeys(course.faqs.length);
  const selectedTeacherSlugs = course.teachers.map((t) => teacherSlug(t.name));
  const { openOnly, panelOpenProps } =
    useAdminSectionAccordion(ONLINE_PANEL_KEYS);

  useEffect(() => {
    const nextModules = onlineCourseModules(initialModules, initialCourse);
    setCourse(initialCourse);
    setModules(nextModules);
    setBaseline(
      JSON.stringify({ course: initialCourse, modules: nextModules }),
    );
    setSaved(false);
    setError("");
  }, [initialCourse, initialModules]);

  const jumpItems = useMemo(
    () =>
      ONLINE_COURSE_JUMP_SECTIONS.map((section, index) => ({
        ...section,
        step: index + 1,
        id: toSectionDomId(
          section.slug,
          section.slug === "meta"
            ? modules.meta
            : section.slug === "hero"
              ? modules.hero
              : section.slug === "sticky-nav"
                ? modules.stickyNav
                : undefined,
        ),
      })),
    [modules],
  );
  const activeSectionId = useSectionScrollSpy(jumpItems.map((item) => item.id));

  /** Resolves the current DOM id for an online course editor panel. */
  function panelId(
    slug: (typeof ONLINE_COURSE_JUMP_SECTIONS)[number]["slug"],
  ): string {
    return (
      jumpItems.find((item) => item.slug === slug)?.id ?? toSectionDomId(slug)
    );
  }

  /**
   * Jump nav: open only the target section, collapse the rest, then scroll.
   *
   * @param domId - Target panel DOM id
   */
  function jumpTo(domId: string) {
    const item = jumpItems.find((entry) => entry.id === domId);
    if (item) openOnly(item.slug);
    requestAnimationFrame(() => scrollToSection(domId));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await onSave({
        course: {
          ...course,
          navItems: modules.stickyNav?.items ?? course.navItems,
        },
        modules,
      });
      setBaseline(JSON.stringify({ course, modules }));
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
          <h1 className="admin-title">{course.title}</h1>
          <p className="admin-subtitle">
            Online layout — document fields + hero/nav modules only.
          </p>
        </div>
        <a
          href={`/online-course/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview
        </a>
      </div>

      <div className="admin-editor-layout">
        <AdminSectionJumpNav
          items={jumpItems}
          activeId={activeSectionId}
          onJump={jumpTo}
        />

        <div className="admin-editor-sections">
          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("meta")}
              step={1}
              title="Page metadata"
              subtitle="SEO title, description, OG image — overrides site defaults when set"
              {...panelOpenProps("meta")}
            >
              <PageSeoFields
                value={modules.meta}
                onChange={(meta) => setModules({ ...modules, meta })}
              />
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <HeroModuleEditor
              hero={modules.hero}
              onChange={(hero) => setModules({ ...modules, hero })}
              panelId={panelId("hero")}
              step={2}
              {...panelOpenProps("hero")}
            />
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("basics")}
              step={3}
              title="Trust bar / basics"
              subtitle="Meta shown under hero"
              {...panelOpenProps("basics")}
            >
              <div className="admin-grid-2">
                <TextField
                  label="Duration"
                  value={course.duration}
                  onChange={(duration) => setCourse({ ...course, duration })}
                />
                <TextField
                  label="Level"
                  value={course.level}
                  onChange={(level) => setCourse({ ...course, level })}
                />
              </div>
              <div className="admin-grid-2">
                <TextField
                  label="Fee"
                  value={course.fee}
                  onChange={(fee) => setCourse({ ...course, fee })}
                />
                <TextField
                  label="Certification"
                  value={course.certification}
                  onChange={(certification) =>
                    setCourse({ ...course, certification })
                  }
                />
              </div>
              <ImageField
                label="Course image"
                value={course.image}
                onChange={(image) => setCourse({ ...course, image })}
              />
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <StickyNavModuleEditor
              items={modules.stickyNav.items}
              sectionId={modules.stickyNav._id}
              onSectionIdChange={(_id) =>
                setModules({
                  ...modules,
                  stickyNav: { ...modules.stickyNav, _id },
                })
              }
              onChange={(items) =>
                setModules({
                  ...modules,
                  stickyNav: { ...modules.stickyNav, items },
                })
              }
              panelId={panelId("sticky-nav")}
              step={4}
              {...panelOpenProps("sticky-nav")}
            />
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("overview")}
              step={5}
              title="Overview"
              {...panelOpenProps("overview")}
            >
              <TextField
                label="Title"
                value={course.title}
                onChange={(title) => setCourse({ ...course, title })}
              />
              <TextField
                label="Subtitle"
                value={course.subtitle}
                onChange={(subtitle) => setCourse({ ...course, subtitle })}
                multiline
              />
              <TextField
                label="Overview"
                value={course.overview}
                onChange={(overview) => setCourse({ ...course, overview })}
                multiline
                rows={10}
                hint="Full overview body — no length limit."
              />
              <StringListField
                label="Highlights"
                items={course.highlights}
                onChange={(highlights) => setCourse({ ...course, highlights })}
              />
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("inclusions")}
              step={6}
              title="Inclusions"
              {...panelOpenProps("inclusions")}
            >
              <StringListField
                label="Included"
                items={course.inclusions}
                onChange={(inclusions) => setCourse({ ...course, inclusions })}
              />
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("pricing")}
              step={7}
              title="Pricing"
              {...panelOpenProps("pricing")}
            >
              <TextField
                label="Pricing description"
                value={course.pricingDescription}
                onChange={(pricingDescription) =>
                  setCourse({ ...course, pricingDescription })
                }
                multiline
              />
              {course.pricing.map((opt, index) => (
                <div
                  key={pricingKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <TextField
                    label="Room / plan"
                    value={opt.roomType}
                    onChange={(roomType) => {
                      const pricing = [...course.pricing];
                      pricing[index] = { ...opt, roomType };
                      setCourse({ ...course, pricing });
                    }}
                  />
                  <div className="admin-grid-2">
                    <TextField
                      label="Price"
                      value={opt.price}
                      onChange={(price) => {
                        const pricing = [...course.pricing];
                        pricing[index] = { ...opt, price };
                        setCourse({ ...course, pricing });
                      }}
                    />
                    <TextField
                      label="Original price"
                      value={opt.originalPrice ?? ""}
                      onChange={(originalPrice) => {
                        const pricing = [...course.pricing];
                        pricing[index] = { ...opt, originalPrice };
                        setCourse({ ...course, pricing });
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="admin-grid-2">
                <TextField
                  label="Primary CTA"
                  value={course.ctaPrimary}
                  onChange={(ctaPrimary) =>
                    setCourse({ ...course, ctaPrimary })
                  }
                />
                <TextField
                  label="Primary href"
                  value={course.ctaPrimaryHref}
                  onChange={(ctaPrimaryHref) =>
                    setCourse({ ...course, ctaPrimaryHref })
                  }
                />
              </div>
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("curriculum")}
              step={8}
              title="Curriculum"
              {...panelOpenProps("curriculum")}
            >
              <TextField
                label="Description"
                value={course.syllabusDescription}
                onChange={(syllabusDescription) =>
                  setCourse({ ...course, syllabusDescription })
                }
                multiline
              />
              {course.syllabus.map((chapter, index) => (
                <div
                  key={syllabusKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <TextField
                    label="Chapter title"
                    value={chapter.title}
                    onChange={(title) => {
                      const syllabus = [...course.syllabus];
                      syllabus[index] = { ...chapter, title };
                      setCourse({ ...course, syllabus });
                    }}
                  />
                  <StringListField
                    label="Topics"
                    items={chapter.subtopics ?? []}
                    onChange={(subtopics) => {
                      const syllabus = [...course.syllabus];
                      syllabus[index] = { ...chapter, subtopics };
                      setCourse({ ...course, syllabus });
                    }}
                  />
                </div>
              ))}
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("teachers")}
              step={9}
              title="Teachers"
              subtitle={`${course.teachers.length} selected from faculty`}
              description="Pick faculty from the Teachers data store. Profiles are edited under Teachers."
              {...panelOpenProps("teachers")}
            >
              <TeachersPicker
                selectedSlugs={selectedTeacherSlugs}
                onChange={(_slugs, people) =>
                  setCourse({
                    ...course,
                    teachers: people.map((person) => ({
                      name: person.name,
                      experienceSummary: person.summary ?? "",
                      image: person.image ?? "",
                      bio: person.bio ?? "",
                      education: person.education ?? [],
                      detailedExperience: person.experience ?? [],
                      expertise: person.expertise ?? [],
                    })),
                  })
                }
              />
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("testimonials")}
              step={10}
              title="Testimonials"
              {...panelOpenProps("testimonials")}
            >
              {course.testimonials.map((item, index) => (
                <div
                  key={testimonialKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <TextField
                    label="Name"
                    value={item.name}
                    onChange={(name) => {
                      const testimonials = [...course.testimonials];
                      testimonials[index] = { ...item, name };
                      setCourse({ ...course, testimonials });
                    }}
                  />
                  <TextField
                    label="Quote"
                    value={item.quote}
                    onChange={(quote) => {
                      const testimonials = [...course.testimonials];
                      testimonials[index] = { ...item, quote };
                      setCourse({ ...course, testimonials });
                    }}
                    multiline
                  />
                </div>
              ))}
            </CollapsiblePanel>
          </div>

          <div className="admin-section-shell">
            <CollapsiblePanel
              id={panelId("faq")}
              step={11}
              title="FAQ"
              {...panelOpenProps("faq")}
            >
              {course.faqs.map((faq, index) => (
                <div key={faqKeys.keys[index]} className="admin-nested-card">
                  <TextField
                    label="Question"
                    value={faq.question}
                    onChange={(question) => {
                      const faqs = [...course.faqs];
                      faqs[index] = { ...faq, question };
                      setCourse({ ...course, faqs });
                    }}
                  />
                  <TextField
                    label="Answer"
                    value={faq.answer}
                    onChange={(answer) => {
                      const faqs = [...course.faqs];
                      faqs[index] = { ...faq, answer };
                      setCourse({ ...course, faqs });
                    }}
                    multiline
                  />
                </div>
              ))}
            </CollapsiblePanel>
          </div>
        </div>
      </div>

      <AdminSaveBar
        title={course.title}
        subtitle={slug}
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref={`/online-course/${slug}`}
      />
    </div>
  );
}
