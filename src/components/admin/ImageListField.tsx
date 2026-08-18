"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  type CmsInteractiveImage,
  normalizeCmsImage,
} from "@/content/types/cms-image";
import type { AdminMediaUploadResponse } from "@/lib/types/admin-api";
import {
  BulkMediaUploadModal,
  type BulkUploadDraft,
  applyDefaultsToDrafts,
  buildBulkUploadDrafts,
  revokeBulkUploadPreviews,
} from "./BulkMediaUploadModal";
import { Trash } from "@/icons";
import { ListRowActions } from "./ListRowActions";
import { MediaMultiPicker } from "./MediaMultiPicker";
import {
  DragHandle,
  reorderItems,
  SortableList,
  SortableRow,
} from "./SortableList";
import { useStableListKeys } from "./useStableListKeys";

type ImageListFieldProps = {
  label: string;
  /** Legacy URL strings or rich interactive images */
  items: Array<string | CmsInteractiveImage>;
  onChange: (items: CmsInteractiveImage[]) => void;
  hint?: string;
  /**
   * Library source: lodging `media_images` for rooms/food, CMS assets otherwise.
   */
  librarySource?: "assets" | "lodging";
  /** Prefill Library tag filter (canonical media tag). */
  libraryTag?: string;
  /** Prefill upload tags (first tag becomes lodging media tag). */
  defaultTags?: string[];
  /** Table rows (default), compact thumb grid, or card slide rows */
  layout?: "table" | "gallery" | "slides";
};

/**
 * Editable image gallery — Library multi-add + Upload only (no raw URL paste).
 *
 * @param props - Label, image items, and change handler
 */
export function ImageListField({
  label,
  items,
  onChange,
  hint,
  librarySource = "lodging",
  libraryTag = "",
  defaultTags,
  layout = "table",
}: ImageListFieldProps) {
  const normalized = items.map(normalizeCmsImage);
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    normalized.length,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drafts, setDrafts] = useState<BulkUploadDraft[]>([]);
  const [defaultTitle, setDefaultTitle] = useState("");
  const [defaultAlt, setDefaultAlt] = useState("");
  const [tags, setTags] = useState<string[]>(() =>
    defaultTags?.length
      ? defaultTags
      : libraryTag.trim()
        ? [libraryTag.trim()]
        : [],
  );
  const [error, setError] = useState("");

  function updateItem(index: number, next: CmsInteractiveImage) {
    const copy = [...normalized];
    copy[index] = normalizeCmsImage(next);
    onChange(copy);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(reorderItems(normalized, fromIndex, toIndex));
  }

  /**
   * Appends newly picked or uploaded images, skipping duplicate URLs.
   * Extends stable row keys before onChange so SortableList never sees
   * undefined ids on the first paint after multi-add.
   *
   * @param nextItems - Images to append
   */
  function appendImages(nextItems: CmsInteractiveImage[]) {
    const existingUrls = new Set(
      normalized.map((item) => item.url.trim()).filter(Boolean),
    );
    const existingMediaIds = new Set(
      normalized
        .map((item) => item.mediaImageId?.trim())
        .filter((id): id is string => Boolean(id)),
    );
    const toAdd = nextItems.filter((item) => {
      const url = item.url.trim();
      if (!url || existingUrls.has(url)) return false;
      const mediaId = item.mediaImageId?.trim();
      if (mediaId && existingMediaIds.has(mediaId)) return false;
      return true;
    });
    if (toAdd.length === 0) return;
    for (let i = 0; i < toAdd.length; i++) {
      addKey();
    }
    onChange([...normalized, ...toAdd]);
  }

  function openUploadPicker() {
    fileRef.current?.click();
  }

  function handleDefaultTitleChange(nextTitle: string) {
    setDefaultTitle(nextTitle);
    setDrafts((prev) => applyDefaultsToDrafts(prev, nextTitle, defaultAlt));
  }

  function handleDefaultAltChange(nextAlt: string) {
    setDefaultAlt(nextAlt);
    setDrafts((prev) => applyDefaultsToDrafts(prev, defaultTitle, nextAlt));
  }

  function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;
    revokeBulkUploadPreviews(drafts);
    setDrafts(buildBulkUploadDrafts(files, defaultTitle, defaultAlt));
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
   * Maps upload API results into gallery image rows.
   *
   * @param results - Upload responses
   */
  function handleUploaded(results: AdminMediaUploadResponse[]) {
    appendImages(
      results.map((result) => ({
        url: result.url,
        alt: result.alt ?? result.caption ?? "",
        mediaAssetId: result.id,
        mediaImageId: result.mediaImageId ?? undefined,
        clickAction: "fullscreen" as const,
      })),
    );
    setDefaultTitle("");
    setDefaultAlt("");
    setTags([]);
  }

  const actionButtons = (
    <div className="admin-image-actions">
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() => setLibraryOpen(true)}
      >
        Library
      </button>
      <button type="button" className="admin-btn-sm" onClick={openUploadPicker}>
        Upload
      </button>
    </div>
  );

  const hasImages = normalized.length > 0;
  const slideCountLabel =
    normalized.length === 1 ? "1 slide" : `${normalized.length} slides`;

  return (
    <div
      className={`admin-field${
        layout === "slides" ? " admin-image-slides-field" : ""
      }`}
    >
      <div className="admin-field-header">
        <div>
          <div
            className={
              layout === "slides" ? "admin-image-slides__title-row" : undefined
            }
          >
            <span className="admin-label">{label}</span>
            {layout === "slides" && hasImages ? (
              <span className="admin-image-slides__count">{slideCountLabel}</span>
            ) : null}
          </div>
          {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
        </div>
        {actionButtons}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={onFilesSelected}
      />

      {error ? <p className="admin-error">{error}</p> : null}

      {!hasImages ? (
        <div className="admin-empty-card admin-empty-card--compact">
          <p>
            {layout === "slides"
              ? "No slides yet. Add images from the library or upload new ones."
              : "No images yet."}
          </p>
        </div>
      ) : layout === "slides" ? (
        <SortableList
          ids={keys}
          onReorder={handleReorder}
          className="admin-image-slides__list"
        >
          {normalized.map((item, index) => {
            const rowKey = keys[index] ?? `img-${index}`;
            return (
              <SortableRow
                key={rowKey}
                id={rowKey}
                className="admin-image-slides__item"
              >
                {({ dragHandleProps, isDragging }) => (
                  <div
                    className={`admin-image-slides__row${
                      isDragging ? " admin-image-slides__row--dragging" : ""
                    }`}
                  >
                    <DragHandle dragHandleProps={dragHandleProps} />
                    <div className="admin-image-slides__thumb">
                      <span className="admin-image-slides__badge">
                        {index + 1}
                      </span>
                      {item.url ? (
                        <Image
                          src={item.url}
                          alt=""
                          width={160}
                          height={120}
                          className="admin-image-slides__img"
                          unoptimized
                        />
                      ) : (
                        <span className="admin-image-slides__empty">—</span>
                      )}
                    </div>
                    <div className="admin-image-slides__body">
                      <label
                        htmlFor={`${rowKey}-alt`}
                        className="admin-image-slides__alt-label"
                      >
                        Alt text
                      </label>
                      <input
                        id={`${rowKey}-alt`}
                        className="admin-input admin-input--compact"
                        type="text"
                        value={item.alt ?? ""}
                        placeholder="Describe the image"
                        aria-label={`Alt text for slide ${index + 1}`}
                        onChange={(event) =>
                          updateItem(index, {
                            ...item,
                            alt: event.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn--sm admin-icon-btn--danger"
                      aria-label={`Remove slide ${index + 1}`}
                      title="Remove"
                      onClick={() => {
                        removeKey(index);
                        onChange(normalized.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                )}
              </SortableRow>
            );
          })}
        </SortableList>
      ) : layout === "gallery" ? (
        <SortableList
          ids={keys}
          onReorder={handleReorder}
          layout="grid"
          className="admin-image-gallery"
        >
          {normalized.map((item, index) => {
            const rowKey = keys[index] ?? `img-${index}`;
            return (
              <SortableRow
                key={rowKey}
                id={rowKey}
                className="admin-image-gallery__tile"
              >
                {({ dragHandleProps }) => (
                  <>
                    <div className="admin-image-gallery__thumb">
                      {item.url ? (
                        <Image
                          src={item.url}
                          alt=""
                          width={160}
                          height={120}
                          className="admin-image-gallery__img"
                          unoptimized
                        />
                      ) : (
                        <span className="admin-image-gallery__empty">—</span>
                      )}
                    </div>
                    <input
                      id={`${rowKey}-alt`}
                      className="admin-input admin-input--compact"
                      type="text"
                      value={item.alt ?? ""}
                      placeholder="Alt text"
                      aria-label={`Alt text for image ${index + 1}`}
                      onChange={(event) =>
                        updateItem(index, {
                          ...item,
                          alt: event.target.value,
                        })
                      }
                    />
                    <div className="admin-image-gallery__actions">
                      <ListRowActions
                        dragHandleProps={dragHandleProps}
                        onRemove={() => {
                          removeKey(index);
                          onChange(normalized.filter((_, i) => i !== index));
                        }}
                      />
                    </div>
                  </>
                )}
              </SortableRow>
            );
          })}
        </SortableList>
      ) : (
        <div className="admin-compact-table-scroll">
          <div className="admin-compact-table admin-compact-table--form admin-compact-table--images">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--image">
                Image
              </span>
              <span className="admin-compact-col admin-compact-col--alt">
                Alt text
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <span className="sr-only">Actions</span>
              </span>
            </div>

            <SortableList ids={keys} onReorder={handleReorder}>
              {normalized.map((item, index) => {
                const rowKey = keys[index] ?? `img-${index}`;
                return (
                  <SortableRow key={rowKey} id={rowKey}>
                    {({ dragHandleProps }) => (
                      <div className="admin-compact-table-row admin-compact-table-row--tall">
                        <span className="admin-compact-col admin-compact-col--num">
                          {index + 1}
                        </span>
                        <span className="admin-compact-col admin-compact-col--image">
                          <div className="admin-image-cell">
                            {item.url ? (
                              <div className="admin-image-preview admin-image-preview--list">
                                <Image
                                  src={item.url}
                                  alt=""
                                  width={136}
                                  height={56}
                                  className="admin-image-preview-img"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="admin-image-preview admin-image-preview--empty">
                                —
                              </div>
                            )}
                          </div>
                        </span>
                        <span className="admin-compact-col admin-compact-col--alt">
                          <input
                            id={`${rowKey}-alt`}
                            className="admin-input admin-input--compact"
                            type="text"
                            value={item.alt ?? ""}
                            placeholder="Describe the image"
                            aria-label={`Alt text for image ${index + 1}`}
                            onChange={(event) =>
                              updateItem(index, {
                                ...item,
                                alt: event.target.value,
                              })
                            }
                          />
                        </span>
                        <span className="admin-compact-col admin-compact-col--actions">
                          <ListRowActions
                            dragHandleProps={dragHandleProps}
                            onRemove={() => {
                              removeKey(index);
                              onChange(
                                normalized.filter((_, i) => i !== index),
                              );
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </SortableRow>
                );
              })}
            </SortableList>
          </div>
        </div>
      )}

      <MediaMultiPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        source={librarySource}
        initialTag={libraryTag}
        title={`Add images — ${label}`}
        onConfirm={(picked) => {
          appendImages(
            picked.map((item) => ({
              url: item.url,
              alt: item.alt ?? item.title ?? "",
              mediaAssetId:
                librarySource === "assets" ? item.mediaAssetId : undefined,
              // Never store media_assets ids as mediaImageId (room_images FK).
              mediaImageId: item.mediaImageId,
              clickAction: "fullscreen" as const,
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
        onDefaultTitleChange={setDefaultTitle}
        onDefaultAltChange={setDefaultAlt}
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
            prev.map((draft) => ({
              ...draft,
              title: defaultTitle || draft.title,
              alt: defaultAlt || defaultTitle || draft.alt,
            })),
          );
        }}
        onUploaded={handleUploaded}
        onError={setError}
      />
    </div>
  );
}
