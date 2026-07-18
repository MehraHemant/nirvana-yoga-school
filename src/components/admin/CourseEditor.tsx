"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { pagePath } from "@/content/pages/path";
import { getPageRef } from "@/content/pages/registry";
import type { CourseDocument } from "@/content/types";
import { AdminSaveBar } from "./AdminSaveBar";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { StringListField } from "./StringListField";
import { TextField } from "./TextField";
import { useStableListKeys } from "./useStableListKeys";

type CourseEditorProps = {
  initial: CourseDocument;
  onSave: (doc: CourseDocument) => Promise<void>;
};

/**
 * Structured editor for residential / online course documents.
 *
 * @param props - Initial course document and persist handler
 */
export function CourseEditor({ initial, onSave }: CourseEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const pricingKeys = useStableListKeys(doc.pricing.length);
  const syllabusKeys = useStableListKeys(doc.syllabus.length);
  const scheduleKeys = useStableListKeys(doc.schedule.length);
  const faqKeys = useStableListKeys(doc.faqs.length);

  const previewHref = useMemo(() => {
    const ref = getPageRef(doc.slug);
    return ref ? pagePath(ref) : `/course/${doc.slug}`;
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

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <Link href="/admin/sections/courses" className="admin-back-link">
          ← Courses
        </Link>
        <h1 className="admin-title">{doc.title}</h1>
        <p className="admin-subtitle">{doc.slug}</p>
      </div>

      <CollapsiblePanel title="Hero & basics" defaultOpen>
        <TextField
          label="Title"
          value={doc.title}
          onChange={(title) => setDoc({ ...doc, title })}
        />
        <TextField
          label="Subtitle"
          value={doc.subtitle}
          onChange={(subtitle) => setDoc({ ...doc, subtitle })}
          multiline
        />
        <div className="admin-grid-2">
          <TextField
            label="Duration"
            value={doc.duration}
            onChange={(duration) => setDoc({ ...doc, duration })}
          />
          <TextField
            label="Level"
            value={doc.level}
            onChange={(level) => setDoc({ ...doc, level })}
          />
        </div>
        <div className="admin-grid-2">
          <TextField
            label="Fee label"
            value={doc.fee}
            onChange={(fee) => setDoc({ ...doc, fee })}
          />
          <TextField
            label="Certification"
            value={doc.certification}
            onChange={(certification) => setDoc({ ...doc, certification })}
          />
        </div>
        <ImageField
          label="Hero image"
          value={doc.image}
          onChange={(image) => setDoc({ ...doc, image })}
        />
        <ImageField
          label="Certification badge"
          value={doc.certBadge ?? ""}
          onChange={(certBadge) => setDoc({ ...doc, certBadge })}
        />
        <StringListField
          label="Hero gallery images"
          items={doc.heroImages ?? []}
          onChange={(heroImages) => setDoc({ ...doc, heroImages })}
          addLabel="Add hero image"
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Overview & highlights">
        <TextField
          label="Overview"
          value={doc.overview}
          onChange={(overview) => setDoc({ ...doc, overview })}
          multiline
          rows={8}
        />
        <StringListField
          label="Highlights"
          items={doc.highlights}
          onChange={(highlights) => setDoc({ ...doc, highlights })}
        />
        <StringListField
          label="Inclusions"
          items={doc.inclusions}
          onChange={(inclusions) => setDoc({ ...doc, inclusions })}
        />
      </CollapsiblePanel>

      <CollapsiblePanel title={`Pricing (${doc.pricing.length})`}>
        <TextField
          label="Pricing description"
          value={doc.pricingDescription}
          onChange={(pricingDescription) =>
            setDoc({ ...doc, pricingDescription })
          }
          multiline
        />
        {doc.pricing.map((option, index) => (
          <div key={pricingKeys.keys[index]} className="admin-nested-card">
            <div className="admin-grid-2">
              <TextField
                label="Price"
                value={option.price}
                onChange={(price) => {
                  const pricing = [...doc.pricing];
                  pricing[index] = { ...option, price };
                  setDoc({ ...doc, pricing });
                }}
              />
              <TextField
                label="Room type"
                value={option.roomType}
                onChange={(roomType) => {
                  const pricing = [...doc.pricing];
                  pricing[index] = { ...option, roomType };
                  setDoc({ ...doc, pricing });
                }}
              />
            </div>
            <TextField
              label="Description"
              value={option.description}
              onChange={(description) => {
                const pricing = [...doc.pricing];
                pricing[index] = { ...option, description };
                setDoc({ ...doc, pricing });
              }}
              multiline
            />
            <StringListField
              label="Features"
              items={option.features}
              onChange={(features) => {
                const pricing = [...doc.pricing];
                pricing[index] = { ...option, features };
                setDoc({ ...doc, pricing });
              }}
            />
            <ImageField
              label="Room image"
              value={option.image ?? ""}
              onChange={(image) => {
                const pricing = [...doc.pricing];
                pricing[index] = { ...option, image };
                setDoc({ ...doc, pricing });
              }}
            />
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => {
                pricingKeys.removeKey(index);
                setDoc({
                  ...doc,
                  pricing: doc.pricing.filter((_, i) => i !== index),
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
            pricingKeys.addKey();
            setDoc({
              ...doc,
              pricing: [
                ...doc.pricing,
                {
                  roomType: "",
                  price: "",
                  description: "",
                  features: [],
                },
              ],
            });
          }}
        >
          Add pricing option
        </button>
      </CollapsiblePanel>

      <CollapsiblePanel title={`Syllabus (${doc.syllabus.length} chapters)`}>
        <TextField
          label="Syllabus intro"
          value={doc.syllabusDescription}
          onChange={(syllabusDescription) =>
            setDoc({ ...doc, syllabusDescription })
          }
          multiline
        />
        {doc.syllabus.map((chapter, index) => (
          <div key={syllabusKeys.keys[index]} className="admin-nested-card">
            <TextField
              label="Chapter title"
              value={chapter.title}
              onChange={(title) => {
                const syllabus = [...doc.syllabus];
                syllabus[index] = { ...chapter, title };
                setDoc({ ...doc, syllabus });
              }}
            />
            <TextField
              label="Description"
              value={chapter.description}
              onChange={(description) => {
                const syllabus = [...doc.syllabus];
                syllabus[index] = { ...chapter, description };
                setDoc({ ...doc, syllabus });
              }}
              multiline
            />
            <StringListField
              label="Subtopics"
              items={chapter.subtopics}
              onChange={(subtopics) => {
                const syllabus = [...doc.syllabus];
                syllabus[index] = { ...chapter, subtopics };
                setDoc({ ...doc, syllabus });
              }}
            />
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => {
                syllabusKeys.removeKey(index);
                setDoc({
                  ...doc,
                  syllabus: doc.syllabus.filter((_, i) => i !== index),
                });
              }}
            >
              Remove chapter
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-btn-sm"
          onClick={() => {
            syllabusKeys.addKey();
            setDoc({
              ...doc,
              syllabus: [
                ...doc.syllabus,
                { title: "New chapter", description: "", subtopics: [] },
              ],
            });
          }}
        >
          Add chapter
        </button>
      </CollapsiblePanel>

      <CollapsiblePanel title={`Daily schedule (${doc.schedule.length})`}>
        <TextField
          label="Schedule description"
          value={doc.scheduleDescription}
          onChange={(scheduleDescription) =>
            setDoc({ ...doc, scheduleDescription })
          }
          multiline
        />
        {doc.schedule.map((item, index) => (
          <div key={scheduleKeys.keys[index]} className="admin-nested-card">
            <div className="admin-grid-2">
              <TextField
                label="Time"
                value={item.time}
                onChange={(time) => {
                  const schedule = [...doc.schedule];
                  schedule[index] = { ...item, time };
                  setDoc({ ...doc, schedule });
                }}
              />
              <TextField
                label="Activity"
                value={item.activity}
                onChange={(activity) => {
                  const schedule = [...doc.schedule];
                  schedule[index] = { ...item, activity };
                  setDoc({ ...doc, schedule });
                }}
              />
            </div>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => {
                scheduleKeys.removeKey(index);
                setDoc({
                  ...doc,
                  schedule: doc.schedule.filter((_, i) => i !== index),
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
            scheduleKeys.addKey();
            setDoc({
              ...doc,
              schedule: [...doc.schedule, { time: "", activity: "" }],
            });
          }}
        >
          Add schedule row
        </button>
      </CollapsiblePanel>

      <CollapsiblePanel title={`FAQs (${doc.faqs.length})`}>
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
              rows={4}
            />
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => {
                faqKeys.removeKey(index);
                setDoc({
                  ...doc,
                  faqs: doc.faqs.filter((_, i) => i !== index),
                });
              }}
            >
              Remove FAQ
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-btn-sm"
          onClick={() => {
            faqKeys.addKey();
            setDoc({
              ...doc,
              faqs: [...doc.faqs, { question: "", answer: "" }],
            });
          }}
        >
          Add FAQ
        </button>
      </CollapsiblePanel>

      <AdminSaveBar
        title={doc.title || "Course"}
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
