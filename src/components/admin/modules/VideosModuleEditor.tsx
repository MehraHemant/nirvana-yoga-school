"use client";

import { useRef, useState } from "react";
import {
  normalizeVideosModule,
  youtubeUrlsFromItems,
} from "@/content/mappers/videos-module";
import type { VideosModule, VideosModuleItem } from "@/content/types";
import { uploadAdminMedia } from "@/lib/api/admin-client";
import {
  ALLOWED_VIDEO_MIME,
  MAX_VIDEO_UPLOAD_BYTES,
  MAX_VIDEO_UPLOAD_LABEL,
} from "@/lib/cdn/constants";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import { MediaMetadataFields } from "../MediaMetadataFields";
import { SectionIdField } from "../SectionIdField";
import { reorderItems, SortableList, SortableRow } from "../SortableList";
import { TextField } from "../TextField";
import { useStableListKeys } from "../useStableListKeys";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type VideosModuleEditorProps = ModulePanelProps & {
  videos: VideosModule;
  onChange: (videos: VideosModule) => void;
};

/**
 * Commits items and keeps legacy `youtubeUrls` in sync.
 *
 * @param videos - Current module
 * @param items - Next playlist items
 */
function withItems(
  videos: VideosModule,
  items: VideosModuleItem[],
): VideosModule {
  return {
    ...videos,
    items,
    youtubeUrls: youtubeUrlsFromItems(items),
  };
}

/**
 * Admin editor for the page_modules.videos playlist section.
 * Each clip is either a YouTube URL or a Cloudinary video upload.
 *
 * @param props - Videos module config and change handler
 */
export function VideosModuleEditor({
  videos: videosProp,
  onChange,
  panelId = "module-videos",
  step = 10,
  description,
  open,
  onOpenChange,
}: VideosModuleEditorProps) {
  const videos = normalizeVideosModule(videosProp);
  const items = videos.items;
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    items.length,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  /** Sync index for the file input callback (state alone can lag behind click). */
  const uploadIndexRef = useRef<number | null>(null);
  const [uploadIndex, setUploadIndex] = useState<number | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function updateItem(index: number, patch: Partial<VideosModuleItem>) {
    const next = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onChange(withItems(videos, next));
  }

  function setItemType(index: number, type: VideosModuleItem["type"]) {
    if (type === "youtube") {
      updateItem(index, {
        type: "youtube",
        youtubeUrl: items[index]?.youtubeUrl ?? "",
        cloudinaryUrl: undefined,
        publicId: undefined,
        thumbnailUrl: undefined,
        durationSeconds: undefined,
      });
      return;
    }
    updateItem(index, {
      type: "cloudinary",
      youtubeUrl: undefined,
      cloudinaryUrl: items[index]?.cloudinaryUrl ?? "",
      publicId: items[index]?.publicId,
      thumbnailUrl: items[index]?.thumbnailUrl,
      durationSeconds: items[index]?.durationSeconds,
    });
  }

  function removeItem(index: number) {
    removeKey(index);
    onChange(
      withItems(
        videos,
        items.filter((_, i) => i !== index),
      ),
    );
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(withItems(videos, reorderItems(items, fromIndex, toIndex)));
  }

  function addItem(type: VideosModuleItem["type"]) {
    addKey();
    const nextItem: VideosModuleItem =
      type === "youtube"
        ? { type: "youtube", youtubeUrl: "" }
        : { type: "cloudinary", cloudinaryUrl: "" };
    onChange(withItems(videos, [...items, nextItem]));
  }

  function clearUploadDialog() {
    uploadIndexRef.current = null;
    setUploadIndex(null);
    setPendingFile(null);
  }

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const index = uploadIndexRef.current;
    if (!file || index === null) return;

    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      setError(
        `File exceeds ${MAX_VIDEO_UPLOAD_LABEL} (${Math.round(file.size / (1024 * 1024))}MB)`,
      );
      return;
    }

    if (
      !ALLOWED_VIDEO_MIME.includes(
        file.type as (typeof ALLOWED_VIDEO_MIME)[number],
      )
    ) {
      setError("Only MP4, WebM, and QuickTime videos are allowed");
      return;
    }

    setUploadIndex(index);
    setPendingFile(file);
    setCaption("");
    setUploadDescription("");
    setTags([]);
    setError("");
    event.target.value = "";
  }

  async function confirmUpload() {
    const index = uploadIndexRef.current;
    if (!pendingFile || index === null) return;

    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", pendingFile);
    form.append("caption", caption);
    form.append("description", uploadDescription);
    form.append("tags", JSON.stringify(tags));

    try {
      const body = await uploadAdminMedia(form);
      updateItem(index, {
        type: "cloudinary",
        cloudinaryUrl: body.url,
        publicId: body.cdnKey,
        title: items[index]?.title || caption || undefined,
        durationSeconds: body.durationSeconds ?? undefined,
      });
      clearUploadDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="Videos"
      subtitle={`${items.length} clips`}
      description={
        description ??
        "Playlist band on the public page. Add YouTube links or upload videos to Cloudinary."
      }
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={videos.live}
          onChange={(live) => onChange({ ...videos, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={videos._id}
        onChange={(_id) => onChange({ ...videos, _id })}
      />
      <div className="admin-grid-2">
        <TextField
          label="Eyebrow"
          value={videos.eyebrow ?? ""}
          onChange={(eyebrow) => onChange({ ...videos, eyebrow })}
        />
        <TextField
          label="Title"
          value={videos.title ?? ""}
          onChange={(title) => onChange({ ...videos, title })}
        />
      </div>
      <TextField
        label="Description"
        value={videos.description ?? ""}
        onChange={(descriptionValue) =>
          onChange({ ...videos, description: descriptionValue })
        }
        multiline
        rows={2}
      />

      <div className="admin-field">
        <div className="admin-field-header">
          <div>
            <span className="admin-label">Playlist</span>
            <p className="admin-hint admin-hint--tight">
              Per clip: choose YouTube URL or Cloudinary upload. Section stays
              hidden until Live is on and at least one valid clip is set.
            </p>
          </div>
          <div className="admin-field-actions">
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => addItem("youtube")}
            >
              Add YouTube
            </button>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => addItem("cloudinary")}
            >
              Add upload
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty-card">
            <p>No videos yet.</p>
            <div className="admin-empty-card-actions">
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => addItem("youtube")}
              >
                Add YouTube
              </button>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={() => addItem("cloudinary")}
              >
                Add upload
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-compact-table-scroll">
            <div className="admin-compact-table admin-compact-table--form">
              <div className="admin-compact-table-head admin-compact-table-row">
                <span className="admin-compact-col admin-compact-col--num">
                  #
                </span>
                <span className="admin-compact-col admin-compact-col--value">
                  Source
                </span>
                <span className="admin-compact-col admin-compact-col--actions">
                  <span className="sr-only">Actions</span>
                </span>
              </div>
              <SortableList ids={keys} onReorder={handleReorder}>
                {items.map((item, index) => (
                  <SortableRow key={keys[index]} id={keys[index]}>
                    {({ dragHandleProps }) => (
                      <div className="admin-compact-table-row">
                        <span className="admin-compact-col admin-compact-col--num">
                          {index + 1}
                        </span>
                        <span className="admin-compact-col admin-compact-col--value">
                          <div className="admin-stack">
                            <div className="admin-grid-2">
                              <label className="admin-label">
                                Type
                                <select
                                  className="admin-select admin-select--compact"
                                  value={item.type}
                                  onChange={(event) =>
                                    setItemType(
                                      index,
                                      event.target
                                        .value as VideosModuleItem["type"],
                                    )
                                  }
                                >
                                  <option value="youtube">YouTube URL</option>
                                  <option value="cloudinary">
                                    Cloudinary upload
                                  </option>
                                </select>
                              </label>
                              <label className="admin-label">
                                Title
                                <input
                                  className="admin-input admin-input--compact"
                                  value={item.title ?? ""}
                                  placeholder="Optional title"
                                  onChange={(event) =>
                                    updateItem(index, {
                                      title: event.target.value,
                                    })
                                  }
                                />
                              </label>
                            </div>

                            {item.type === "youtube" ? (
                              <label className="admin-label">
                                YouTube URL or id
                                <input
                                  className="admin-input admin-input--compact"
                                  value={item.youtubeUrl ?? ""}
                                  placeholder="https://www.youtube.com/watch?v=…"
                                  onChange={(event) =>
                                    updateItem(index, {
                                      youtubeUrl: event.target.value,
                                    })
                                  }
                                />
                              </label>
                            ) : (
                              <div className="admin-stack">
                                {item.cloudinaryUrl ? (
                                  <p className="admin-hint admin-hint--tight">
                                    Uploaded:{" "}
                                    <a
                                      href={item.cloudinaryUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {item.publicId || "Open video"}
                                    </a>
                                    {item.durationSeconds
                                      ? ` · ${item.durationSeconds}s`
                                      : ""}
                                  </p>
                                ) : (
                                  <p className="admin-hint admin-hint--tight">
                                    No file yet — upload MP4/WebM/MOV (max{" "}
                                    {MAX_VIDEO_UPLOAD_LABEL}).
                                  </p>
                                )}
                                <button
                                  type="button"
                                  className="admin-btn-sm"
                                  disabled={uploading}
                                  onClick={() => {
                                    uploadIndexRef.current = index;
                                    setUploadIndex(index);
                                    setError("");
                                    fileRef.current?.click();
                                  }}
                                >
                                  {item.cloudinaryUrl
                                    ? "Replace video"
                                    : "Upload to Cloudinary"}
                                </button>
                              </div>
                            )}
                          </div>
                        </span>
                        <span className="admin-compact-col admin-compact-col--actions">
                          <ListRowActions
                            dragHandleProps={dragHandleProps}
                            onRemove={() => removeItem(index)}
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
        {error ? <p className="admin-error">{error}</p> : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ALLOWED_VIDEO_MIME.join(",")}
        className="sr-only"
        onChange={onFileSelected}
      />

      {pendingFile && uploadIndex !== null ? (
        <div className="admin-modal-layer">
          <button
            type="button"
            className="admin-modal-backdrop"
            onClick={clearUploadDialog}
            aria-label="Close upload dialog"
          />
          <div
            className="admin-modal admin-modal--library"
            role="dialog"
            aria-modal="true"
            aria-label="Upload video details"
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Upload video</h2>
              <button
                type="button"
                className="admin-btn-icon"
                onClick={clearUploadDialog}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="admin-hint admin-hint--tight">
              {pendingFile.name} ·{" "}
              {(pendingFile.size / (1024 * 1024)).toFixed(1)}MB
            </p>
            <MediaMetadataFields
              caption={caption}
              description={uploadDescription}
              tags={tags}
              onCaptionChange={setCaption}
              onDescriptionChange={setUploadDescription}
              onTagsChange={setTags}
            />
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-sm admin-btn-sm--ghost"
                onClick={clearUploadDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={uploading}
                onClick={confirmUpload}
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </CollapsiblePanel>
  );
}
