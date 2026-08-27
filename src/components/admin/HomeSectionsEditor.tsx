"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { AdminSectionJumpNav } from "@/components/admin/AdminSectionJumpNav";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { HomeCoursesPicker } from "@/components/admin/HomeCoursesPicker";
import { ImageField } from "@/components/admin/ImageField";
import { PageSeoFields } from "@/components/admin/PageSeoFields";
import { SectionIdField } from "@/components/admin/SectionIdField";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { FaqItemsEditor } from "@/components/admin/FaqItemsEditor";
import { SelectField } from "@/components/admin/SelectField";
import {
  DragHandle,
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "@/components/admin/SortableList";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useAdminSectionJump } from "@/components/admin/useAdminSectionJump";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { VideoField } from "@/components/admin/VideoField";
import type {
  HomeAuthenticYogaVideo,
  HomeGalleryItem,
  HomePageContent,
  HomeWelcomeImage,
  HomeWhyRishikeshSutra,
  HomeWhyRishikeshTrustLogo,
  HomeYogaAllianceCertification,
} from "@/content/types/dedicated-pages";
import {
  homeCoursesSectionForSave,
  normalizeHomeCourseRefs,
} from "@/content/mappers/home-courses";
import type {
  HomeFaqsContent,
  SharedReview,
} from "@/content/types/shared-sections";
import { REVIEW_SOURCE_OPTIONS } from "@/content/types/shared-sections";

const DEFAULT_GALLERY_CATEGORY_OPTIONS = [
  { value: "practice", label: "Yoga & Practice" },
  { value: "campus", label: "Campus & Food" },
  { value: "life", label: "Excursions & Life" },
];

/** Jump-nav definitions: human labels + stable slug fallbacks. */
const HOME_JUMP_DEFS = [
  { slug: "meta", label: "Page metadata", key: "meta" as const },
  { slug: "hero", label: "Hero", key: "hero" as const },
  { slug: "welcome", label: "Welcome", key: "welcome" as const },
  { slug: "video", label: "Video", key: "video" as const },
  { slug: "gallery", label: "Gallery", key: "gallery" as const },
  {
    slug: "why-rishikesh",
    label: "Why Rishikesh",
    key: "whyRishikesh" as const,
  },
  {
    slug: "authentic-yoga",
    label: "Authentic yoga",
    key: "authenticYoga" as const,
  },
  { slug: "courses", label: "Courses", key: "courses" as const },
  {
    slug: "yoga-alliance",
    label: "Yoga Alliance",
    key: "yogaAlliance" as const,
  },
  {
    slug: "teachers",
    label: "Teachers teaser",
    key: "teachersTeaser" as const,
  },
  {
    slug: "testimonials",
    label: "Testimonials",
    key: "testimonials" as const,
  },
  { slug: "map", label: "Map", key: "map" as const },
  { slug: "faqs", label: "FAQs", key: "faqs" as const },
  { slug: "final-cta", label: "Final CTA", key: "finalCta" as const },
] as const;

type HomeSectionsEditorProps = {
  /** Initial homepage content_data document */
  initial: HomePageContent;
  /** Persist handler (PUT dedicated API) */
  onSave: (doc: HomePageContent) => Promise<void>;
  /** Back link target */
  backHref?: string;
  /** Back link label */
  backLabel?: string;
};

/**
 * Normalizes homepage course placements for editing.
 *
 * @param doc - Raw homepage document from CMS
 */
function withNormalizedCourses(doc: HomePageContent): HomePageContent {
  return {
    ...doc,
    courses: {
      ...doc.courses,
      placements: normalizeHomeCourseRefs(doc.courses),
    },
  };
}

/**
 * Admin editor for all homepage sections stored in `pages.content_data`
 * (page metadata, hero through FAQs, testimonials, and final CTA).
 *
 * @param props - Initial document and save handler
 */
export function HomeSectionsEditor({
  initial,
  onSave,
  backHref = "/admin/sections/home",
  backLabel = "Home",
}: HomeSectionsEditorProps) {
  const [doc, setDoc] = useState(() => withNormalizedCourses(initial));
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(withNormalizedCourses(initial)),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;

  const trustKeys = useStableListKeys(doc.hero.mobileTrust.length);
  const statKeys = useStableListKeys(doc.welcome.rotatingStats.length);
  const welcomeImageKeys = useStableListKeys(doc.welcome.images.length);
  const reviewKeys = useStableListKeys(doc.testimonials.reviews.length);
  const galleryKeys = useStableListKeys(doc.gallery.items.length);
  const homeCoursePlacements = normalizeHomeCourseRefs(doc.courses);
  const certKeys = useStableListKeys(doc.yogaAlliance.certifications.length);
  const sutraKeys = useStableListKeys(doc.whyRishikesh.sutras.length);
  const logoKeys = useStableListKeys(doc.whyRishikesh.trustLogos.length);
  const authenticParagraphKeys = useStableListKeys(
    doc.authenticYoga.paragraphs.length,
  );
  const authenticVideoKeys = useStableListKeys(doc.authenticYoga.videos.length);

  const galleryCategoryOptions =
    doc.gallery.categories && doc.gallery.categories.length > 0
      ? doc.gallery.categories.map((category) => ({
          value: category.id,
          label: category.label,
        }))
      : DEFAULT_GALLERY_CATEGORY_OPTIONS;

  const getSection = useCallback(
    (slug: string) => {
      const def = HOME_JUMP_DEFS.find((item) => item.slug === slug);
      return def
        ? def.key === "meta"
          ? doc.meta
          : doc[def.key as keyof HomePageContent]
        : undefined;
    },
    [doc],
  );
  const {
    items: jumpItems,
    activeId: activeSectionId,
    panelId,
  } = useAdminSectionJump({
    sections: HOME_JUMP_DEFS,
    getSection,
  });

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload: HomePageContent = {
        ...doc,
        courses: homeCoursesSectionForSave(doc.courses),
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
    <div className="admin-editor admin-home-editor">
      <div className="admin-editor-header">
        <div>
          <Link href={backHref} className="admin-back-link">
            ← {backLabel}
          </Link>
          <h1 className="admin-title">Home</h1>
          <p className="admin-subtitle">
            All homepage sections from the database — hero video, gallery,
            courses, FAQs, reviews, and CTAs.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-sm"
        >
          Preview /
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
            subtitle="Badge, title, CTA, marquee, mobile trust chips, background video"
            defaultOpen
            actions={
              <SectionLiveField
                id="hero-section-live"
                value={doc.hero.live}
                onChange={(live) =>
                  setDoc({ ...doc, hero: { ...doc.hero, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="hero-section-id"
              value={doc.hero._id}
              onChange={(_id) => setDoc({ ...doc, hero: { ...doc.hero, _id } })}
            />
            <div className="admin-grid-2">
              <TextField
                label="Badge"
                value={doc.hero.badge}
                onChange={(badge) =>
                  setDoc({ ...doc, hero: { ...doc.hero, badge } })
                }
              />
              <TextField
                label="Title accent"
                value={doc.hero.titleAccent}
                onChange={(titleAccent) =>
                  setDoc({ ...doc, hero: { ...doc.hero, titleAccent } })
                }
                hint='e.g. "Himalayas"'
              />
            </div>
            <TextField
              label="Title lead"
              value={doc.hero.titleLead}
              onChange={(titleLead) =>
                setDoc({ ...doc, hero: { ...doc.hero, titleLead } })
              }
              hint="Text before the accent phrase"
            />
            <div className="admin-grid-2">
              <TextField
                label="CTA label"
                value={doc.hero.ctaLabel}
                onChange={(ctaLabel) =>
                  setDoc({ ...doc, hero: { ...doc.hero, ctaLabel } })
                }
              />
              <TextField
                label="CTA href"
                value={doc.hero.ctaHref}
                onChange={(ctaHref) =>
                  setDoc({ ...doc, hero: { ...doc.hero, ctaHref } })
                }
              />
            </div>
            <StringListField
              label="Marquee items"
              items={doc.hero.marqueeItems}
              onChange={(marqueeItems) =>
                setDoc({ ...doc, hero: { ...doc.hero, marqueeItems } })
              }
            />
            <div className="admin-nested-list">
              <div className="admin-nested-list-head">
                <span className="admin-label">Mobile trust chips</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    trustKeys.addKey();
                    setDoc({
                      ...doc,
                      hero: {
                        ...doc.hero,
                        mobileTrust: [
                          ...doc.hero.mobileTrust,
                          { value: "", label: "" },
                        ],
                      },
                    });
                  }}
                >
                  Add chip
                </button>
              </div>
              {doc.hero.mobileTrust.map((chip, index) => (
                <div key={trustKeys.keys[index]} className="admin-nested-card">
                  <div className="admin-grid-2">
                    <TextField
                      label="Value"
                      value={chip.value}
                      onChange={(value) => {
                        const mobileTrust = [...doc.hero.mobileTrust];
                        mobileTrust[index] = { ...chip, value };
                        setDoc({ ...doc, hero: { ...doc.hero, mobileTrust } });
                      }}
                    />
                    <TextField
                      label="Label"
                      value={chip.label}
                      onChange={(label) => {
                        const mobileTrust = [...doc.hero.mobileTrust];
                        mobileTrust[index] = { ...chip, label };
                        setDoc({ ...doc, hero: { ...doc.hero, mobileTrust } });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--ghost"
                    onClick={() => {
                      trustKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        hero: {
                          ...doc.hero,
                          mobileTrust: doc.hero.mobileTrust.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-nested-card">
              <strong>Background video</strong>
              <p className="admin-hint">
                Full-bleed muted MP4 loop (autoplay, no controls). Upload or
                pick from the media library. Leave srcs empty for poster only.
              </p>
              <div className="admin-grid-2">
                <VideoField
                  label="Mobile video"
                  value={doc.hero.video.mobileSrc}
                  onChange={(mobileSrc) =>
                    setDoc({
                      ...doc,
                      hero: {
                        ...doc.hero,
                        video: { ...doc.hero.video, mobileSrc },
                      },
                    })
                  }
                />
                <ImageField
                  label="Mobile poster"
                  value={doc.hero.video.mobilePoster}
                  onChange={(mobilePoster) =>
                    setDoc({
                      ...doc,
                      hero: {
                        ...doc.hero,
                        video: { ...doc.hero.video, mobilePoster },
                      },
                    })
                  }
                />
              </div>
              <div className="admin-grid-2">
                <VideoField
                  label="Desktop video"
                  value={doc.hero.video.desktopSrc}
                  onChange={(desktopSrc) =>
                    setDoc({
                      ...doc,
                      hero: {
                        ...doc.hero,
                        video: { ...doc.hero.video, desktopSrc },
                      },
                    })
                  }
                />
                <ImageField
                  label="Desktop poster"
                  value={doc.hero.video.desktopPoster}
                  onChange={(desktopPoster) =>
                    setDoc({
                      ...doc,
                      hero: {
                        ...doc.hero,
                        video: { ...doc.hero.video, desktopPoster },
                      },
                    })
                  }
                />
              </div>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("welcome")}
            title="Welcome"
            subtitle="About band under the hero"
            actions={
              <SectionLiveField
                id="welcome-section-live"
                value={doc.welcome.live}
                onChange={(live) =>
                  setDoc({ ...doc, welcome: { ...doc.welcome, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="welcome-section-id"
              value={doc.welcome._id}
              onChange={(_id) =>
                setDoc({ ...doc, welcome: { ...doc.welcome, _id } })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.welcome.eyebrow}
                onChange={(eyebrow) =>
                  setDoc({ ...doc, welcome: { ...doc.welcome, eyebrow } })
                }
              />
              <TextField
                label="Title"
                value={doc.welcome.title}
                onChange={(title) =>
                  setDoc({ ...doc, welcome: { ...doc.welcome, title } })
                }
              />
            </div>
            <TextField
              label="Lead"
              value={doc.welcome.lead}
              onChange={(lead) =>
                setDoc({ ...doc, welcome: { ...doc.welcome, lead } })
              }
              multiline
              rows={2}
            />
            <div className="admin-grid-2">
              <TextField
                label="Vision label"
                value={doc.welcome.vision.label}
                onChange={(label) =>
                  setDoc({
                    ...doc,
                    welcome: {
                      ...doc.welcome,
                      vision: { ...doc.welcome.vision, label },
                    },
                  })
                }
              />
              <TextField
                label="Promise label"
                value={doc.welcome.promise.label}
                onChange={(label) =>
                  setDoc({
                    ...doc,
                    welcome: {
                      ...doc.welcome,
                      promise: { ...doc.welcome.promise, label },
                    },
                  })
                }
              />
            </div>
            <div className="admin-grid-2">
              <TextField
                label="Vision body"
                value={doc.welcome.vision.body}
                onChange={(body) =>
                  setDoc({
                    ...doc,
                    welcome: {
                      ...doc.welcome,
                      vision: { ...doc.welcome.vision, body },
                    },
                  })
                }
                multiline
                rows={3}
              />
              <TextField
                label="Promise body"
                value={doc.welcome.promise.body}
                onChange={(body) =>
                  setDoc({
                    ...doc,
                    welcome: {
                      ...doc.welcome,
                      promise: { ...doc.welcome.promise, body },
                    },
                  })
                }
                multiline
                rows={3}
              />
            </div>
            <StringListField
              label="Highlights"
              items={doc.welcome.highlights}
              onChange={(highlights) =>
                setDoc({ ...doc, welcome: { ...doc.welcome, highlights } })
              }
            />
            <div className="admin-nested-list">
              <div className="admin-nested-list-head">
                <span className="admin-label">Welcome images</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    welcomeImageKeys.addKey();
                    const blank: HomeWelcomeImage = { src: "", alt: "" };
                    setDoc({
                      ...doc,
                      welcome: {
                        ...doc.welcome,
                        images: [...doc.welcome.images, blank],
                      },
                    });
                  }}
                >
                  Add image
                </button>
              </div>
              {doc.welcome.images.map((image, index) => (
                <div
                  key={welcomeImageKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <div className="admin-grid-2">
                    <ImageField
                      label="Image"
                      value={image.src}
                      compact
                      onChange={(src) => {
                        const images = [...doc.welcome.images];
                        images[index] = { ...image, src };
                        setDoc({ ...doc, welcome: { ...doc.welcome, images } });
                      }}
                    />
                    <TextField
                      label="Alt"
                      value={image.alt}
                      onChange={(alt) => {
                        const images = [...doc.welcome.images];
                        images[index] = { ...image, alt };
                        setDoc({ ...doc, welcome: { ...doc.welcome, images } });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--ghost"
                    onClick={() => {
                      welcomeImageKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        welcome: {
                          ...doc.welcome,
                          images: doc.welcome.images.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-nested-list">
              <div className="admin-nested-list-head">
                <span className="admin-label">Rotating stats</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    statKeys.addKey();
                    setDoc({
                      ...doc,
                      welcome: {
                        ...doc.welcome,
                        rotatingStats: [
                          ...doc.welcome.rotatingStats,
                          { value: "", label: "" },
                        ],
                      },
                    });
                  }}
                >
                  Add stat
                </button>
              </div>
              {doc.welcome.rotatingStats.map((stat, index) => (
                <div key={statKeys.keys[index]} className="admin-nested-card">
                  <div className="admin-grid-2">
                    <TextField
                      label="Value"
                      value={stat.value}
                      onChange={(value) => {
                        const rotatingStats = [...doc.welcome.rotatingStats];
                        rotatingStats[index] = { ...stat, value };
                        setDoc({
                          ...doc,
                          welcome: { ...doc.welcome, rotatingStats },
                        });
                      }}
                    />
                    <TextField
                      label="Label"
                      value={stat.label}
                      onChange={(label) => {
                        const rotatingStats = [...doc.welcome.rotatingStats];
                        rotatingStats[index] = { ...stat, label };
                        setDoc({
                          ...doc,
                          welcome: { ...doc.welcome, rotatingStats },
                        });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--ghost"
                    onClick={() => {
                      statKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        welcome: {
                          ...doc.welcome,
                          rotatingStats: doc.welcome.rotatingStats.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-grid-2">
              <TextField
                label="CTA label"
                value={doc.welcome.ctaLabel}
                onChange={(ctaLabel) =>
                  setDoc({ ...doc, welcome: { ...doc.welcome, ctaLabel } })
                }
              />
              <TextField
                label="CTA href"
                value={doc.welcome.ctaHref}
                onChange={(ctaHref) =>
                  setDoc({ ...doc, welcome: { ...doc.welcome, ctaHref } })
                }
              />
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("video")}
            title="Video"
            subtitle="Playlist header + YouTube URLs"
            actions={
              <SectionLiveField
                id="video-section-live"
                value={doc.video.live}
                onChange={(live) =>
                  setDoc({ ...doc, video: { ...doc.video, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="video-section-id"
              value={doc.video._id}
              onChange={(_id) =>
                setDoc({ ...doc, video: { ...doc.video, _id } })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.video.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setDoc({ ...doc, video: { ...doc.video, eyebrow } })
                }
              />
              <TextField
                label="Title"
                value={doc.video.title}
                onChange={(title) =>
                  setDoc({ ...doc, video: { ...doc.video, title } })
                }
              />
            </div>
            <TextField
              label="Description"
              value={doc.video.description ?? ""}
              onChange={(description) =>
                setDoc({ ...doc, video: { ...doc.video, description } })
              }
              multiline
              rows={2}
            />
            <StringListField
              label="YouTube URLs"
              items={doc.video.youtubeUrls}
              onChange={(youtubeUrls) =>
                setDoc({ ...doc, video: { ...doc.video, youtubeUrls } })
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("gallery")}
            title="Gallery"
            subtitle={`${doc.gallery.items.length} images`}
            actions={
              <SectionLiveField
                id="gallery-section-live"
                value={doc.gallery.live}
                onChange={(live) =>
                  setDoc({ ...doc, gallery: { ...doc.gallery, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="gallery-section-id"
              value={doc.gallery._id}
              onChange={(_id) =>
                setDoc({ ...doc, gallery: { ...doc.gallery, _id } })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.gallery.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setDoc({ ...doc, gallery: { ...doc.gallery, eyebrow } })
                }
              />
              <TextField
                label="Title"
                value={doc.gallery.title}
                onChange={(title) =>
                  setDoc({ ...doc, gallery: { ...doc.gallery, title } })
                }
              />
            </div>
            <TextField
              label="Description"
              value={doc.gallery.description ?? ""}
              onChange={(description) =>
                setDoc({ ...doc, gallery: { ...doc.gallery, description } })
              }
              multiline
              rows={2}
            />
            <TextField
              label="Lightbox title"
              value={doc.gallery.lightboxTitle ?? ""}
              onChange={(lightboxTitle) =>
                setDoc({ ...doc, gallery: { ...doc.gallery, lightboxTitle } })
              }
            />
            {doc.gallery.items.map((item, index) => (
              <div key={galleryKeys.keys[index]} className="admin-nested-card">
                <div className="admin-nested-card-head">
                  <strong>Item {index + 1}</strong>
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--danger"
                    onClick={() => {
                      galleryKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        gallery: {
                          ...doc.gallery,
                          items: doc.gallery.items.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
                <ImageField
                  label="Image"
                  value={item.src}
                  compact
                  onChange={(src) => {
                    const items = [...doc.gallery.items];
                    items[index] = { ...item, src };
                    setDoc({ ...doc, gallery: { ...doc.gallery, items } });
                  }}
                />
                <div className="admin-grid-3">
                  <TextField
                    label="Alt"
                    value={item.alt}
                    onChange={(alt) => {
                      const items = [...doc.gallery.items];
                      items[index] = { ...item, alt };
                      setDoc({ ...doc, gallery: { ...doc.gallery, items } });
                    }}
                  />
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(title) => {
                      const items = [...doc.gallery.items];
                      items[index] = { ...item, title };
                      setDoc({ ...doc, gallery: { ...doc.gallery, items } });
                    }}
                  />
                  <SelectField
                    label="Category"
                    value={item.category}
                    options={galleryCategoryOptions}
                    onChange={(category) => {
                      const items = [...doc.gallery.items];
                      items[index] = {
                        ...item,
                        category: category as HomeGalleryItem["category"],
                      };
                      setDoc({ ...doc, gallery: { ...doc.gallery, items } });
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                galleryKeys.addKey();
                const blank: HomeGalleryItem = {
                  src: "",
                  alt: "",
                  title: "",
                  category: "practice",
                };
                setDoc({
                  ...doc,
                  gallery: {
                    ...doc.gallery,
                    items: [...doc.gallery.items, blank],
                  },
                });
              }}
            >
              Add gallery item
            </button>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("why-rishikesh")}
            title="Why Rishikesh"
            subtitle="Sutras, logos, video card"
            actions={
              <SectionLiveField
                id="why-rishikesh-section-live"
                value={doc.whyRishikesh.live}
                onChange={(live) =>
                  setDoc({
                    ...doc,
                    whyRishikesh: { ...doc.whyRishikesh, live },
                  })
                }
              />
            }
          >
            <SectionIdField
              fieldId="why-rishikesh-section-id"
              value={doc.whyRishikesh._id}
              onChange={(_id) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, _id },
                })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.whyRishikesh.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setDoc({
                    ...doc,
                    whyRishikesh: { ...doc.whyRishikesh, eyebrow },
                  })
                }
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
            </div>
            <div className="admin-grid-2">
              <TextField
                label="Title accent"
                value={doc.whyRishikesh.titleAccent ?? ""}
                onChange={(titleAccent) =>
                  setDoc({
                    ...doc,
                    whyRishikesh: { ...doc.whyRishikesh, titleAccent },
                  })
                }
              />
              <TextField
                label="YouTube URL"
                value={doc.whyRishikesh.youtubeUrl}
                onChange={(youtubeUrl) =>
                  setDoc({
                    ...doc,
                    whyRishikesh: { ...doc.whyRishikesh, youtubeUrl },
                  })
                }
              />
            </div>
            <TextField
              label="Description"
              value={doc.whyRishikesh.description ?? ""}
              onChange={(description) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, description },
                })
              }
              multiline
              rows={2}
            />
            <TextField
              label="Closing invitation"
              value={doc.whyRishikesh.closingInvitation}
              onChange={(closingInvitation) =>
                setDoc({
                  ...doc,
                  whyRishikesh: { ...doc.whyRishikesh, closingInvitation },
                })
              }
              multiline
              rows={2}
            />
            <div className="admin-nested-card">
              <strong>Video card</strong>
              <div className="admin-grid-2">
                <TextField
                  label="Eyebrow"
                  value={doc.whyRishikesh.videoCard.eyebrow}
                  onChange={(eyebrow) =>
                    setDoc({
                      ...doc,
                      whyRishikesh: {
                        ...doc.whyRishikesh,
                        videoCard: { ...doc.whyRishikesh.videoCard, eyebrow },
                      },
                    })
                  }
                />
                <TextField
                  label="Title"
                  value={doc.whyRishikesh.videoCard.title}
                  onChange={(title) =>
                    setDoc({
                      ...doc,
                      whyRishikesh: {
                        ...doc.whyRishikesh,
                        videoCard: { ...doc.whyRishikesh.videoCard, title },
                      },
                    })
                  }
                />
              </div>
              <div className="admin-grid-2">
                <TextField
                  label="Speaker tag"
                  value={doc.whyRishikesh.videoCard.speakerTag}
                  onChange={(speakerTag) =>
                    setDoc({
                      ...doc,
                      whyRishikesh: {
                        ...doc.whyRishikesh,
                        videoCard: {
                          ...doc.whyRishikesh.videoCard,
                          speakerTag,
                        },
                      },
                    })
                  }
                />
                <TextField
                  label="Speaker subtitle"
                  value={doc.whyRishikesh.videoCard.speakerSubtitle}
                  onChange={(speakerSubtitle) =>
                    setDoc({
                      ...doc,
                      whyRishikesh: {
                        ...doc.whyRishikesh,
                        videoCard: {
                          ...doc.whyRishikesh.videoCard,
                          speakerSubtitle,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="admin-nested-list">
              <div className="admin-nested-list-head">
                <span className="admin-label">Trust logos</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    logoKeys.addKey();
                    const blank: HomeWhyRishikeshTrustLogo = {
                      src: "",
                      alt: "",
                    };
                    setDoc({
                      ...doc,
                      whyRishikesh: {
                        ...doc.whyRishikesh,
                        trustLogos: [...doc.whyRishikesh.trustLogos, blank],
                      },
                    });
                  }}
                >
                  Add logo
                </button>
              </div>
              {doc.whyRishikesh.trustLogos.map((logo, index) => (
                <div key={logoKeys.keys[index]} className="admin-nested-card">
                  <div className="admin-grid-2">
                    <ImageField
                      label="Logo"
                      value={logo.src}
                      compact
                      onChange={(src) => {
                        const trustLogos = [...doc.whyRishikesh.trustLogos];
                        trustLogos[index] = { ...logo, src };
                        setDoc({
                          ...doc,
                          whyRishikesh: { ...doc.whyRishikesh, trustLogos },
                        });
                      }}
                    />
                    <TextField
                      label="Alt"
                      value={logo.alt}
                      onChange={(alt) => {
                        const trustLogos = [...doc.whyRishikesh.trustLogos];
                        trustLogos[index] = { ...logo, alt };
                        setDoc({
                          ...doc,
                          whyRishikesh: { ...doc.whyRishikesh, trustLogos },
                        });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--ghost"
                    onClick={() => {
                      logoKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        whyRishikesh: {
                          ...doc.whyRishikesh,
                          trustLogos: doc.whyRishikesh.trustLogos.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-nested-list">
              <div className="admin-nested-list-head">
                <span className="admin-label">Sutras</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    sutraKeys.addKey();
                    const blank: HomeWhyRishikeshSutra = {
                      title: "",
                      body: "",
                    };
                    setDoc({
                      ...doc,
                      whyRishikesh: {
                        ...doc.whyRishikesh,
                        sutras: [...doc.whyRishikesh.sutras, blank],
                      },
                    });
                  }}
                >
                  Add sutra
                </button>
              </div>
              {doc.whyRishikesh.sutras.map((sutra, index) => (
                <div key={sutraKeys.keys[index]} className="admin-nested-card">
                  <TextField
                    label="Title"
                    value={sutra.title}
                    onChange={(title) => {
                      const sutras = [...doc.whyRishikesh.sutras];
                      sutras[index] = { ...sutra, title };
                      setDoc({
                        ...doc,
                        whyRishikesh: { ...doc.whyRishikesh, sutras },
                      });
                    }}
                  />
                  <TextField
                    label="Body"
                    value={sutra.body}
                    onChange={(body) => {
                      const sutras = [...doc.whyRishikesh.sutras];
                      sutras[index] = { ...sutra, body };
                      setDoc({
                        ...doc,
                        whyRishikesh: { ...doc.whyRishikesh, sutras },
                      });
                    }}
                    multiline
                    rows={2}
                  />
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--ghost"
                    onClick={() => {
                      sutraKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        whyRishikesh: {
                          ...doc.whyRishikesh,
                          sutras: doc.whyRishikesh.sutras.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("authentic-yoga")}
            title="Authentic yoga"
            subtitle="Best yoga school copy and video grid"
            description="Heading, body paragraphs, and the 2×2 YouTube grid from the live homepage."
            actions={
              <SectionLiveField
                id="authentic-yoga-section-live"
                value={doc.authenticYoga.live}
                onChange={(live) =>
                  setDoc({
                    ...doc,
                    authenticYoga: { ...doc.authenticYoga, live },
                  })
                }
              />
            }
          >
            <SectionIdField
              fieldId="authentic-yoga-section-id"
              value={doc.authenticYoga._id}
              onChange={(_id) =>
                setDoc({
                  ...doc,
                  authenticYoga: { ...doc.authenticYoga, _id },
                })
              }
            />
            <TextField
              label="Eyebrow"
              value={doc.authenticYoga.eyebrow}
              onChange={(eyebrow) =>
                setDoc({
                  ...doc,
                  authenticYoga: { ...doc.authenticYoga, eyebrow },
                })
              }
            />
            <TextField
              label="Title"
              value={doc.authenticYoga.title}
              onChange={(title) =>
                setDoc({
                  ...doc,
                  authenticYoga: { ...doc.authenticYoga, title },
                })
              }
            />
            <div className="admin-nested-list">
              <div className="admin-nested-list-head">
                <span className="admin-label">Paragraphs</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    authenticParagraphKeys.addKey();
                    setDoc({
                      ...doc,
                      authenticYoga: {
                        ...doc.authenticYoga,
                        paragraphs: [...doc.authenticYoga.paragraphs, ""],
                      },
                    });
                  }}
                >
                  Add paragraph
                </button>
              </div>
              {doc.authenticYoga.paragraphs.map((paragraph, index) => (
                <div
                  key={authenticParagraphKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <TextField
                    label={`Paragraph ${index + 1}`}
                    value={paragraph}
                    onChange={(value) => {
                      const paragraphs = [...doc.authenticYoga.paragraphs];
                      paragraphs[index] = value;
                      setDoc({
                        ...doc,
                        authenticYoga: { ...doc.authenticYoga, paragraphs },
                      });
                    }}
                    multiline
                    rows={4}
                  />
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--ghost"
                    onClick={() => {
                      authenticParagraphKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        authenticYoga: {
                          ...doc.authenticYoga,
                          paragraphs: doc.authenticYoga.paragraphs.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-nested-list">
              <div className="admin-nested-list-head">
                <span className="admin-label">Videos</span>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => {
                    authenticVideoKeys.addKey();
                    const blank: HomeAuthenticYogaVideo = {
                      youtubeUrl: "",
                      caption: "",
                    };
                    setDoc({
                      ...doc,
                      authenticYoga: {
                        ...doc.authenticYoga,
                        videos: [...doc.authenticYoga.videos, blank],
                      },
                    });
                  }}
                >
                  Add video
                </button>
              </div>
              {doc.authenticYoga.videos.map((video, index) => (
                <div
                  key={authenticVideoKeys.keys[index]}
                  className="admin-nested-card"
                >
                  <TextField
                    label="YouTube URL"
                    value={video.youtubeUrl}
                    onChange={(youtubeUrl) => {
                      const videos = [...doc.authenticYoga.videos];
                      videos[index] = { ...video, youtubeUrl };
                      setDoc({
                        ...doc,
                        authenticYoga: { ...doc.authenticYoga, videos },
                      });
                    }}
                    hint="Watch or embed URL"
                  />
                  <TextField
                    label="Caption"
                    value={video.caption}
                    onChange={(caption) => {
                      const videos = [...doc.authenticYoga.videos];
                      videos[index] = { ...video, caption };
                      setDoc({
                        ...doc,
                        authenticYoga: { ...doc.authenticYoga, videos },
                      });
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--ghost"
                    onClick={() => {
                      authenticVideoKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        authenticYoga: {
                          ...doc.authenticYoga,
                          videos: doc.authenticYoga.videos.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("courses")}
            title="Courses"
            subtitle={`${homeCoursePlacements.filter((ref) => ref.live !== false).length} on homepage`}
            description="Choose which residential courses appear on the homepage. Card content (title, fee, image, duration) comes from each course page."
            actions={
              <SectionLiveField
                id="courses-section-live"
                value={doc.courses.live}
                onChange={(live) =>
                  setDoc({ ...doc, courses: { ...doc.courses, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="courses-section-id"
              value={doc.courses._id}
              onChange={(_id) =>
                setDoc({ ...doc, courses: { ...doc.courses, _id } })
              }
            />
            <details className="admin-home-courses-section-copy">
              <summary>Section header copy</summary>
              <div className="admin-home-courses-section-copy__body">
                <div className="admin-grid-2">
                  <TextField
                    label="Eyebrow"
                    value={doc.courses.eyebrow ?? ""}
                    onChange={(eyebrow) =>
                      setDoc({ ...doc, courses: { ...doc.courses, eyebrow } })
                    }
                  />
                  <TextField
                    label="Title"
                    value={doc.courses.title}
                    onChange={(title) =>
                      setDoc({ ...doc, courses: { ...doc.courses, title } })
                    }
                  />
                </div>
                <TextField
                  label="Description"
                  value={doc.courses.description ?? ""}
                  onChange={(description) =>
                    setDoc({
                      ...doc,
                      courses: { ...doc.courses, description },
                    })
                  }
                  multiline
                  rows={2}
                />
              </div>
            </details>
            <HomeCoursesPicker
              value={homeCoursePlacements}
              onChange={(placements) =>
                setDoc({
                  ...doc,
                  courses: { ...doc.courses, placements },
                })
              }
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("yoga-alliance")}
            title="Yoga Alliance"
            subtitle={`${doc.yogaAlliance.certifications.length} certifications`}
            actions={
              <SectionLiveField
                id="yoga-alliance-section-live"
                value={doc.yogaAlliance.live}
                onChange={(live) =>
                  setDoc({
                    ...doc,
                    yogaAlliance: { ...doc.yogaAlliance, live },
                  })
                }
              />
            }
          >
            <SectionIdField
              fieldId="yoga-alliance-section-id"
              value={doc.yogaAlliance._id}
              onChange={(_id) =>
                setDoc({
                  ...doc,
                  yogaAlliance: { ...doc.yogaAlliance, _id },
                })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Badge label"
                value={doc.yogaAlliance.badgeLabel}
                onChange={(badgeLabel) =>
                  setDoc({
                    ...doc,
                    yogaAlliance: { ...doc.yogaAlliance, badgeLabel },
                  })
                }
              />
              <TextField
                label="Eyebrow"
                value={doc.yogaAlliance.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setDoc({
                    ...doc,
                    yogaAlliance: { ...doc.yogaAlliance, eyebrow },
                  })
                }
              />
            </div>
            <TextField
              label="Title"
              value={doc.yogaAlliance.title}
              onChange={(title) =>
                setDoc({
                  ...doc,
                  yogaAlliance: { ...doc.yogaAlliance, title },
                })
              }
            />
            <TextField
              label="Description"
              value={doc.yogaAlliance.description ?? ""}
              onChange={(description) =>
                setDoc({
                  ...doc,
                  yogaAlliance: { ...doc.yogaAlliance, description },
                })
              }
              multiline
              rows={2}
            />
            <div className="admin-grid-2">
              <TextField
                label="Seal eyebrow"
                value={doc.yogaAlliance.sealEyebrow}
                onChange={(sealEyebrow) =>
                  setDoc({
                    ...doc,
                    yogaAlliance: { ...doc.yogaAlliance, sealEyebrow },
                  })
                }
              />
              <TextField
                label="Seal title"
                value={doc.yogaAlliance.sealTitle}
                onChange={(sealTitle) =>
                  setDoc({
                    ...doc,
                    yogaAlliance: { ...doc.yogaAlliance, sealTitle },
                  })
                }
              />
            </div>
            <TextField
              label="Lead"
              value={doc.yogaAlliance.lead}
              onChange={(lead) =>
                setDoc({
                  ...doc,
                  yogaAlliance: { ...doc.yogaAlliance, lead },
                })
              }
              multiline
              rows={2}
            />
            <TextField
              label="Body"
              value={doc.yogaAlliance.body}
              onChange={(body) =>
                setDoc({
                  ...doc,
                  yogaAlliance: { ...doc.yogaAlliance, body },
                })
              }
              multiline
              rows={3}
            />
            {doc.yogaAlliance.certifications.map((cert, index) => (
              <div key={certKeys.keys[index]} className="admin-nested-card">
                <div className="admin-nested-card-head">
                  <strong>Cert {cert.hours || index + 1}</strong>
                  <button
                    type="button"
                    className="admin-btn-sm admin-btn-sm--danger"
                    onClick={() => {
                      certKeys.removeKey(index);
                      setDoc({
                        ...doc,
                        yogaAlliance: {
                          ...doc.yogaAlliance,
                          certifications:
                            doc.yogaAlliance.certifications.filter(
                              (_, i) => i !== index,
                            ),
                        },
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
                <div className="admin-grid-3">
                  <TextField
                    label="Hours"
                    value={cert.hours}
                    onChange={(hours) => {
                      const certifications = [
                        ...doc.yogaAlliance.certifications,
                      ];
                      certifications[index] = { ...cert, hours };
                      setDoc({
                        ...doc,
                        yogaAlliance: { ...doc.yogaAlliance, certifications },
                      });
                    }}
                  />
                  <TextField
                    label="Title"
                    value={cert.title}
                    onChange={(title) => {
                      const certifications = [
                        ...doc.yogaAlliance.certifications,
                      ];
                      certifications[index] = { ...cert, title };
                      setDoc({
                        ...doc,
                        yogaAlliance: { ...doc.yogaAlliance, certifications },
                      });
                    }}
                  />
                  <TextField
                    label="Level"
                    value={cert.level}
                    onChange={(level) => {
                      const certifications = [
                        ...doc.yogaAlliance.certifications,
                      ];
                      certifications[index] = { ...cert, level };
                      setDoc({
                        ...doc,
                        yogaAlliance: { ...doc.yogaAlliance, certifications },
                      });
                    }}
                  />
                </div>
                <TextField
                  label="Description"
                  value={cert.description}
                  onChange={(description) => {
                    const certifications = [...doc.yogaAlliance.certifications];
                    certifications[index] = { ...cert, description };
                    setDoc({
                      ...doc,
                      yogaAlliance: { ...doc.yogaAlliance, certifications },
                    });
                  }}
                  multiline
                  rows={2}
                />
                <div className="admin-grid-2">
                  <TextField
                    label="Href"
                    value={cert.href}
                    onChange={(href) => {
                      const certifications = [
                        ...doc.yogaAlliance.certifications,
                      ];
                      certifications[index] = { ...cert, href };
                      setDoc({
                        ...doc,
                        yogaAlliance: { ...doc.yogaAlliance, certifications },
                      });
                    }}
                  />
                  <TextField
                    label="Icon key"
                    value={cert.iconKey}
                    onChange={(iconKey) => {
                      const certifications = [
                        ...doc.yogaAlliance.certifications,
                      ];
                      certifications[index] = {
                        ...cert,
                        iconKey:
                          iconKey as HomeYogaAllianceCertification["iconKey"],
                      };
                      setDoc({
                        ...doc,
                        yogaAlliance: { ...doc.yogaAlliance, certifications },
                      });
                    }}
                    hint="leaf | compass | certificate"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => {
                certKeys.addKey();
                const blank: HomeYogaAllianceCertification = {
                  hours: "",
                  title: "",
                  level: "",
                  description: "",
                  href: "",
                  iconKey: "leaf",
                };
                setDoc({
                  ...doc,
                  yogaAlliance: {
                    ...doc.yogaAlliance,
                    certifications: [...doc.yogaAlliance.certifications, blank],
                  },
                });
              }}
            >
              Add certification
            </button>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("teachers")}
            title="Teachers teaser"
            subtitle="Home band copy (faculty profiles edit under Teachers)"
            actions={
              <SectionLiveField
                id="teachers-section-live"
                value={doc.teachersTeaser.live}
                onChange={(live) =>
                  setDoc({
                    ...doc,
                    teachersTeaser: { ...doc.teachersTeaser, live },
                  })
                }
              />
            }
          >
            <SectionIdField
              fieldId="teachers-teaser-section-id"
              value={doc.teachersTeaser._id}
              onChange={(_id) =>
                setDoc({
                  ...doc,
                  teachersTeaser: { ...doc.teachersTeaser, _id },
                })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.teachersTeaser.eyebrow}
                onChange={(eyebrow) =>
                  setDoc({
                    ...doc,
                    teachersTeaser: { ...doc.teachersTeaser, eyebrow },
                  })
                }
              />
              <TextField
                label="Title"
                value={doc.teachersTeaser.title}
                onChange={(title) =>
                  setDoc({
                    ...doc,
                    teachersTeaser: { ...doc.teachersTeaser, title },
                  })
                }
              />
            </div>
            <TextField
              label="Description"
              value={doc.teachersTeaser.description}
              onChange={(description) =>
                setDoc({
                  ...doc,
                  teachersTeaser: { ...doc.teachersTeaser, description },
                })
              }
              multiline
              rows={2}
            />
            <div className="admin-grid-2">
              <TextField
                label="CTA label"
                value={doc.teachersTeaser.ctaLabel}
                onChange={(ctaLabel) =>
                  setDoc({
                    ...doc,
                    teachersTeaser: { ...doc.teachersTeaser, ctaLabel },
                  })
                }
              />
              <TextField
                label="CTA href"
                value={doc.teachersTeaser.ctaHref}
                onChange={(ctaHref) =>
                  setDoc({
                    ...doc,
                    teachersTeaser: { ...doc.teachersTeaser, ctaHref },
                  })
                }
              />
            </div>
            <p className="admin-hint">
              Faculty cards come from{" "}
              <Link href="/admin/sections/teachers" className="admin-link">
                Teachers
              </Link>
              .
            </p>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("testimonials")}
            title="Testimonials"
            subtitle={`${doc.testimonials.reviews.length} reviews on this page`}
            actions={
              <SectionLiveField
                id="testimonials-section-live"
                value={doc.testimonials.live}
                onChange={(live) =>
                  setDoc({
                    ...doc,
                    testimonials: { ...doc.testimonials, live },
                  })
                }
              />
            }
          >
            <SectionIdField
              fieldId="testimonials-section-id"
              value={doc.testimonials._id}
              onChange={(_id) =>
                setDoc({
                  ...doc,
                  testimonials: { ...doc.testimonials, _id },
                })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.testimonials.eyebrow ?? ""}
                onChange={(eyebrow) =>
                  setDoc({
                    ...doc,
                    testimonials: { ...doc.testimonials, eyebrow },
                  })
                }
              />
              <TextField
                label="Title"
                value={doc.testimonials.title ?? ""}
                onChange={(title) =>
                  setDoc({
                    ...doc,
                    testimonials: { ...doc.testimonials, title },
                  })
                }
              />
            </div>
            <TextField
              label="Description"
              value={doc.testimonials.description ?? ""}
              onChange={(description) =>
                setDoc({
                  ...doc,
                  testimonials: { ...doc.testimonials, description },
                })
              }
              multiline
              rows={2}
            />
            <SortableList
              ids={reviewKeys.keys}
              onReorder={(fromIndex, toIndex) => {
                reviewKeys.reorderKeys(fromIndex, toIndex);
                const reviews = withSortField(
                  reorderItems(doc.testimonials.reviews, fromIndex, toIndex),
                ) as SharedReview[];
                setDoc({
                  ...doc,
                  testimonials: { ...doc.testimonials, reviews },
                });
              }}
            >
              {doc.testimonials.reviews.map((review, index) => (
                <SortableRow
                  key={reviewKeys.keys[index]}
                  id={reviewKeys.keys[index]}
                >
                  {({ dragHandleProps }) => (
                    <div className="admin-nested-card">
                      <div className="admin-nested-card-head">
                        <span className="admin-nested-card-title">
                          <DragHandle dragHandleProps={dragHandleProps} />
                          <strong>Review {index + 1}</strong>
                        </span>
                        <button
                          type="button"
                          className="admin-btn-sm admin-btn-sm--danger"
                          onClick={() => {
                            reviewKeys.removeKey(index);
                            setDoc({
                              ...doc,
                              testimonials: {
                                ...doc.testimonials,
                                reviews: doc.testimonials.reviews.filter(
                                  (_, i) => i !== index,
                                ),
                              },
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="admin-grid-3">
                        <TextField
                          label="Name"
                          value={review.name}
                          onChange={(name) => {
                            const reviews = [...doc.testimonials.reviews];
                            reviews[index] = { ...review, name };
                            setDoc({
                              ...doc,
                              testimonials: { ...doc.testimonials, reviews },
                            });
                          }}
                        />
                        <TextField
                          label="Title"
                          value={review.title}
                          onChange={(title) => {
                            const reviews = [...doc.testimonials.reviews];
                            reviews[index] = { ...review, title };
                            setDoc({
                              ...doc,
                              testimonials: { ...doc.testimonials, reviews },
                            });
                          }}
                        />
                        <SelectField
                          label="Source"
                          value={review.source}
                          options={[...REVIEW_SOURCE_OPTIONS]}
                          onChange={(source) => {
                            const reviews = [...doc.testimonials.reviews];
                            reviews[index] = {
                              ...review,
                              source: source as SharedReview["source"],
                            };
                            setDoc({
                              ...doc,
                              testimonials: { ...doc.testimonials, reviews },
                            });
                          }}
                        />
                      </div>
                      <TextField
                        label="Message"
                        value={review.message}
                        onChange={(message) => {
                          const reviews = [...doc.testimonials.reviews];
                          reviews[index] = { ...review, message };
                          setDoc({
                            ...doc,
                            testimonials: { ...doc.testimonials, reviews },
                          });
                        }}
                        multiline
                        rows={2}
                      />
                      <ImageField
                        label="Photo"
                        value={review.image}
                        compact
                        onChange={(image) => {
                          const reviews = [...doc.testimonials.reviews];
                          reviews[index] = { ...review, image };
                          setDoc({
                            ...doc,
                            testimonials: { ...doc.testimonials, reviews },
                          });
                        }}
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
                reviewKeys.addKey();
                const blank: SharedReview = {
                  name: "",
                  image: "",
                  title: "",
                  message: "",
                  source: "Google",
                };
                setDoc({
                  ...doc,
                  testimonials: {
                    ...doc.testimonials,
                    reviews: [...doc.testimonials.reviews, blank],
                  },
                });
              }}
            >
              Add review
            </button>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("map")}
            title="Map"
            subtitle="Page live only — embed is shared"
            description="Map embed and copy are edited once under Shared sections. This toggle only shows/hides the map on the homepage."
            actions={
              <SectionLiveField
                id="map-section-live"
                value={doc.map.live}
                onChange={(live) =>
                  setDoc({ ...doc, map: { ...doc.map, live, show: live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="map-section-id"
              value={doc.map._id}
              onChange={(_id) => setDoc({ ...doc, map: { ...doc.map, _id } })}
            />
            <p className="admin-hint">
              <Link
                href="/admin/sections/shared#siteMap"
                className="admin-link"
              >
                Edit shared map embed →
              </Link>
            </p>
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("faqs")}
            title="FAQs"
            subtitle={`${doc.faqs.faqs.length} questions on this page`}
            actions={
              <SectionLiveField
                id="faqs-section-live"
                value={doc.faqs.live}
                onChange={(live) =>
                  setDoc({ ...doc, faqs: { ...doc.faqs, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="faqs-section-id"
              value={doc.faqs._id}
              onChange={(_id) => setDoc({ ...doc, faqs: { ...doc.faqs, _id } })}
            />
            <div className="admin-grid-2">
              <TextField
                label="Eyebrow"
                value={doc.faqs.eyebrow}
                onChange={(eyebrow) =>
                  setDoc({ ...doc, faqs: { ...doc.faqs, eyebrow } })
                }
              />
              <TextField
                label="Title"
                value={doc.faqs.title}
                onChange={(title) =>
                  setDoc({ ...doc, faqs: { ...doc.faqs, title } })
                }
              />
            </div>
            <FaqItemsEditor
              items={doc.faqs.faqs}
              onChange={(faqs) => setDoc({ ...doc, faqs: { ...doc.faqs, faqs } })}
              idPrefix="home-faq"
              renderExtraFields={(faq, _index, update) => (
                <>
                  <TextField
                    label="Tag"
                    value={faq.tag ?? ""}
                    onChange={(tag) => update({ tag })}
                  />
                  <ImageField
                    label="Image"
                    value={faq.image ?? ""}
                    compact
                    onChange={(image) => update({ image })}
                  />
                </>
              )}
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            id={panelId("final-cta")}
            title="Final CTA"
            subtitle="Bottom conversion band"
            actions={
              <SectionLiveField
                id="final-cta-section-live"
                value={doc.finalCta.live}
                onChange={(live) =>
                  setDoc({ ...doc, finalCta: { ...doc.finalCta, live } })
                }
              />
            }
          >
            <SectionIdField
              fieldId="final-cta-section-id"
              value={doc.finalCta._id}
              onChange={(_id) =>
                setDoc({ ...doc, finalCta: { ...doc.finalCta, _id } })
              }
            />
            <div className="admin-grid-2">
              <TextField
                label="Pill"
                value={doc.finalCta.pill}
                onChange={(pill) =>
                  setDoc({ ...doc, finalCta: { ...doc.finalCta, pill } })
                }
              />
              <TextField
                label="Title accent"
                value={doc.finalCta.titleAccent}
                onChange={(titleAccent) =>
                  setDoc({ ...doc, finalCta: { ...doc.finalCta, titleAccent } })
                }
              />
            </div>
            <TextField
              label="Title"
              value={doc.finalCta.title}
              onChange={(title) =>
                setDoc({ ...doc, finalCta: { ...doc.finalCta, title } })
              }
            />
            <TextField
              label="Lead"
              value={doc.finalCta.lead}
              onChange={(lead) =>
                setDoc({ ...doc, finalCta: { ...doc.finalCta, lead } })
              }
              multiline
              rows={2}
            />
            <div className="admin-grid-2">
              <TextField
                label="Primary CTA label"
                value={doc.finalCta.primaryLabel}
                onChange={(primaryLabel) =>
                  setDoc({
                    ...doc,
                    finalCta: { ...doc.finalCta, primaryLabel },
                  })
                }
              />
              <TextField
                label="Primary CTA href"
                value={doc.finalCta.primaryHref}
                onChange={(primaryHref) =>
                  setDoc({ ...doc, finalCta: { ...doc.finalCta, primaryHref } })
                }
              />
            </div>
            <div className="admin-grid-2">
              <TextField
                label="Secondary CTA label"
                value={doc.finalCta.secondaryLabel}
                onChange={(secondaryLabel) =>
                  setDoc({
                    ...doc,
                    finalCta: { ...doc.finalCta, secondaryLabel },
                  })
                }
              />
              <TextField
                label="Secondary CTA href"
                value={doc.finalCta.secondaryHref}
                onChange={(secondaryHref) =>
                  setDoc({
                    ...doc,
                    finalCta: { ...doc.finalCta, secondaryHref },
                  })
                }
              />
            </div>
            <div className="admin-grid-2">
              <ImageField
                label="Background image"
                value={doc.finalCta.image}
                compact
                onChange={(image) =>
                  setDoc({ ...doc, finalCta: { ...doc.finalCta, image } })
                }
              />
              <TextField
                label="Image alt"
                value={doc.finalCta.imageAlt ?? ""}
                onChange={(imageAlt) =>
                  setDoc({ ...doc, finalCta: { ...doc.finalCta, imageAlt } })
                }
              />
            </div>
          </CollapsiblePanel>
        </div>
      </div>

      <AdminSaveBar
        title="Home"
        subtitle="content_data"
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/"
      />
    </div>
  );
}
