"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { HeroModuleEditor } from "@/components/admin/modules/HeroModuleEditor";
import { StickyNavModuleEditor } from "@/components/admin/modules/StickyNavModuleEditor";
import { createEmptyPageModules } from "@/content/page-modules-defaults";
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
  const [modules, setModules] = useState<PageModulesDocument>(() => {
    if (initialModules?.hero) return initialModules;
    const scaffold = createEmptyPageModules("split-copy");
    scaffold.hero = {
      ...scaffold.hero,
      type: "split-copy",
      title: initialCourse.title,
      subtitle: initialCourse.subtitle,
      previewType: "image",
      previewUrl: initialCourse.image || "",
    };
    scaffold.stickyNav = { items: initialCourse.navItems ?? [] };
    return scaffold;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const pricingKeys = useStableListKeys(course.pricing.length);
  const syllabusKeys = useStableListKeys(course.syllabus.length);
  const teacherKeys = useStableListKeys(course.teachers.length);
  const testimonialKeys = useStableListKeys(course.testimonials.length);
  const faqKeys = useStableListKeys(course.faqs.length);

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

      <CollapsiblePanel title="Trust bar / basics" subtitle="Meta shown under hero">
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
            onChange={(certification) => setCourse({ ...course, certification })}
          />
        </div>
        <ImageField
          label="Course image"
          value={course.image}
          onChange={(image) => setCourse({ ...course, image })}
        />
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
        />
        <StringListField
          label="Highlights"
          items={course.highlights}
          onChange={(highlights) => setCourse({ ...course, highlights })}
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Inclusions">
        <StringListField
          label="Included"
          items={course.inclusions}
          onChange={(inclusions) => setCourse({ ...course, inclusions })}
        />
        <StringListField
          label="Not included"
          items={course.exclusions}
          onChange={(exclusions) => setCourse({ ...course, exclusions })}
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Pricing">
        <TextField
          label="Pricing description"
          value={course.pricingDescription}
          onChange={(pricingDescription) =>
            setCourse({ ...course, pricingDescription })
          }
          multiline
        />
        {course.pricing.map((opt, index) => (
          <div key={pricingKeys.keys[index]} className="admin-nested-card">
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
            onChange={(ctaPrimary) => setCourse({ ...course, ctaPrimary })}
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

      <CollapsiblePanel title="Curriculum">
        <TextField
          label="Description"
          value={course.syllabusDescription}
          onChange={(syllabusDescription) =>
            setCourse({ ...course, syllabusDescription })
          }
          multiline
        />
        {course.syllabus.map((chapter, index) => (
          <div key={syllabusKeys.keys[index]} className="admin-nested-card">
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

      <CollapsiblePanel title="Teachers">
        {course.teachers.map((teacher, index) => (
          <div key={teacherKeys.keys[index]} className="admin-nested-card">
            <TextField
              label="Name"
              value={teacher.name}
              onChange={(name) => {
                const teachers = [...course.teachers];
                teachers[index] = { ...teacher, name };
                setCourse({ ...course, teachers });
              }}
            />
            <ImageField
              label="Photo"
              value={teacher.image}
              onChange={(image) => {
                const teachers = [...course.teachers];
                teachers[index] = { ...teacher, image };
                setCourse({ ...course, teachers });
              }}
            />
            <TextField
              label="Bio"
              value={teacher.bio}
              onChange={(bio) => {
                const teachers = [...course.teachers];
                teachers[index] = { ...teacher, bio };
                setCourse({ ...course, teachers });
              }}
              multiline
            />
          </div>
        ))}
      </CollapsiblePanel>

      <CollapsiblePanel title="Testimonials">
        {course.testimonials.map((item, index) => (
          <div key={testimonialKeys.keys[index]} className="admin-nested-card">
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

      <CollapsiblePanel title="FAQ">
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

      <AdminSaveBar
        title={course.title}
        subtitle={slug}
        saving={saving}
        saved={saved}
        dirty
        error={error}
        onSave={handleSave}
        previewHref={`/online-course/${slug}`}
      />
    </div>
  );
}
