"use client";

import { useMemo, useState } from "react";
import { uploadAdminMedia } from "@/lib/api/admin-client";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/cdn/constants";
import { formatMediaUploadSize, MEDIA_TAG_PRESETS } from "@/lib/cdn/media-tags";
import type { AdminMediaUploadResponse } from "@/lib/types/admin-api";
import { TextField } from "./TextField";

export type BulkUploadDraft = {
  /** Stable key for list rendering */
  key: string;
  file: File;
  title: string;
  alt: string;
  previewUrl: string;
};

type BulkMediaUploadModalProps = {
  open: boolean;
  drafts: BulkUploadDraft[];
  onClose: () => void;
  /** Shared defaults applied to every draft when changed */
  defaultTitle: string;
  defaultAlt: string;
  tags: string[];
  onDefaultTitleChange: (value: string) => void;
  onDefaultAltChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onDraftChange: (
    key: string,
    patch: Partial<Pick<BulkUploadDraft, "title" | "alt">>,
  ) => void;
  onApplyDefaults: () => void;
  /** Called once after all files upload successfully */
  onUploaded: (results: AdminMediaUploadResponse[]) => void;
  onError?: (message: string) => void;
};

/**
 * Modal to review bulk image uploads with shared defaults and per-file title/alt.
 *
 * @param props - Draft files, metadata handlers, and upload callbacks
 */
export function BulkMediaUploadModal({
  open,
  drafts,
  onClose,
  defaultTitle,
  defaultAlt,
  tags,
  onDefaultTitleChange,
  onDefaultAltChange,
  onTagsChange,
  onDraftChange,
  onApplyDefaults,
  onUploaded,
  onError,
}: BulkMediaUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalBytes = useMemo(
    () => drafts.reduce((sum, draft) => sum + draft.file.size, 0),
    [drafts],
  );

  const selectedTag = tags[0] ?? "";

  if (!open || drafts.length === 0) return null;

  /**
   * Selects one canonical tag (first tag drives lodging library filters).
   *
   * @param tag - Canonical media tag
   */
  function selectTag(tag: string) {
    onTagsChange(selectedTag === tag ? [] : [tag]);
  }

  async function handleUpload() {
    const oversized = drafts.find(
      (draft) => draft.file.size > MAX_UPLOAD_BYTES,
    );
    if (oversized) {
      onError?.(
        `${oversized.file.name} exceeds ${MAX_UPLOAD_LABEL} (${formatMediaUploadSize(oversized.file.size)})`,
      );
      return;
    }

    setUploading(true);
    setProgress(0);
    const results: AdminMediaUploadResponse[] = [];

    try {
      for (let index = 0; index < drafts.length; index++) {
        const draft = drafts[index];
        const form = new FormData();
        form.append("file", draft.file);
        form.append("title", draft.title);
        form.append("caption", draft.title);
        form.append("alt", draft.alt || draft.title);
        form.append("tags", JSON.stringify(tags));
        const body = await uploadAdminMedia(form);
        results.push(body);
        setProgress(index + 1);
      }
      onUploaded(results);
      onClose();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-modal-layer">
      <button
        type="button"
        className="admin-modal-backdrop"
        onClick={onClose}
        aria-label="Close bulk upload"
      />
      <div
        className="admin-modal admin-modal--library admin-modal--bulk-upload"
        role="dialog"
        aria-modal="true"
        aria-label="Bulk upload images"
      >
        <div className="admin-modal-header admin-bulk-upload-header">
          <div>
            <h2 className="admin-modal-title">Bulk upload</h2>
            <p className="admin-bulk-upload-summary">
              <span className="admin-bulk-upload-stat">
                {drafts.length} file{drafts.length === 1 ? "" : "s"}
              </span>
              <span className="admin-bulk-upload-stat-sep" aria-hidden="true">
                ·
              </span>
              <span className="admin-bulk-upload-stat">
                {formatMediaUploadSize(totalBytes)} total
              </span>
              <span className="admin-bulk-upload-stat-sep" aria-hidden="true">
                ·
              </span>
              <span className="admin-bulk-upload-stat">
                max {MAX_UPLOAD_LABEL} each
              </span>
            </p>
          </div>
          <button
            type="button"
            className="admin-btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="admin-bulk-upload-body">
          <section className="admin-bulk-upload-section">
            <div className="admin-bulk-upload-section-head">
              <h3 className="admin-bulk-upload-section-title">
                Shared defaults
              </h3>
              <button
                type="button"
                className="admin-btn-sm"
                onClick={onApplyDefaults}
              >
                Apply to all {drafts.length}
              </button>
            </div>
            <div className="admin-bulk-upload-defaults">
              <TextField
                label="Default title"
                value={defaultTitle}
                onChange={onDefaultTitleChange}
                placeholder="Applied to every file (numbered when batch > 1)"
              />
              <TextField
                label="Default alt"
                value={defaultAlt}
                onChange={onDefaultAltChange}
                placeholder="Describe the images for accessibility"
              />
            </div>
          </section>

          <section className="admin-bulk-upload-section">
            <h3 className="admin-bulk-upload-section-title">Category tag</h3>
            <p className="admin-hint admin-hint--tight">
              Pick one tag so images appear in the right room or food library
              filter.
            </p>
            <fieldset className="admin-bulk-tag-grid">
              <legend className="sr-only">Media category tags</legend>
              {MEDIA_TAG_PRESETS.map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`admin-bulk-tag ${active ? "admin-bulk-tag--active" : ""}`}
                    aria-pressed={active}
                    onClick={() => selectTag(tag)}
                  >
                    <span className="admin-bulk-tag-label">{tag}</span>
                    {active ? (
                      <span className="admin-bulk-tag-check" aria-hidden="true">
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </fieldset>
          </section>

          <section className="admin-bulk-upload-section admin-bulk-upload-section--files">
            <h3 className="admin-bulk-upload-section-title">Files to upload</h3>
            <div className="admin-bulk-upload-grid">
              {drafts.map((draft) => (
                <article key={draft.key} className="admin-bulk-upload-card">
                  <div className="admin-bulk-upload-card-preview">
                    {/* biome-ignore lint/performance/noImgElement: admin preview */}
                    <img src={draft.previewUrl} alt="" />
                  </div>
                  <div className="admin-bulk-upload-card-body">
                    <p
                      className="admin-bulk-upload-card-name"
                      title={draft.file.name}
                    >
                      {draft.file.name}
                    </p>
                    <p className="admin-hint admin-hint--tight">
                      {formatMediaUploadSize(draft.file.size)}
                    </p>
                    <input
                      className="admin-input admin-input--compact"
                      value={draft.title}
                      placeholder="Title"
                      aria-label={`Title for ${draft.file.name}`}
                      onChange={(event) =>
                        onDraftChange(draft.key, { title: event.target.value })
                      }
                    />
                    <input
                      className="admin-input admin-input--compact"
                      value={draft.alt}
                      placeholder="Alt text"
                      aria-label={`Alt for ${draft.file.name}`}
                      onChange={(event) =>
                        onDraftChange(draft.key, { alt: event.target.value })
                      }
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="admin-modal-footer admin-bulk-upload-footer">
          <p className="admin-bulk-upload-status">
            {uploading
              ? `Uploading ${progress} of ${drafts.length}…`
              : selectedTag
                ? `Ready · tagged “${selectedTag}”`
                : `${drafts.length} ready · pick a tag optional`}
          </p>
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={uploading || drafts.length === 0}
              onClick={() => void handleUpload()}
            >
              {uploading ? "Uploading…" : `Upload ${drafts.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Applies shared title/alt defaults across bulk upload drafts with sequential 1..N numbering.
 *
 * @param drafts - Existing upload drafts
 * @param defaultTitle - Shared title default
 * @param defaultAlt - Shared alt default
 */
export function applyDefaultsToDrafts(
  drafts: BulkUploadDraft[],
  defaultTitle: string,
  defaultAlt: string,
): BulkUploadDraft[] {
  const total = drafts.length;
  return drafts.map((draft, index) => {
    const numSuffix = total > 1 ? ` ${index + 1}` : "";
    const title = defaultTitle ? `${defaultTitle}${numSuffix}` : draft.title;
    const alt = defaultAlt
      ? `${defaultAlt}${numSuffix}`
      : defaultTitle
        ? `${defaultTitle}${numSuffix}`
        : draft.alt;
    return {
      ...draft,
      title,
      alt,
    };
  });
}

/**
 * Builds upload drafts from a FileList with shared title/alt defaults.
 * Automatically appends sequential numbers (1..N) when a default title or alt is provided.
 *
 * @param files - Selected files
 * @param defaultTitle - Shared title default
 * @param defaultAlt - Shared alt default
 */
export function buildBulkUploadDrafts(
  files: FileList | File[],
  defaultTitle = "",
  defaultAlt = "",
): BulkUploadDraft[] {
  const fileArray = Array.from(files);
  const total = fileArray.length;
  return fileArray.map((file, index) => {
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    const numSuffix = total > 1 ? ` ${index + 1}` : "";
    const title = defaultTitle ? `${defaultTitle}${numSuffix}` : baseName;
    const alt = defaultAlt
      ? `${defaultAlt}${numSuffix}`
      : defaultTitle
        ? `${defaultTitle}${numSuffix}`
        : baseName;
    return {
      key: `${file.name}-${file.size}-${index}-${Date.now()}`,
      file,
      title,
      alt,
      previewUrl: URL.createObjectURL(file),
    };
  });
}

/**
 * Revokes object URLs created for bulk upload previews.
 *
 * @param drafts - Draft list with preview URLs
 */
export function revokeBulkUploadPreviews(drafts: BulkUploadDraft[]): void {
  for (const draft of drafts) {
    URL.revokeObjectURL(draft.previewUrl);
  }
}
