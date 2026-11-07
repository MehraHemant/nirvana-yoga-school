"use client";

import { useRef, useState } from "react";
import type { HomeGalleryItem } from "@/content/types/dedicated-pages";
import { cloudinarySizedUrl } from "@/lib/cdn/cloudinary-thumb-url";
import type { AdminMediaUploadResponse } from "@/lib/types/admin-api";
import {
  applyDefaultsToDrafts,
  BulkMediaUploadModal,
  type BulkUploadDraft,
  buildBulkUploadDrafts,
  revokeBulkUploadPreviews,
} from "./BulkMediaUploadModal";
import { MediaMultiPicker } from "./MediaMultiPicker";
import { SelectField } from "./SelectField";
import { useStableListKeys } from "./useStableListKeys";

type GalleryCategoryOption = {
  value: string;
  label: string;
};

type HomeGalleryItemsEditorProps = {
  /** Gallery rows stored on the homepage section */
  items: HomeGalleryItem[];
  /** Category ids and labels shown in the filter */
  categories: GalleryCategoryOption[];
  /** Replaces the full item list */
  onChange: (items: HomeGalleryItem[]) => void;
};

/**
 * Coerces a category id into the homepage gallery item union.
 *
 * @param value - Category id from the editor
 */
function asGalleryCategory(value: string): HomeGalleryItem["category"] {
  return value as HomeGalleryItem["category"];
}

/**
 * Homepage gallery rows with multi-image upload and library pick per category.
 *
 * @param props - Items, category options, and change handler
 */
export function HomeGalleryItemsEditor({
  items,
  categories,
  onChange,
}: HomeGalleryItemsEditorProps) {
  const listKeys = useStableListKeys(items.length);
  const fileRef = useRef<HTMLInputElement>(null);
  const [targetCategory, setTargetCategory] = useState(
    categories[0]?.value ?? "practice",
  );
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drafts, setDrafts] = useState<BulkUploadDraft[]>([]);
  const [defaultTitle, setDefaultTitle] = useState("");
  const [defaultAlt, setDefaultAlt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");

  const categoryValue = categories.some(
    (category) => category.value === targetCategory,
  )
    ? targetCategory
    : (categories[0]?.value ?? "practice");
  const categoryLabel =
    categories.find((category) => category.value === categoryValue)?.label ??
    categoryValue;

  /**
   * Appends gallery rows and keeps list keys aligned.
   *
   * @param next - New rows for the selected category
   */
  function appendItems(next: HomeGalleryItem[]) {
    if (next.length === 0) return;
    for (let index = 0; index < next.length; index += 1) {
      listKeys.addKey();
    }
    onChange([...items, ...next]);
  }

  /**
   * Patches one gallery row.
   *
   * @param index - Row index in the flat list
   * @param patch - Fields to replace
   */
  function patchItem(index: number, patch: Partial<HomeGalleryItem>) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  /**
   * Removes one gallery row.
   *
   * @param index - Row index in the flat list
   */
  function removeItem(index: number) {
    listKeys.removeKey(index);
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addBlank() {
    listKeys.addKey();
    onChange([
      ...items,
      {
        src: "",
        alt: "",
        title: "",
        category: asGalleryCategory(categoryValue),
      },
    ]);
  }

  function openUploadPicker() {
    fileRef.current?.click();
  }

  function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;
    const title = categoryLabel;
    const alt = categoryLabel;
    setDefaultTitle(title);
    setDefaultAlt(alt);
    revokeBulkUploadPreviews(drafts);
    setDrafts(buildBulkUploadDrafts(files, title, alt));
    setUploadOpen(true);
    setError("");
    event.target.value = "";
  }

  function closeUpload() {
    revokeBulkUploadPreviews(drafts);
    setDrafts([]);
    setUploadOpen(false);
  }

  /**
   * Turns finished uploads into gallery rows on the selected category.
   *
   * @param results - Uploaded media records
   */
  function handleUploaded(results: AdminMediaUploadResponse[]) {
    appendItems(
      results
        .filter((result) => result.url)
        .map((result) => ({
          src: result.url,
          alt: result.alt ?? result.caption ?? "",
          title: result.caption ?? "",
          category: asGalleryCategory(categoryValue),
        })),
    );
    setDefaultTitle("");
    setDefaultAlt("");
    setTags([]);
  }

  const groups = groupItemsByCategory(items, categories);

  return (
    <>
      <div className="admin-nested-card">
        <div className="admin-gallery-section-toolbar">
          <strong>Add images to a category</strong>
          <span className="admin-hint" style={{ margin: 0 }}>
            {items.length} image{items.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="admin-gallery-section-toolbar">
          <div style={{ flex: "1 1 16rem", minWidth: "14rem" }}>
            <SelectField
              id="gallery-bulk-category"
              label="Category"
              value={categoryValue}
              options={categories}
              onChange={setTargetCategory}
            />
          </div>
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn-sm"
              onClick={openUploadPicker}
            >
              Upload images
            </button>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => setLibraryOpen(true)}
            >
              Library
            </button>
          </div>
        </div>
        <p className="admin-hint">
          Upload or pick several images at once. They are all added to{" "}
          {categoryLabel}.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={onFilesSelected}
        />
        {error ? <p className="admin-error">{error}</p> : null}
      </div>

      <div className="admin-gallery-groups">
        {groups.map((group) => (
          <div key={group.id} className="admin-stack">
            <p className="admin-hint" style={{ margin: 0 }}>
              {`${group.label} · ${group.rows.length} image${group.rows.length === 1 ? "" : "s"}`}
            </p>
            <div className="admin-gallery-image-grid">
              {group.rows.map(({ item, index }) => {
                const rowKey =
                  listKeys.keys[index] ?? `gallery-${group.id}-${index}`;
                return (
                  <GalleryImageTile
                    key={rowKey}
                    item={item}
                    onTitleChange={(title) => patchItem(index, { title })}
                    onAltChange={(alt) => patchItem(index, { alt })}
                    onRemove={() => removeItem(index)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="admin-btn-sm" onClick={addBlank}>
        Add gallery item
      </button>

      <MediaMultiPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        source="assets"
        title={`Add images — ${categoryLabel}`}
        onConfirm={(picked) => {
          const existing = new Set(items.map((item) => item.src));
          appendItems(
            picked
              .filter((item) => item.url && !existing.has(item.url))
              .map((item) => ({
                src: item.url,
                alt: item.alt ?? "",
                title: item.title ?? "",
                category: asGalleryCategory(categoryValue),
              })),
          );
        }}
      />

      <BulkMediaUploadModal
        open={uploadOpen}
        drafts={drafts}
        onClose={closeUpload}
        defaultTitle={defaultTitle}
        defaultAlt={defaultAlt}
        tags={tags}
        onDefaultTitleChange={(nextTitle) => {
          setDefaultTitle(nextTitle);
          setDrafts((prev) =>
            applyDefaultsToDrafts(prev, nextTitle, defaultAlt),
          );
        }}
        onDefaultAltChange={(nextAlt) => {
          setDefaultAlt(nextAlt);
          setDrafts((prev) =>
            applyDefaultsToDrafts(prev, defaultTitle, nextAlt),
          );
        }}
        onTagsChange={setTags}
        onDraftChange={(key, patch) => {
          setDrafts((prev) =>
            prev.map((draft) =>
              draft.key === key ? { ...draft, ...patch } : draft,
            ),
          );
        }}
        onApplyDefaults={() => {
          setDrafts((prev) =>
            applyDefaultsToDrafts(prev, defaultTitle, defaultAlt),
          );
        }}
        onUploaded={handleUploaded}
        onError={setError}
      />
    </>
  );
}

type GalleryImageTileProps = {
  /** Gallery row shown in the grid */
  item: HomeGalleryItem;
  /** Writes the caption shown under the photo */
  onTitleChange: (title: string) => void;
  /** Writes the image alt text */
  onAltChange: (alt: string) => void;
  /** Removes this image from the gallery */
  onRemove: () => void;
};

/**
 * Square gallery preview with inline title and alt, plus remove.
 *
 * @param props - Image, caption handlers, and remove action
 */
function GalleryImageTile({
  item,
  onTitleChange,
  onAltChange,
  onRemove,
}: GalleryImageTileProps) {
  return (
    <div className="admin-gallery-tile">
      <div className="admin-gallery-tile-pick">
        {item.src ? (
          // biome-ignore lint/performance/noImgElement: admin preview of a CMS url
          <img
            className="admin-gallery-tile-img"
            src={cloudinarySizedUrl(item.src, 640, "auto:best")}
            alt=""
          />
        ) : (
          <span className="admin-gallery-tile-placeholder">No image</span>
        )}
      </div>
      <div className="admin-gallery-tile-bar">
        <div className="admin-gallery-tile-copy">
          <input
            className="admin-gallery-tile-title"
            value={item.title}
            aria-label="Gallery title"
            placeholder="Title"
            onChange={(event) => onTitleChange(event.target.value)}
          />
          <input
            className="admin-gallery-tile-alt"
            value={item.alt}
            aria-label="Alt text"
            placeholder="Alt"
            onChange={(event) => onAltChange(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="admin-btn-xs admin-btn-xs--danger"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

type GroupedGalleryRow = {
  item: HomeGalleryItem;
  index: number;
};

/**
 * Groups gallery rows by category, following the category option order.
 *
 * @param items - Flat gallery rows
 * @param categories - Editor category options
 */
function groupItemsByCategory(
  items: HomeGalleryItem[],
  categories: GalleryCategoryOption[],
) {
  const byId = new Map<string, GroupedGalleryRow[]>();
  items.forEach((item, index) => {
    const id = item.category || categories[0]?.value || "practice";
    const rows = byId.get(id) ?? [];
    rows.push({ item, index });
    byId.set(id, rows);
  });

  const groups: Array<{
    id: string;
    label: string;
    rows: GroupedGalleryRow[];
  }> = [];
  const seen = new Set<string>();

  for (const category of categories) {
    seen.add(category.value);
    const rows = byId.get(category.value);
    if (rows?.length) {
      groups.push({ id: category.value, label: category.label, rows });
    }
  }

  for (const [id, rows] of byId) {
    if (!seen.has(id) && rows.length) {
      groups.push({ id, label: id, rows });
    }
  }

  return groups;
}
