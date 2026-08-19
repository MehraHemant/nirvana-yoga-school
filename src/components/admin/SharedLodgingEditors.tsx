"use client";

import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageListField } from "@/components/admin/ImageListField";
import { ListRowActions } from "@/components/admin/ListRowActions";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import {
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import { StringListField } from "@/components/admin/StringListField";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { coerceSharedAccommodationMeta } from "@/content/mappers/residential-life";
import type { SharedAccommodationMeta } from "@/content/mappers/residential-life";
import type { CmsInteractiveImage } from "@/content/types/cms-image";
import type {
  SharedFacility,
  SharedFoodContent,
  SharedGalleryImage,
} from "@/content/types/shared-sections";
import { createEmptySharedFood } from "@/lib/cms/structural-defaults";

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
    mediaAssetId: item.mediaAssetId,
    mediaImageId: item.mediaImageId,
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
    mediaAssetId: image.mediaAssetId,
    mediaImageId: image.mediaImageId,
    clickAction: image.clickAction ?? "fullscreen",
    redirectUrl: image.redirectUrl ?? "",
  }));
}

/**
 * Campus facilities editor for shared accommodation meta.
 *
 * @param props - Facilities array and change handler
 */
function CampusFacilitiesEditor({
  facilities,
  onChange,
}: {
  facilities: SharedFacility[];
  onChange: (next: SharedFacility[]) => void;
}) {
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    facilities.length,
  );

  /**
   * Reorders facilities after a drag-and-drop move.
   *
   * @param fromIndex - Source index
   * @param toIndex - Destination index
   */
  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(reorderItems(facilities, fromIndex, toIndex));
  }

  /**
   * Patches one facility row.
   *
   * @param index - Row index
   * @param patch - Partial facility fields
   */
  function patchFacility(index: number, patch: Partial<SharedFacility>) {
    const next = [...facilities];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <div className="admin-field">
      {facilities.length === 0 ? (
        <div className="admin-empty-card">
          <p>No facilities yet.</p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              addKey();
              onChange([{ label: "", iconKey: "leaf" }]);
            }}
          >
            Add first facility
          </button>
        </div>
      ) : (
        <div className="admin-compact-table-scroll">
          <div className="admin-compact-table admin-compact-table--form admin-compact-table--facilities">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--label">
                Label
              </span>
              <span className="admin-compact-col admin-compact-col--icon">
                Icon
              </span>
              <span className="admin-compact-col admin-compact-col--note">
                Note
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <span className="sr-only">Actions</span>
              </span>
            </div>
            <SortableList ids={keys} onReorder={handleReorder}>
              {facilities.map((facility, index) => (
                <SortableRow key={keys[index]} id={keys[index]}>
                  {({ dragHandleProps }) => (
                    <div className="admin-compact-table-row">
                      <span className="admin-compact-col admin-compact-col--num">
                        {index + 1}
                      </span>
                      <span className="admin-compact-col admin-compact-col--label">
                        <input
                          className="admin-input admin-input--compact"
                          value={facility.label}
                          placeholder="e.g. Free Wi‑Fi"
                          onChange={(event) =>
                            patchFacility(index, {
                              label: event.target.value,
                            })
                          }
                        />
                      </span>
                      <span className="admin-compact-col admin-compact-col--icon">
                        <select
                          className="admin-select admin-select--compact"
                          value={facility.iconKey}
                          onChange={(event) =>
                            patchFacility(index, {
                              iconKey: event.target.value,
                            })
                          }
                          aria-label={`Icon for facility ${index + 1}`}
                        >
                          {FACILITY_ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </span>
                      <span className="admin-compact-col admin-compact-col--note">
                        <input
                          className="admin-input admin-input--compact"
                          value={facility.note ?? ""}
                          placeholder="Optional note"
                          onChange={(event) =>
                            patchFacility(index, {
                              note: event.target.value.trim() || undefined,
                            })
                          }
                        />
                      </span>
                      <span className="admin-compact-col admin-compact-col--actions">
                        <ListRowActions
                          dragHandleProps={dragHandleProps}
                          onRemove={() => {
                            removeKey(index);
                            onChange(facilities.filter((_, i) => i !== index));
                          }}
                        />
                      </span>
                    </div>
                  )}
                </SortableRow>
              ))}
            </SortableList>
          </div>
        </div>
      )}
      {facilities.length > 0 ? (
        <button
          type="button"
          className="admin-btn-sm"
          onClick={() => {
            addKey();
            onChange([...facilities, { label: "", iconKey: "leaf" }]);
          }}
        >
          Add facility
        </button>
      ) : null}
    </div>
  );
}

export type { SharedAccommodationMeta } from "@/content/mappers/residential-life";

type SharedAccommodationMetaFieldsProps = {
  /** Stay intro + facilities for a catalog */
  doc: SharedAccommodationMeta;
  /** Change handler */
  onChange: (next: SharedAccommodationMeta) => void;
  /** Course vs retreat label */
  catalogLabel: string;
};

/**
 * Shared stay intro + campus facilities (rooms live in the rooms catalog).
 *
 * @param props - Meta document and change handler
 */
export function SharedAccommodationMetaFields({
  doc,
  onChange,
  catalogLabel,
}: SharedAccommodationMetaFieldsProps) {
  const safe = coerceSharedAccommodationMeta(doc);

  return (
    <div className="admin-lodging-editor">
      <CollapsiblePanel
        id="lodging-stay"
        title={`${catalogLabel} stay overview`}
        description="Intro copy shown above the shared room gallery on product pages."
        defaultOpen
        actions={
          <SectionLiveField
            id={`shared-acc-meta-live-${catalogLabel}`}
            value={safe.live !== false}
            onChange={(live) => onChange({ ...safe, live })}
          />
        }
      >
        <div className="admin-lodging-editor__fields">
          <TextField
            label="Eyebrow"
            hint='Small label above the section heading (e.g. "Residential Life").'
            value={safe.eyebrow ?? ""}
            onChange={(eyebrow) => onChange({ ...safe, eyebrow })}
          />
          <TextField
            label="Section title"
            hint="Main heading on the public lodging section (e.g. Ashram Accommodation)."
            value={safe.title ?? ""}
            onChange={(title) => onChange({ ...safe, title })}
          />
          <TextField
            label="Stay title"
            value={safe.stay.title}
            onChange={(title) =>
              onChange({ ...safe, stay: { ...safe.stay, title } })
            }
          />
          <TextField
            label="Stay description"
            value={safe.stay.description}
            onChange={(description) =>
              onChange({ ...safe, stay: { ...safe.stay, description } })
            }
            multiline
          />
        </div>
      </CollapsiblePanel>
      <CollapsiblePanel
        id="lodging-facilities"
        title="Campus facilities"
        subtitle={`${safe.facilities.length} amenities`}
        description="Shown under the accommodation gallery on product pages."
        defaultOpen
      >
        <CampusFacilitiesEditor
          facilities={safe.facilities}
          onChange={(facilities) => onChange({ ...safe, facilities })}
        />
      </CollapsiblePanel>
    </div>
  );
}

type SharedFoodFieldsProps = {
  /** Shared food document */
  doc: SharedFoodContent;
  /** Change handler */
  onChange: (next: SharedFoodContent) => void;
  /** Course vs retreat label */
  catalogLabel: string;
};

/**
 * Shared sattvic food editor for courseFood / retreatFood settings.
 *
 * @param props - Food document and change handler
 */
export function SharedFoodFields({
  doc,
  onChange,
  catalogLabel,
}: SharedFoodFieldsProps) {
  const safe = {
    ...createEmptySharedFood(),
    ...doc,
    content: { ...createEmptySharedFood().content, ...doc.content },
    gallery: doc.gallery ?? [],
  };
  const galleryCount = safe.gallery.length;
  const pointsCount = safe.content.points?.length ?? 0;

  return (
    <div className="admin-food-editor">
      <CollapsiblePanel
        id={
          catalogLabel === "Retreat"
            ? "shared-retreat-food"
            : "shared-course-food"
        }
        title={`${catalogLabel} food`}
        subtitle={`${pointsCount} points · ${galleryCount} image${galleryCount === 1 ? "" : "s"}`}
        description="Shared sattvic dining for matching product pages."
        defaultOpen
        actions={
          <SectionLiveField
            id={`shared-food-live-${catalogLabel}`}
            value={safe.live !== false}
            onChange={(live) => onChange({ ...safe, live })}
          />
        }
      >
        <div className="admin-food-editor__section">
          <TextField
            label="Title"
            value={safe.content.title}
            onChange={(title) =>
              onChange({
                ...safe,
                content: { ...safe.content, title },
              })
            }
          />
          <TextField
            label="Description"
            value={safe.content.description}
            onChange={(description) =>
              onChange({
                ...safe,
                content: { ...safe.content, description },
              })
            }
            multiline
          />
          <StringListField
            label="Points"
            items={safe.content.points}
            onChange={(points) =>
              onChange({
                ...safe,
                content: { ...safe.content, points },
              })
            }
          />
          <TextField
            label="Dietary note"
            value={safe.content.dietaryNote}
            onChange={(dietaryNote) =>
              onChange({
                ...safe,
                content: { ...safe.content, dietaryNote },
              })
            }
            multiline
          />
        </div>

        <div className="admin-food-editor__section">
          <ImageListField
            label="Food images"
            layout="gallery"
            librarySource="lodging"
            libraryTag="food"
            defaultTags={["food"]}
            hint="Library or upload — tagged as food"
            items={toCmsImages(safe.gallery)}
            onChange={(items) =>
              onChange({
                ...safe,
                gallery: toSharedGalleryImages(items),
              })
            }
          />
        </div>
      </CollapsiblePanel>
    </div>
  );
}
