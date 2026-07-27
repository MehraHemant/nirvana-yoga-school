"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { CoursesPicker } from "@/components/admin/CoursesPicker";
import { ImageField } from "@/components/admin/ImageField";
import { ImageListField } from "@/components/admin/ImageListField";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { SectionIdField } from "@/components/admin/SectionIdField";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { StringListField } from "@/components/admin/StringListField";
import { toSectionDomId } from "@/components/admin/sectionDomId";
import { TextField } from "@/components/admin/TextField";
import { useSectionScrollSpy } from "@/components/admin/useSectionScrollSpy";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { DEFAULT_YTT_HUB_NAV } from "@/content/mappers/ytt-hub";
import { normalizeYttHubCourseRefs } from "@/content/mappers/ytt-hub-courses";
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
  { slug: "flags", label: "Section flags", key: "flags" as const },
  { slug: "courses", label: "Courses", key: "courses" as const },
  { slug: "faq", label: "FAQ", key: "faq" as const },
  {
    slug: "legacy",
    label: "Legacy (demoted)",
    key: "legacy" as const,
  },
] as const;

type SectionIdKey = keyof NonNullable<YttHubContent["sectionIds"]>;
type FlagKey = keyof NonNullable<YttHubContent["flags"]>;

const EMPTY_HERO_VIDEO = {
  mobileSrc: "",
  mobilePoster: "",
  desktopSrc: "",
  desktopPoster: "",
};

/**
 * Resolves a section id object for admin panel DOM ids from `doc.sectionIds`.
 *
 * @param doc - Current YTT hub document
 * @param key - Section key in `sectionIds`
 */
function sectionIdRef(doc: YttHubContent, key: SectionIdKey): { _id?: string } {
  return { _id: doc.sectionIds?.[key] };
}

/**
 * Admin editor for the YTT hub page (`global_settings.yttHub`).
 *
 * @param props - Initial content and save handler
 */
/**
 * Normalizes hub course placements to entity refs for editing.
 *
 * @param hub - Raw YTT hub document from CMS
 */
function withNormalizedCourses(hub: YttHubContent): YttHubContent {
  return { ...hub, courses: normalizeYttHubCourseRefs(hub.courses) };
}

export function YttHubEditor({
  initial,
  onSave,
  backHref = "/admin/sections/other",
  backLabel = "Other pages",
}: YttHubEditorProps) {
  const [doc, setDoc] = useState(() => withNormalizedCourses(initial));
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(withNormalizedCourses(initial)),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;
  const faqKeys = useStableListKeys(doc.faqs.length);
  const navKeys = useStableListKeys(doc.nav.length);
  const statKeys = useStableListKeys(doc.intro.stats.length);
  const trustKeys = useStableListKeys(doc.intro.stats.length);
  const heroVideo = doc.heroVideo ?? EMPTY_HERO_VIDEO;
  const flags = doc.flags ?? {};

  const jumpItems = useMemo(() => {
    return YTT_HUB_JUMP_DEFS.map((def) => {
      if (def.key === "meta") {
        return { id: toSectionDomId(def.slug, doc.meta), label: def.label };
      }
      if (def.key === "flags" || def.key === "legacy") {
        return { id: toSectionDomId(def.slug), label: def.label };
      }
      return {
        id: toSectionDomId(def.slug, sectionIdRef(doc, def.key)),
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
    if (def.key === "meta") return toSectionDomId(def.slug, doc.meta);
    if (def.key === "flags" || def.key === "legacy") {
      return toSectionDomId(def.slug);
    }
    return toSectionDomId(def.slug, sectionIdRef(doc, def.key));
  }

  /** Patches one key on `doc.sectionIds`. */
  function patchSectionId(key: SectionIdKey, _id: string) {
    setDoc({
      ...doc,
      sectionIds: { ...doc.sectionIds, [key]: _id },
    });
  }

  /** Patches one hub inclusion flag. */
  function patchFlag(key: FlagKey, live: boolean) {
    setDoc({
      ...doc,
      flags: { ...doc.flags, [key]: live },
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload: YttHubContent = {
        ...doc,
        courses: normalizeYttHubCourseRefs(doc.courses),
      };
      await onSave(payload);
      setDoc(payload);
      setBaseline(JSON.stringify(payload));
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

          <CollapsiblePanel
            id={panelId("hero")}
            title="Hero"
            subtitle="Homepage-style video hero — use hub-only video URLs (not the home file)"
            defaultOpen
          >
            <SectionIdField
              fieldId="ytt-hub-hero-id"
              value={doc.sectionIds?.hero}
              onChange={(_id) => patchSectionId("hero", _id)}
            />
            <TextField
              label="Badge / pill"
              value={doc.intro.pill}
              onChange={(pill) =>
                setDoc({ ...doc, intro: { ...doc.intro, pill } })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Title lead"
                value={doc.intro.titleLead ?? doc.intro.title}
                onChange={(titleLead) =>
                  setDoc({
                    ...doc,
                    intro: { ...doc.intro, titleLead, title: titleLead },
                  })
                }
              />
              <TextField
                label="Title accent"
                value={doc.intro.titleAccent ?? ""}
                onChange={(titleAccent) =>
                  setDoc({ ...doc, intro: { ...doc.intro, titleAccent } })
                }
              />
            </div>
            <TextField
              label="Lead (legacy / overview fallback)"
              value={doc.intro.lead}
              onChange={(lead) =>
                setDoc({ ...doc, intro: { ...doc.intro, lead } })
              }
              multiline
            />
            <div className="admin-grid-2">
              <TextField
                label="Primary CTA label"
                value={doc.intro.primaryCtaLabel ?? ""}
                onChange={(primaryCtaLabel) =>
                  setDoc({ ...doc, intro: { ...doc.intro, primaryCtaLabel } })
                }
              />
              <TextField
                label="Primary CTA href"
                value={doc.intro.primaryCtaHref ?? ""}
                onChange={(primaryCtaHref) =>
                  setDoc({ ...doc, intro: { ...doc.intro, primaryCtaHref } })
                }
              />
            </div>
            <StringListField
              label="Marquee items"
              items={doc.intro.marqueeItems ?? []}
              onChange={(marqueeItems) =>
                setDoc({ ...doc, intro: { ...doc.intro, marqueeItems } })
              }
            />
            <ImageField
              label="Poster / still fallback"
              value={doc.heroImage}
              onChange={(heroImage) => setDoc({ ...doc, heroImage })}
            />
            <div className="admin-nested-card">
              <strong>Background video (hub-only)</strong>
              <p className="admin-hint">
                Separate from homepage hero video. Leave src empty to show the
                poster still only.
              </p>
              <div className="admin-grid-2">
                <TextField
                  label="Mobile src"
                  value={heroVideo.mobileSrc}
                  onChange={(mobileSrc) =>
                    setDoc({
                      ...doc,
                      heroVideo: { ...heroVideo, mobileSrc },
                    })
                  }
                />
                <TextField
                  label="Mobile poster"
                  value={heroVideo.mobilePoster}
                  onChange={(mobilePoster) =>
                    setDoc({
                      ...doc,
                      heroVideo: { ...heroVideo, mobilePoster },
                    })
                  }
                />
              </div>
              <div className="admin-grid-2">
                <TextField
                  label="Desktop src"
                  value={heroVideo.desktopSrc}
                  onChange={(desktopSrc) =>
                    setDoc({
                      ...doc,
                      heroVideo: { ...heroVideo, desktopSrc },
                    })
                  }
                />
                <TextField
                  label="Desktop poster"
                  value={heroVideo.desktopPoster}
                  onChange={(desktopPoster) =>
                    setDoc({
                      ...doc,
                      heroVideo: { ...heroVideo, desktopPoster },
                    })
                  }
                />
              </div>
            </div>
            <div className="admin-field">
              <p className="admin-label">Mobile trust chips / rotating stats</p>
              {doc.intro.stats.map((stat, index) => (
                <div key={trustKeys.keys[index]} className="admin-nested-card">
                  <div className="admin-grid-2">
                    <TextField
                      label="Value"
                      value={stat.value}
                      onChange={(value) => {
                        const stats = [...doc.intro.stats];
                        stats[index] = { ...stat, value };
                        setDoc({ ...doc, intro: { ...doc.intro, stats } });
                      }}
                    />
                    <TextField
                      label="Label"
                      value={stat.label}
                      onChange={(label) => {
                        const stats = [...doc.intro.stats];
                        stats[index] = { ...stat, label };
                        setDoc({ ...doc, intro: { ...doc.intro, stats } });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => {
                      trustKeys.removeKey(index);
                      statKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        intro: {
                          ...doc.intro,
                          stats: doc.intro.stats.filter((_, i) => i !== index),
                        },
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
                  trustKeys.addKey();
                  statKeys.addKey();
                  setDoc({
                    ...doc,
                    intro: {
                      ...doc.intro,
                      stats: [...doc.intro.stats, { value: "", label: "" }],
                    },
                  });
                }}
              >
                Add chip / stat
              </button>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("sticky-nav")} title="Sticky nav">
            <SectionIdField
              fieldId="ytt-hub-sticky-nav-id"
              value={doc.sectionIds?.stickyNav}
              onChange={(_id) => patchSectionId("stickyNav", _id)}
            />
            <p className="admin-hint">
              Recommended order: Overview → Videos → Gallery → Certification →
              Courses → Why Nirvana → Teachers → Map → FAQ
            </p>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => setDoc({ ...doc, nav: [...DEFAULT_YTT_HUB_NAV] })}
            >
              Reset to default hub order
            </button>
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
                <TextField
                  label="Short label"
                  value={item.shortLabel}
                  onChange={(shortLabel) => {
                    const nav = [...doc.nav];
                    nav[index] = { ...item, shortLabel };
                    setDoc({ ...doc, nav });
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                navKeys.addKey();
                setDoc({
                  ...doc,
                  nav: [...doc.nav, { id: "#", label: "", shortLabel: "" }],
                });
              }}
            >
              Add nav item
            </button>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("overview")}
            title="Overview"
            subtitle="Homepage welcome/about treatment"
          >
            <SectionIdField
              fieldId="ytt-hub-overview-id"
              value={doc.sectionIds?.overview}
              onChange={(_id) => patchSectionId("overview", _id)}
            />
            <TextField
              label="Eyebrow"
              value={doc.intro.overviewEyebrow ?? ""}
              onChange={(overviewEyebrow) =>
                setDoc({ ...doc, intro: { ...doc.intro, overviewEyebrow } })
              }
            />
            <TextField
              label="Title"
              value={doc.intro.overviewTitle ?? ""}
              onChange={(overviewTitle) =>
                setDoc({ ...doc, intro: { ...doc.intro, overviewTitle } })
              }
            />
            <TextField
              label="Lead"
              value={doc.intro.overviewDescription ?? ""}
              onChange={(overviewDescription) =>
                setDoc({
                  ...doc,
                  intro: { ...doc.intro, overviewDescription },
                })
              }
              multiline
            />
            <TextField
              label="Body (legacy fallback)"
              value={doc.intro.overviewBody ?? ""}
              onChange={(overviewBody) =>
                setDoc({ ...doc, intro: { ...doc.intro, overviewBody } })
              }
              multiline
            />
            <div className="admin-grid-2">
              <TextField
                label="Vision label"
                value={doc.intro.vision?.label ?? ""}
                onChange={(label) =>
                  setDoc({
                    ...doc,
                    intro: {
                      ...doc.intro,
                      vision: {
                        label,
                        body: doc.intro.vision?.body ?? "",
                      },
                    },
                  })
                }
              />
              <TextField
                label="Vision body"
                value={doc.intro.vision?.body ?? ""}
                onChange={(body) =>
                  setDoc({
                    ...doc,
                    intro: {
                      ...doc.intro,
                      vision: {
                        label: doc.intro.vision?.label ?? "",
                        body,
                      },
                    },
                  })
                }
                multiline
              />
              <TextField
                label="Promise label"
                value={doc.intro.promise?.label ?? ""}
                onChange={(label) =>
                  setDoc({
                    ...doc,
                    intro: {
                      ...doc.intro,
                      promise: {
                        label,
                        body: doc.intro.promise?.body ?? "",
                      },
                    },
                  })
                }
              />
              <TextField
                label="Promise body"
                value={doc.intro.promise?.body ?? ""}
                onChange={(body) =>
                  setDoc({
                    ...doc,
                    intro: {
                      ...doc.intro,
                      promise: {
                        label: doc.intro.promise?.label ?? "",
                        body,
                      },
                    },
                  })
                }
                multiline
              />
            </div>
            <ImageField
              label="Overview image 1"
              value={doc.overviewImage}
              onChange={(overviewImage) => setDoc({ ...doc, overviewImage })}
            />
            <ImageField
              label="Overview image 2"
              value={doc.overviewInsetImage}
              onChange={(overviewInsetImage) =>
                setDoc({ ...doc, overviewInsetImage })
              }
            />
            <ImageField
              label="Overview image 3"
              value={doc.overviewThirdImage ?? ""}
              onChange={(overviewThirdImage) =>
                setDoc({ ...doc, overviewThirdImage })
              }
            />
            <StringListField
              label="Highlights"
              items={doc.intro.overviewPoints}
              onChange={(overviewPoints) =>
                setDoc({ ...doc, intro: { ...doc.intro, overviewPoints } })
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("flags")}
            title="Section flags & shared links"
            subtitle="Gate shared bands; edit content in the linked editors"
          >
            <ul className="admin-flags-list">
              {(
                [
                  ["showVideos", "Videos"],
                  ["showGallery", "Gallery"],
                  ["showExam", "Exam & certification"],
                  ["showWhyNirvana", "Why Nirvana"],
                  ["showTeachers", "Teachers"],
                  ["showMap", "Map"],
                ] as const
              ).map(([key, label]) => (
                <li key={key} className="admin-flags-row">
                  <span className="admin-flags-row__label">{label}</span>
                  <SectionLiveField
                    id={`ytt-hub-${key}`}
                    value={flags[key] !== false}
                    onChange={(live) => patchFlag(key, live)}
                  />
                </li>
              ))}
            </ul>
            <p className="admin-hint admin-editor-hint">
              Videos / gallery copy:{" "}
              <a href="/admin/pages/home" className="admin-link">
                Home sections
              </a>
              <br />
              Exam & certification:{" "}
              <a
                href="/admin/sections/shared#examCertification"
                className="admin-link"
              >
                Shared sections
              </a>
              <br />
              Why Nirvana:{" "}
              <a
                href="/admin/sections/shared#whyNirvana"
                className="admin-link"
              >
                Shared sections
              </a>
              <br />
              Teachers:{" "}
              <a href="/admin/sections/teachers" className="admin-link">
                Teachers
              </a>
              <br />
              Map:{" "}
              <a href="/admin/sections/shared#siteMap" className="admin-link">
                Shared map
              </a>
            </p>
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("courses")} title="Courses">
            <SectionIdField
              fieldId="ytt-hub-courses-id"
              value={doc.sectionIds?.courses}
              onChange={(_id) => patchSectionId("courses", _id)}
            />
            <TextField
              label="Eyebrow"
              value={doc.coursesIntro.eyebrow ?? ""}
              onChange={(eyebrow) =>
                setDoc({
                  ...doc,
                  coursesIntro: { ...doc.coursesIntro, eyebrow },
                })
              }
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
            <CoursesPicker
              value={normalizeYttHubCourseRefs(doc.courses)}
              onChange={(courses) => setDoc({ ...doc, courses })}
              types={["course"]}
              hint="Select residential course pages. Title, fee, image, duration, and highlights come from each course; optional description overrides the overview on this hub only. Legacy embedded cards map via course URL on load."
            />
          </CollapsiblePanel>

          <CollapsiblePanel id={panelId("faq")} title="FAQ">
            <SectionIdField
              fieldId="ytt-hub-faq-id"
              value={doc.sectionIds?.faq}
              onChange={(_id) => patchSectionId("faq", _id)}
            />
            {doc.faqs.map((faq, index) => (
              <div key={faqKeys.keys[index]} className="admin-nested-card">
                <div className="admin-nested-card-header">
                  <span className="admin-nested-card-title">
                    FAQ {index + 1}
                  </span>
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => {
                      faqKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        faqs: doc.faqs.filter((_, i) => i !== index),
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
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

          <CollapsiblePanel
            id={panelId("legacy")}
            title="Legacy (demoted)"
            subtitle="Kept in CMS only — not rendered on the live hub order"
          >
            <SectionIdField
              fieldId="ytt-hub-why-rishikesh-id"
              value={doc.sectionIds?.whyRishikesh}
              onChange={(_id) => patchSectionId("whyRishikesh", _id)}
            />
            <TextField
              label="Why Rishikesh eyebrow"
              value={doc.whyRishikesh.eyebrow ?? ""}
              onChange={(eyebrow) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, eyebrow },
                })
              }
            />
            <TextField
              label="Why Rishikesh title"
              value={doc.whyRishikesh.title}
              onChange={(title) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, title },
                })
              }
            />
            <StringListField
              label="Why Rishikesh paragraphs"
              items={doc.whyRishikesh.paragraphs}
              onChange={(paragraphs) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, paragraphs },
                })
              }
            />
            <ImageListField
              label="Why Rishikesh images"
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
            <SectionIdField
              fieldId="ytt-hub-eligibility-id"
              value={doc.sectionIds?.eligibility}
              onChange={(_id) => patchSectionId("eligibility", _id)}
            />
            <TextField
              label="Eligibility eyebrow"
              value={doc.eligibility.eyebrow ?? ""}
              onChange={(eyebrow) =>
                setDoc({
                  ...doc,
                  eligibility: { ...doc.eligibility, eyebrow },
                })
              }
            />
            <TextField
              label="Eligibility title"
              value={doc.eligibility.title}
              onChange={(title) =>
                setDoc({
                  ...doc,
                  eligibility: { ...doc.eligibility, title },
                })
              }
            />
            <StringListField
              label="Eligibility paragraphs"
              items={doc.eligibility.paragraphs}
              onChange={(paragraphs) =>
                setDoc({
                  ...doc,
                  eligibility: { ...doc.eligibility, paragraphs },
                })
              }
            />
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
