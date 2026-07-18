"use client";

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
  ResidentialLifeContent,
  RetreatAccommodationContent,
  SharedAccommodationGallery,
  SharedFacility,
  SharedGalleryImage,
} from "@/content/types/shared-sections";

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
          {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
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
 * Per-page residential life editor — lodging (room types) and food.
 * Used on course / venue / hub / kirtan page admins (not Shared sections).
 *
 * @param props - Document and change handler
 */
export function ResidentialLifeFields({
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
        description="When hidden, accommodation and food are omitted on this page."
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
 * Per-page retreat lodging + food editor (room galleries, meal highlights).
 * Saved on the retreat page modules — not Shared sections.
 *
 * @param props - Document and change handler
 */
export function RetreatLodgingFields({
  doc,
  onChange,
}: {
  doc: RetreatAccommodationContent;
  onChange: (next: RetreatAccommodationContent) => void;
}) {
  const lodgingLive =
    doc.accommodation?.live !== false && doc.lodgingLive !== false;
  const foodLive = doc.food?.live !== false && doc.foodLive !== false;

  return (
    <>
      <CollapsiblePanel
        title="Retreat lodging"
        defaultOpen
        description="Room and food media for this retreat page."
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
