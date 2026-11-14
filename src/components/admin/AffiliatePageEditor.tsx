"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { FaqItemsEditor } from "@/components/admin/FaqItemsEditor";
import { ImageField } from "@/components/admin/ImageField";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { TextField } from "@/components/admin/TextField";
import type {
  AffiliatePageContent,
  AffiliateStep,
  AffiliateStepIconKey,
} from "@/content/types/dedicated-pages";

type AffiliatePageEditorProps = {
  initial: AffiliatePageContent;
  onSave: (doc: AffiliatePageContent) => Promise<void>;
  backHref?: string;
  backLabel?: string;
};

const ICONS: { value: AffiliateStepIconKey; label: string }[] = [
  { value: "user", label: "Person (sign up)" },
  { value: "link", label: "Link" },
  { value: "code", label: "# Code" },
  { value: "share", label: "Share / send" },
  { value: "users", label: "Group (refer)" },
  { value: "wallet", label: "Wallet (earn)" },
];

/**
 * Edits a list of strings as one item per line.
 */
function LinesField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
}) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <TextField
      label={label}
      value={text}
      multiline
      rows={Math.max(3, value.length + 1)}
      hint={hint ?? "One per line"}
      onChange={(next) => {
        setText(next);
        onChange(
          next
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

/**
 * Up / down / remove controls for a list row.
 */
function RowActions({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  length: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="admin-affiliate-row-actions">
      <button
        type="button"
        className="admin-btn-sm admin-btn-sm--ghost"
        disabled={index === 0}
        aria-label="Move up"
        onClick={() => onMove(index, index - 1)}
      >
        ↑
      </button>
      <button
        type="button"
        className="admin-btn-sm admin-btn-sm--ghost"
        disabled={index === length - 1}
        aria-label="Move down"
        onClick={() => onMove(index, index + 1)}
      >
        ↓
      </button>
      <button
        type="button"
        className="admin-btn-sm admin-btn-sm--danger"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}

/**
 * Moves one array item.
 */
function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Admin editor for `/become-an-affiliate` content_data.
 *
 * @param props - Initial document and save handler
 */
export function AffiliatePageEditor({
  initial,
  onSave,
  backHref = "/admin/sections/other",
  backLabel = "Other pages",
}: AffiliatePageEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;

  function patch<K extends keyof AffiliatePageContent>(
    key: K,
    value: AffiliatePageContent[K],
  ) {
    setDoc((current) => ({ ...current, [key]: value }));
  }

  function patchTrack(
    index: number,
    next: Partial<AffiliatePageContent["tracks"][number]>,
  ) {
    patch(
      "tracks",
      doc.tracks.map((track, i) =>
        i === index ? { ...track, ...next } : track,
      ),
    );
  }

  function patchStep(
    trackIndex: number,
    stepIndex: number,
    next: Partial<AffiliateStep>,
  ) {
    const track = doc.tracks[trackIndex];
    patchTrack(trackIndex, {
      steps: track.steps.map((step, i) =>
        i === stepIndex ? { ...step, ...next } : step,
      ),
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
          <h1 className="admin-title">Become an Affiliate</h1>
          <p className="admin-subtitle">
            Commission, how-it-works steps, earnings calculator, benefits, FAQs
            and the sign-up form. Sign-ups arrive in Leads as “Affiliate
            sign-up”.
          </p>
        </div>
        <a
          href="/become-an-affiliate"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview page
        </a>
      </div>

      <div className="admin-editor-sections">
        <CollapsiblePanel
          id="affiliate-meta"
          title="Page metadata"
          subtitle="SEO title, description, OG image"
        >
          <PageSeoFields
            value={doc.meta}
            onChange={(meta) => patch("meta", meta)}
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          id="affiliate-hero"
          title="Hero & commission"
          subtitle="Headline, buttons, chips and highlight figures"
          defaultOpen
        >
          <div className="admin-field">
            <label className="admin-label" htmlFor="affiliate-rate">
              Commission (%)
            </label>
            <input
              id="affiliate-rate"
              className="admin-input admin-input--compact"
              type="number"
              min={1}
              max={100}
              step={0.5}
              value={doc.commissionRate}
              onChange={(event) =>
                patch("commissionRate", Number(event.target.value) || 0)
              }
            />
            <p className="admin-hint admin-hint--tight">
              Used by the earnings calculator. Update the copy too if it
              mentions the rate.
            </p>
          </div>
          <ImageField
            label="Hero image"
            value={doc.hero.image}
            onChange={(image) => patch("hero", { ...doc.hero, image })}
          />
          <TextField
            label="Eyebrow"
            value={doc.hero.eyebrow}
            onChange={(eyebrow) => patch("hero", { ...doc.hero, eyebrow })}
          />
          <TextField
            label="Title"
            value={doc.hero.title}
            onChange={(title) => patch("hero", { ...doc.hero, title })}
          />
          <TextField
            label="Lead"
            value={doc.hero.lead}
            multiline
            rows={3}
            onChange={(lead) => patch("hero", { ...doc.hero, lead })}
          />
          <TextField
            label="Primary button (scrolls to sign-up)"
            value={doc.hero.primaryCtaLabel}
            onChange={(primaryCtaLabel) =>
              patch("hero", { ...doc.hero, primaryCtaLabel })
            }
          />
          <TextField
            label="Secondary button (scrolls to how it works)"
            value={doc.hero.secondaryCtaLabel}
            onChange={(secondaryCtaLabel) =>
              patch("hero", { ...doc.hero, secondaryCtaLabel })
            }
          />
          <LinesField
            label="Chips"
            value={doc.hero.chips}
            onChange={(chips) => patch("hero", { ...doc.hero, chips })}
          />
          <div className="admin-nested-list-head">
            <span className="admin-label">Highlight figures</span>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() =>
                patch("stats", [...doc.stats, { value: "", label: "" }])
              }
            >
              Add figure
            </button>
          </div>
          {doc.stats.map((stat, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id
            <div key={index} className="admin-nested-card">
              <div className="admin-affiliate-pair">
                <TextField
                  label="Value"
                  value={stat.value}
                  placeholder="10%"
                  onChange={(value) =>
                    patch(
                      "stats",
                      doc.stats.map((s, i) =>
                        i === index ? { ...s, value } : s,
                      ),
                    )
                  }
                />
                <TextField
                  label="Label"
                  value={stat.label}
                  placeholder="Commission"
                  onChange={(label) =>
                    patch(
                      "stats",
                      doc.stats.map((s, i) =>
                        i === index ? { ...s, label } : s,
                      ),
                    )
                  }
                />
              </div>
              <RowActions
                index={index}
                length={doc.stats.length}
                onMove={(from, to) => patch("stats", move(doc.stats, from, to))}
                onRemove={() =>
                  patch(
                    "stats",
                    doc.stats.filter((_, i) => i !== index),
                  )
                }
              />
            </div>
          ))}
        </CollapsiblePanel>

        <CollapsiblePanel
          id="affiliate-tracks"
          title="How it works"
          subtitle="One block per referral type (online, in person), each with its steps"
        >
          <SectionLiveField
            id="affiliate-tracks-live"
            value={doc.tracksSection.live}
            onChange={(live) =>
              patch("tracksSection", { ...doc.tracksSection, live })
            }
          />
          <TextField
            label="Eyebrow"
            value={doc.tracksSection.eyebrow}
            onChange={(eyebrow) =>
              patch("tracksSection", { ...doc.tracksSection, eyebrow })
            }
          />
          <TextField
            label="Title"
            value={doc.tracksSection.title}
            onChange={(title) =>
              patch("tracksSection", { ...doc.tracksSection, title })
            }
          />
          <TextField
            label="Lead"
            value={doc.tracksSection.lead}
            multiline
            rows={2}
            onChange={(lead) =>
              patch("tracksSection", { ...doc.tracksSection, lead })
            }
          />
          <div className="admin-nested-list-head">
            <span className="admin-label">Blocks</span>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() =>
                patch("tracks", [
                  ...doc.tracks,
                  {
                    id: `track-${Date.now().toString(36)}`,
                    label: "",
                    title: "",
                    description: "",
                    steps: [],
                  },
                ])
              }
            >
              Add block
            </button>
          </div>
          {doc.tracks.map((track, trackIndex) => (
            <div key={track.id} className="admin-nested-card">
              <TextField
                label="Block heading"
                value={track.label}
                placeholder="Online Courses"
                onChange={(label) => patchTrack(trackIndex, { label })}
              />
              <TextField
                label="Subheading"
                value={track.title}
                onChange={(title) => patchTrack(trackIndex, { title })}
              />
              <TextField
                label="Description"
                value={track.description}
                multiline
                rows={2}
                onChange={(description) =>
                  patchTrack(trackIndex, { description })
                }
              />
              <div className="admin-nested-list-head">
                <span className="admin-label">Steps</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() =>
                    patchTrack(trackIndex, {
                      steps: [
                        ...track.steps,
                        { title: "", body: "", iconKey: "user" },
                      ],
                    })
                  }
                >
                  Add step
                </button>
              </div>
              {track.steps.map((step, stepIndex) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id
                  key={stepIndex}
                  className="admin-affiliate-step"
                >
                  <span className="admin-affiliate-step__num">
                    {stepIndex + 1}
                  </span>
                  <div className="admin-affiliate-step__fields">
                    <div className="admin-affiliate-pair">
                      <TextField
                        label="Step title"
                        value={step.title}
                        onChange={(title) =>
                          patchStep(trackIndex, stepIndex, { title })
                        }
                      />
                      <div className="admin-field">
                        <label
                          className="admin-label"
                          htmlFor={`affiliate-icon-${track.id}-${stepIndex}`}
                        >
                          Icon
                        </label>
                        <select
                          id={`affiliate-icon-${track.id}-${stepIndex}`}
                          className="admin-input admin-select"
                          value={step.iconKey}
                          onChange={(event) =>
                            patchStep(trackIndex, stepIndex, {
                              iconKey: event.target
                                .value as AffiliateStepIconKey,
                            })
                          }
                        >
                          {ICONS.map((icon) => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <TextField
                      label="Step text"
                      value={step.body}
                      multiline
                      rows={2}
                      onChange={(body) =>
                        patchStep(trackIndex, stepIndex, { body })
                      }
                    />
                    <RowActions
                      index={stepIndex}
                      length={track.steps.length}
                      onMove={(from, to) =>
                        patchTrack(trackIndex, {
                          steps: move(track.steps, from, to),
                        })
                      }
                      onRemove={() =>
                        patchTrack(trackIndex, {
                          steps: track.steps.filter((_, i) => i !== stepIndex),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
              <RowActions
                index={trackIndex}
                length={doc.tracks.length}
                onMove={(from, to) =>
                  patch("tracks", move(doc.tracks, from, to))
                }
                onRemove={() =>
                  patch(
                    "tracks",
                    doc.tracks.filter((_, i) => i !== trackIndex),
                  )
                }
              />
            </div>
          ))}
        </CollapsiblePanel>

        <CollapsiblePanel
          id="affiliate-calculator"
          title="Earnings calculator"
          subtitle="Courses and fees visitors can pick from"
        >
          <SectionLiveField
            id="affiliate-calculator-live"
            value={doc.calculator.live}
            onChange={(live) =>
              patch("calculator", { ...doc.calculator, live })
            }
          />
          <TextField
            label="Eyebrow"
            value={doc.calculator.eyebrow}
            onChange={(eyebrow) =>
              patch("calculator", { ...doc.calculator, eyebrow })
            }
          />
          <TextField
            label="Title"
            value={doc.calculator.title}
            onChange={(title) =>
              patch("calculator", { ...doc.calculator, title })
            }
          />
          <TextField
            label="Lead"
            value={doc.calculator.lead}
            multiline
            rows={2}
            onChange={(lead) =>
              patch("calculator", { ...doc.calculator, lead })
            }
          />
          <TextField
            label="Small print"
            value={doc.calculator.note}
            multiline
            rows={2}
            onChange={(note) =>
              patch("calculator", { ...doc.calculator, note })
            }
          />
          <div className="admin-nested-list-head">
            <span className="admin-label">Courses</span>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() =>
                patch("calculator", {
                  ...doc.calculator,
                  programs: [
                    ...doc.calculator.programs,
                    { label: "", feeUsd: 0 },
                  ],
                })
              }
            >
              Add course
            </button>
          </div>
          {doc.calculator.programs.map((program, index) => {
            const programs = doc.calculator.programs;
            const setPrograms = (next: typeof programs) =>
              patch("calculator", { ...doc.calculator, programs: next });
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id
              <div key={index} className="admin-nested-card">
                <div className="admin-affiliate-pair">
                  <TextField
                    label="Course"
                    value={program.label}
                    onChange={(label) =>
                      setPrograms(
                        programs.map((p, i) =>
                          i === index ? { ...p, label } : p,
                        ),
                      )
                    }
                  />
                  <TextField
                    label="Fee (USD)"
                    value={String(program.feeUsd || "")}
                    onChange={(fee) =>
                      setPrograms(
                        programs.map((p, i) =>
                          i === index
                            ? {
                                ...p,
                                feeUsd: Math.max(0, Number(fee) || 0),
                              }
                            : p,
                        ),
                      )
                    }
                  />
                </div>
                <RowActions
                  index={index}
                  length={programs.length}
                  onMove={(from, to) => setPrograms(move(programs, from, to))}
                  onRemove={() =>
                    setPrograms(programs.filter((_, i) => i !== index))
                  }
                />
              </div>
            );
          })}
        </CollapsiblePanel>

        <CollapsiblePanel
          id="affiliate-benefits"
          title="Why join"
          subtitle="Numbered benefit cards"
        >
          <SectionLiveField
            id="affiliate-benefits-live"
            value={doc.benefitsSection.live}
            onChange={(live) =>
              patch("benefitsSection", { ...doc.benefitsSection, live })
            }
          />
          <TextField
            label="Eyebrow"
            value={doc.benefitsSection.eyebrow}
            onChange={(eyebrow) =>
              patch("benefitsSection", { ...doc.benefitsSection, eyebrow })
            }
          />
          <TextField
            label="Title"
            value={doc.benefitsSection.title}
            onChange={(title) =>
              patch("benefitsSection", { ...doc.benefitsSection, title })
            }
          />
          <TextField
            label="Lead"
            value={doc.benefitsSection.lead}
            multiline
            rows={2}
            onChange={(lead) =>
              patch("benefitsSection", { ...doc.benefitsSection, lead })
            }
          />
          <div className="admin-nested-list-head">
            <span className="admin-label">Benefits</span>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() =>
                patch("benefits", [...doc.benefits, { title: "", body: "" }])
              }
            >
              Add benefit
            </button>
          </div>
          {doc.benefits.map((benefit, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id
            <div key={index} className="admin-nested-card">
              <TextField
                label="Title"
                value={benefit.title}
                onChange={(title) =>
                  patch(
                    "benefits",
                    doc.benefits.map((b, i) =>
                      i === index ? { ...b, title } : b,
                    ),
                  )
                }
              />
              <TextField
                label="Text"
                value={benefit.body}
                multiline
                rows={3}
                onChange={(body) =>
                  patch(
                    "benefits",
                    doc.benefits.map((b, i) =>
                      i === index ? { ...b, body } : b,
                    ),
                  )
                }
              />
              <RowActions
                index={index}
                length={doc.benefits.length}
                onMove={(from, to) =>
                  patch("benefits", move(doc.benefits, from, to))
                }
                onRemove={() =>
                  patch(
                    "benefits",
                    doc.benefits.filter((_, i) => i !== index),
                  )
                }
              />
            </div>
          ))}
        </CollapsiblePanel>

        <CollapsiblePanel
          id="affiliate-reviews"
          title="Reviews"
          subtitle="Shows your shared Google / platform reviews"
        >
          <SectionLiveField
            id="affiliate-reviews-live"
            value={doc.reviews.live}
            onChange={(live) => patch("reviews", { ...doc.reviews, live })}
          />
          <TextField
            label="Eyebrow"
            value={doc.reviews.eyebrow}
            onChange={(eyebrow) =>
              patch("reviews", { ...doc.reviews, eyebrow })
            }
          />
          <TextField
            label="Title"
            value={doc.reviews.title}
            onChange={(title) => patch("reviews", { ...doc.reviews, title })}
          />
          <TextField
            label="Description"
            value={doc.reviews.description}
            multiline
            rows={2}
            onChange={(description) =>
              patch("reviews", { ...doc.reviews, description })
            }
          />
          <p className="admin-hint admin-hint--tight">
            Review cards come from Shared sections → Reviews.
          </p>
        </CollapsiblePanel>

        <CollapsiblePanel
          id="affiliate-faqs"
          title="FAQs"
          subtitle="Questions about the programme"
        >
          <SectionLiveField
            id="affiliate-faqs-live"
            value={doc.faqsSection.live}
            onChange={(live) =>
              patch("faqsSection", { ...doc.faqsSection, live })
            }
          />
          <TextField
            label="Eyebrow"
            value={doc.faqsSection.eyebrow}
            onChange={(eyebrow) =>
              patch("faqsSection", { ...doc.faqsSection, eyebrow })
            }
          />
          <TextField
            label="Title"
            value={doc.faqsSection.title}
            onChange={(title) =>
              patch("faqsSection", { ...doc.faqsSection, title })
            }
          />
          <FaqItemsEditor
            items={doc.faqs}
            idPrefix="affiliate-faq"
            onChange={(faqs) => patch("faqs", faqs)}
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          id="affiliate-form"
          title="Sign-up form"
          subtitle="Copy around the form and the thank-you message"
        >
          <TextField
            label="Eyebrow"
            value={doc.form.eyebrow}
            onChange={(eyebrow) => patch("form", { ...doc.form, eyebrow })}
          />
          <TextField
            label="Title"
            value={doc.form.title}
            onChange={(title) => patch("form", { ...doc.form, title })}
          />
          <TextField
            label="Lead"
            value={doc.form.lead}
            multiline
            rows={3}
            onChange={(lead) => patch("form", { ...doc.form, lead })}
          />
          <TextField
            label="Submit button"
            value={doc.form.submitLabel}
            onChange={(submitLabel) =>
              patch("form", { ...doc.form, submitLabel })
            }
          />
          <TextField
            label="Thank-you title"
            value={doc.form.successTitle}
            onChange={(successTitle) =>
              patch("form", { ...doc.form, successTitle })
            }
          />
          <TextField
            label="Thank-you message"
            value={doc.form.successBody}
            multiline
            rows={2}
            onChange={(successBody) =>
              patch("form", { ...doc.form, successBody })
            }
          />
          <LinesField
            label="“Where will you promote us?” options"
            value={doc.form.platforms}
            onChange={(platforms) => patch("form", { ...doc.form, platforms })}
          />
        </CollapsiblePanel>
      </div>

      <AdminSaveBar
        title="Become an Affiliate"
        subtitle="content_data"
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/become-an-affiliate"
      />
    </div>
  );
}
