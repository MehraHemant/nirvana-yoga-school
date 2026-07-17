"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageListField } from "@/components/admin/ImageListField";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { SelectField } from "@/components/admin/SelectField";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import type { CmsInteractiveImage } from "@/content/types/cms-image";
import type {
  HomeFaqsContent,
  ResidentialLifeContent,
  RetreatAccommodationContent,
  ReviewsContent,
  SharedAccommodationGallery,
  SharedFacility,
  SharedGalleryImage,
  SiteMapContent,
  VenueFaqsContent,
  WhyNirvanaContent,
} from "@/content/types/shared-sections";
import { parseApiJson } from "@/lib/types/api";

const SHARED_KEYS = [
  "residentialLife",
  "retreatAccommodation",
  "whyNirvana",
  "siteMap",
  "reviews",
  "homeFaqs",
  "venueFaqs",
  "yttHub",
] as const;

type SharedKey = (typeof SHARED_KEYS)[number];

type SharedValue =
  | ResidentialLifeContent
  | RetreatAccommodationContent
  | WhyNirvanaContent
  | SiteMapContent
  | ReviewsContent
  | HomeFaqsContent
  | VenueFaqsContent
  | Record<string, unknown>;

const LABELS: Record<SharedKey, string> = {
  residentialLife: "Course lodging & food",
  retreatAccommodation: "Retreat lodging & food",
  whyNirvana: "Why Nirvana",
  siteMap: "Map",
  reviews: "Reviews",
  homeFaqs: "Home FAQs",
  venueFaqs: "Venue FAQs",
  yttHub: "YTT Hub",
};

const FACILITY_ICON_OPTIONS = [
  { value: "shower", label: "Shower" },
  { value: "terrace", label: "Terrace" },
  { value: "bowl", label: "Dining" },
  { value: "wifi", label: "Wi‑Fi" },
  { value: "lotus", label: "Yoga hall" },
  { value: "leaf", label: "Leaf / eco" },
  { value: "garden", label: "Garden" },
  { value: "bathroom", label: "Bathroom" },
  { value: "flame", label: "Hot water / heater" },
  { value: "droplet", label: "Drinking water" },
  { value: "laundry", label: "Laundry" },
  { value: "wind", label: "Air conditioning" },
];

/**
 * Maps CMS interactive images into the shared gallery image shape.
 *
 * @param items - Admin image list values
 */
function toSharedGalleryImages(
  items: CmsInteractiveImage[],
): SharedGalleryImage[] {
  return items.map((item) => ({
    url: item.url,
    title: item.alt?.trim() || "Gallery image",
    alt: item.alt,
    clickAction: item.clickAction,
    redirectUrl: item.redirectUrl,
  }));
}

/**
 * Maps shared gallery images into the admin ImageListField shape.
 *
 * @param images - Stored gallery images
 */
function toCmsImages(images: SharedGalleryImage[]): CmsInteractiveImage[] {
  return images.map((image) => ({
    url: image.url,
    alt: image.alt?.trim() || image.title,
    clickAction: image.clickAction ?? "fullscreen",
    redirectUrl: image.redirectUrl ?? "",
  }));
}

/**
 * Admin hub for shared `global_settings` section documents reused by product pages.
 */
export function SharedSectionsEditor() {
  const [active, setActive] = useState<SharedKey>("residentialLife");
  const [value, setValue] = useState<SharedValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as SharedKey;
    if ((SHARED_KEYS as readonly string[]).includes(hash)) {
      setActive(hash);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    setSaved(false);
    fetch(`/api/admin/settings/${active}`)
      .then((res) => parseApiJson<{ settings: SharedValue }>(res))
      .then((body) => setValue(body.settings))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [active]);

  async function handleSave() {
    if (!value) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/admin/settings/${active}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      await parseApiJson(res);
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
          <Link href="/admin" className="admin-back-link">
            ← Dashboard
          </Link>
          <h1 className="admin-title">Shared sections</h1>
          <p className="admin-subtitle">
            Edit global content once — product pages only toggle Live for shared
            bands (Why Nirvana, Map, lodging).
          </p>
        </div>
      </div>

      <div className="admin-shared-key-tabs" role="tablist">
        {SHARED_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            className={`admin-btn-sm${active === key ? "" : " admin-btn-sm--ghost"}`}
            onClick={() => {
              setActive(key);
              window.location.hash = key;
            }}
          >
            {LABELS[key]}
          </button>
        ))}
      </div>

      {loading || !value ? (
        <p className="admin-hint">Loading {LABELS[active]}…</p>
      ) : active === "whyNirvana" ? (
        <WhyNirvanaFields
          doc={value as WhyNirvanaContent}
          onChange={setValue}
        />
      ) : active === "siteMap" ? (
        <SiteMapFields doc={value as SiteMapContent} onChange={setValue} />
      ) : active === "reviews" ? (
        <ReviewsFields doc={value as ReviewsContent} onChange={setValue} />
      ) : active === "homeFaqs" || active === "venueFaqs" ? (
        <FaqsFields
          doc={value as HomeFaqsContent | VenueFaqsContent}
          onChange={setValue}
        />
      ) : active === "residentialLife" ? (
        <ResidentialLifeFields
          doc={value as ResidentialLifeContent}
          onChange={setValue}
        />
      ) : active === "retreatAccommodation" ? (
        <RetreatLodgingFields
          doc={value as RetreatAccommodationContent}
          onChange={setValue}
        />
      ) : (
        <CollapsiblePanel title="YTT Hub" defaultOpen>
          <p className="admin-hint">
            Prefer the dedicated YTT Hub editor for full fields.
          </p>
          <Link
            href="/admin/pages/yoga-teacher-training-in-rishikesh-india"
            className="admin-link"
          >
            Open YTT Hub editor →
          </Link>
        </CollapsiblePanel>
      )}

      <AdminSaveBar
        title={LABELS[active]}
        subtitle={`global_settings.${active}`}
        saving={saving}
        saved={saved}
        dirty
        error={error}
        onSave={handleSave}
      />
    </div>
  );
}

/**
 * Why Nirvana shared fields.
 *
 * @param props - Document and change handler
 */
function WhyNirvanaFields({
  doc,
  onChange,
}: {
  doc: WhyNirvanaContent;
  onChange: (next: WhyNirvanaContent) => void;
}) {
  const keys = useStableListKeys(doc.highlights.length);
  return (
    <CollapsiblePanel
      title="Why Nirvana"
      defaultOpen
      description="Shared across course, retreat, venue, and hub pages. Each page only toggles Live."
      actions={
        <SectionLiveField
          id="why-nirvana-live"
          value={doc.live}
          onChange={(live) => onChange({ ...doc, live })}
        />
      }
    >
      {doc.highlights.map((item, index) => (
        <div key={keys.keys[index]} className="admin-nested-card">
          <TextField
            label="Title"
            value={item.title}
            onChange={(title) => {
              const highlights = [...doc.highlights];
              highlights[index] = { ...item, title };
              onChange({ ...doc, highlights });
            }}
          />
          <TextField
            label="Body"
            value={item.body}
            onChange={(body) => {
              const highlights = [...doc.highlights];
              highlights[index] = { ...item, body };
              onChange({ ...doc, highlights });
            }}
            multiline
          />
        </div>
      ))}
      <TextField
        label="Closing"
        value={doc.closing}
        onChange={(closing) => onChange({ ...doc, closing })}
        multiline
      />
    </CollapsiblePanel>
  );
}

/**
 * Shared map embed fields.
 *
 * @param props - Document and change handler
 */
function SiteMapFields({
  doc,
  onChange,
}: {
  doc: SiteMapContent;
  onChange: (next: SiteMapContent) => void;
}) {
  return (
    <CollapsiblePanel
      title="Map"
      defaultOpen
      description="One embed for the whole site. Product pages only toggle Live via Optional sections."
      actions={
        <SectionLiveField
          id="site-map-live"
          value={doc.live}
          onChange={(live) => onChange({ ...doc, live })}
        />
      }
    >
      <div className="admin-grid-2">
        <TextField
          label="Eyebrow"
          value={doc.eyebrow ?? ""}
          onChange={(eyebrow) => onChange({ ...doc, eyebrow })}
        />
        <TextField
          label="Title"
          value={doc.title ?? ""}
          onChange={(title) => onChange({ ...doc, title })}
        />
      </div>
      <TextField
        label="Description"
        value={doc.description ?? ""}
        onChange={(description) => onChange({ ...doc, description })}
        multiline
        rows={2}
      />
      <TextField
        label="Embed URL"
        value={doc.embedUrl}
        onChange={(embedUrl) => onChange({ ...doc, embedUrl })}
        multiline
        rows={2}
      />
      <TextField
        label="Iframe title"
        value={doc.iframeTitle}
        onChange={(iframeTitle) => onChange({ ...doc, iframeTitle })}
      />
    </CollapsiblePanel>
  );
}

/**
 * Reviews shared fields.
 *
 * @param props - Document and change handler
 */
function ReviewsFields({
  doc,
  onChange,
}: {
  doc: ReviewsContent;
  onChange: (next: ReviewsContent) => void;
}) {
  const keys = useStableListKeys(doc.reviews.length);
  return (
    <CollapsiblePanel
      title="Reviews"
      defaultOpen
      actions={
        <SectionLiveField
          id="reviews-live"
          value={doc.live}
          onChange={(live) => onChange({ ...doc, live })}
        />
      }
    >
      {doc.reviews.map((item, index) => (
        <div key={keys.keys[index]} className="admin-nested-card">
          <TextField
            label="Name"
            value={item.name}
            onChange={(name) => {
              const reviews = [...doc.reviews];
              reviews[index] = { ...item, name };
              onChange({ ...doc, reviews });
            }}
          />
          <TextField
            label="Title"
            value={item.title}
            onChange={(title) => {
              const reviews = [...doc.reviews];
              reviews[index] = { ...item, title };
              onChange({ ...doc, reviews });
            }}
          />
          <TextField
            label="Message"
            value={item.message}
            onChange={(message) => {
              const reviews = [...doc.reviews];
              reviews[index] = { ...item, message };
              onChange({ ...doc, reviews });
            }}
            multiline
          />
        </div>
      ))}
    </CollapsiblePanel>
  );
}

/**
 * FAQ list fields for home/venue shared settings.
 *
 * @param props - Document and change handler
 */
function FaqsFields({
  doc,
  onChange,
}: {
  doc: HomeFaqsContent | VenueFaqsContent;
  onChange: (next: HomeFaqsContent | VenueFaqsContent) => void;
}) {
  const keys = useStableListKeys(doc.faqs.length);
  return (
    <CollapsiblePanel
      title="FAQs"
      defaultOpen
      actions={
        <SectionLiveField
          id="shared-faqs-live"
          value={doc.live}
          onChange={(live) => onChange({ ...doc, live })}
        />
      }
    >
      {doc.faqs.map((faq, index) => (
        <div key={keys.keys[index]} className="admin-nested-card">
          <TextField
            label="Question"
            value={faq.question}
            onChange={(question) => {
              const faqs = [...doc.faqs];
              faqs[index] = { ...faq, question };
              onChange({ ...doc, faqs });
            }}
          />
          <TextField
            label="Answer"
            value={faq.answer}
            onChange={(answer) => {
              const faqs = [...doc.faqs];
              faqs[index] = { ...faq, answer };
              onChange({ ...doc, faqs });
            }}
            multiline
          />
        </div>
      ))}
    </CollapsiblePanel>
  );
}

/**
 * Room-type gallery list editor (id, label, description, images).
 *
 * @param props - Galleries and change handler
 */
function RoomGalleriesEditor({
  galleries,
  onChange,
  hint,
}: {
  galleries: SharedAccommodationGallery[];
  onChange: (next: SharedAccommodationGallery[]) => void;
  hint?: string;
}) {
  const keys = useStableListKeys(galleries.length);

  return (
    <div className="admin-field">
      <div className="admin-field-header">
        <div>
          <span className="admin-label">Room types</span>
          {hint ? (
            <p className="admin-hint admin-hint--tight">{hint}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="admin-btn-sm"
          onClick={() => {
            keys.addKey();
            onChange([
              ...galleries,
              {
                id: `room-${galleries.length + 1}`,
                label: "New room type",
                description: "",
                images: [],
              },
            ]);
          }}
        >
          Add room type
        </button>
      </div>
      {galleries.map((gallery, index) => (
        <NestedItemCard
          key={keys.keys[index]}
          title={gallery.label || gallery.id || "Room"}
          index={index}
          onRemove={() => {
            keys.removeKey(index);
            onChange(galleries.filter((_, i) => i !== index));
          }}
        >
          <div className="admin-grid-2">
            <TextField
              label="Id"
              value={gallery.id}
              onChange={(id) => {
                const next = [...galleries];
                next[index] = { ...gallery, id };
                onChange(next);
              }}
              hint="Stable key used by room tabs (e.g. private, 2-shared)"
            />
            <TextField
              label="Label"
              value={gallery.label}
              onChange={(label) => {
                const next = [...galleries];
                next[index] = { ...gallery, label };
                onChange(next);
              }}
            />
          </div>
          <TextField
            label="Description"
            value={gallery.description}
            onChange={(description) => {
              const next = [...galleries];
              next[index] = { ...gallery, description };
              onChange(next);
            }}
            multiline
            rows={2}
          />
          <ImageListField
            label="Room images"
            items={toCmsImages(gallery.images)}
            onChange={(items) => {
              const next = [...galleries];
              next[index] = {
                ...gallery,
                images: toSharedGalleryImages(items),
              };
              onChange(next);
            }}
          />
        </NestedItemCard>
      ))}
    </div>
  );
}

/**
 * Course residential life — lodging (3 room types) and food edited separately.
 *
 * @param props - Document and change handler
 */
function ResidentialLifeFields({
  doc,
  onChange,
}: {
  doc: ResidentialLifeContent;
  onChange: (next: ResidentialLifeContent) => void;
}) {
  const facilityKeys = useStableListKeys(doc.facilities.length);

  return (
    <>
      <CollapsiblePanel
        title="Residential life"
        subtitle="Entire block visibility"
        defaultOpen
        description="When hidden, accommodation and food are omitted on course pages."
        actions={
          <SectionLiveField
            id="residential-life-live"
            value={doc.live}
            onChange={(live) => onChange({ ...doc, live })}
          />
        }
      />
      <CollapsiblePanel
        title="Accommodation / lodging"
        defaultOpen
        description="Private, 2-shared, and 4-shared room galleries with copy."
        actions={
          <SectionLiveField
            id="residential-accommodation-live"
            value={doc.accommodation.live}
            onChange={(live) =>
              onChange({
                ...doc,
                accommodation: { ...doc.accommodation, live },
              })
            }
          />
        }
      >
        <TextField
          label="Stay title"
          value={doc.accommodation.stay.title}
          onChange={(title) =>
            onChange({
              ...doc,
              accommodation: {
                ...doc.accommodation,
                stay: { ...doc.accommodation.stay, title },
              },
            })
          }
        />
        <TextField
          label="Stay description"
          value={doc.accommodation.stay.description}
          onChange={(description) =>
            onChange({
              ...doc,
              accommodation: {
                ...doc.accommodation,
                stay: { ...doc.accommodation.stay, description },
              },
            })
          }
          multiline
        />
        <RoomGalleriesEditor
          galleries={doc.accommodation.galleries}
          hint="Courses expect three room types (private, 2-shared, 4-shared) with separate image sets."
          onChange={(galleries) =>
            onChange({
              ...doc,
              accommodation: { ...doc.accommodation, galleries },
            })
          }
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Campus facilities"
        description="Amenity grid under the accommodation gallery."
      >
        {doc.facilities.map((facility, index) => (
          <NestedItemCard
            key={facilityKeys.keys[index]}
            title={facility.label || "Facility"}
            index={index}
            onRemove={() => {
              facilityKeys.removeKey(index);
              onChange({
                ...doc,
                facilities: doc.facilities.filter((_, i) => i !== index),
              });
            }}
          >
            <div className="admin-grid-2">
              <TextField
                label="Label"
                value={facility.label}
                onChange={(label) => {
                  const facilities = [...doc.facilities];
                  facilities[index] = { ...facility, label };
                  onChange({ ...doc, facilities });
                }}
              />
              <SelectField
                label="Icon"
                value={facility.iconKey}
                options={FACILITY_ICON_OPTIONS}
                onChange={(iconKey) => {
                  const facilities = [...doc.facilities];
                  facilities[index] = { ...facility, iconKey };
                  onChange({ ...doc, facilities });
                }}
              />
            </div>
            <TextField
              label="Note (optional)"
              value={facility.note ?? ""}
              onChange={(note) => {
                const facilities: SharedFacility[] = [...doc.facilities];
                facilities[index] = {
                  ...facility,
                  note: note.trim() || undefined,
                };
                onChange({ ...doc, facilities });
              }}
              hint="e.g. Paid extra in winter"
            />
          </NestedItemCard>
        ))}
        <button
          type="button"
          className="admin-btn-sm"
          onClick={() => {
            facilityKeys.addKey();
            onChange({
              ...doc,
              facilities: [
                ...doc.facilities,
                { label: "New facility", iconKey: "leaf" },
              ],
            });
          }}
        >
          Add facility
        </button>
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Food"
        defaultOpen
        description="Sattvic dining copy and gallery — separate from lodging."
        actions={
          <SectionLiveField
            id="residential-food-live"
            value={doc.food.live}
            onChange={(live) =>
              onChange({
                ...doc,
                food: { ...doc.food, live },
              })
            }
          />
        }
      >
        <TextField
          label="Title"
          value={doc.food.content.title}
          onChange={(title) =>
            onChange({
              ...doc,
              food: {
                ...doc.food,
                content: { ...doc.food.content, title },
              },
            })
          }
        />
        <TextField
          label="Description"
          value={doc.food.content.description}
          onChange={(description) =>
            onChange({
              ...doc,
              food: {
                ...doc.food,
                content: { ...doc.food.content, description },
              },
            })
          }
          multiline
        />
        <StringListField
          label="Points"
          items={doc.food.content.points}
          onChange={(points) =>
            onChange({
              ...doc,
              food: {
                ...doc.food,
                content: { ...doc.food.content, points },
              },
            })
          }
        />
        <TextField
          label="Dietary note"
          value={doc.food.content.dietaryNote}
          onChange={(dietaryNote) =>
            onChange({
              ...doc,
              food: {
                ...doc.food,
                content: { ...doc.food.content, dietaryNote },
              },
            })
          }
          multiline
        />
        <ImageListField
          label="Food gallery"
          items={toCmsImages(doc.food.gallery)}
          onChange={(items) =>
            onChange({
              ...doc,
              food: {
                ...doc.food,
                gallery: toSharedGalleryImages(items),
              },
            })
          }
        />
      </CollapsiblePanel>
    </>
  );
}

/**
 * Retreat lodging defaults — separate from course residential life.
 *
 * @param props - Document and change handler
 */
function RetreatLodgingFields({
  doc,
  onChange,
}: {
  doc: RetreatAccommodationContent;
  onChange: (next: RetreatAccommodationContent) => void;
}) {
  const lodgingLive = doc.accommodation?.live !== false && doc.lodgingLive !== false;
  const foodLive = doc.food?.live !== false && doc.foodLive !== false;

  return (
    <>
      <CollapsiblePanel
        title="Retreat lodging defaults"
        defaultOpen
        description="Shared retreat room/food media. Per-retreat page copy stays on the retreat editor."
        actions={
          <SectionLiveField
            id="retreat-accommodation-live"
            value={doc.live}
            onChange={(live) => onChange({ ...doc, live })}
          />
        }
      />
      <CollapsiblePanel
        title="Lodging / rooms"
        defaultOpen
        actions={
          <SectionLiveField
            id="retreat-lodging-live"
            value={lodgingLive}
            onChange={(live) =>
              onChange({
                ...doc,
                lodgingLive: live,
                accommodation: { live },
              })
            }
          />
        }
      >
        <RoomGalleriesEditor
          galleries={doc.roomGalleries ?? []}
          hint="Retreat room types (typically private + 2-shared) with their own images."
          onChange={(roomGalleries) => onChange({ ...doc, roomGalleries })}
        />
        <StringListField
          label="Default facilities"
          items={doc.defaultFacilities ?? []}
          onChange={(defaultFacilities) =>
            onChange({ ...doc, defaultFacilities })
          }
        />
      </CollapsiblePanel>
      <CollapsiblePanel
        title="Food"
        defaultOpen
        actions={
          <SectionLiveField
            id="retreat-food-live"
            value={foodLive}
            onChange={(live) =>
              onChange({
                ...doc,
                foodLive: live,
                food: { live },
              })
            }
          />
        }
      >
        <StringListField
          label="Meal highlights"
          items={doc.mealHighlights ?? []}
          onChange={(mealHighlights) => onChange({ ...doc, mealHighlights })}
        />
        <ImageListField
          label="Food gallery"
          items={toCmsImages(doc.foodGallery ?? [])}
          onChange={(items) =>
            onChange({
              ...doc,
              foodGallery: toSharedGalleryImages(items),
            })
          }
        />
      </CollapsiblePanel>
    </>
  );
}
