"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Plus } from "@/icons";
import { MAX_UPLOAD_LABEL } from "@/lib/cdn/constants";
import type { AdminMediaUploadResponse } from "@/lib/types/admin-api";
import {
  BulkMediaUploadModal,
  type BulkUploadDraft,
  applyDefaultsToDrafts,
  buildBulkUploadDrafts,
  revokeBulkUploadPreviews,
} from "./BulkMediaUploadModal";

type MediaUploadPanelProps = {
  onUploaded: (result: AdminMediaUploadResponse) => void;
  /** Optional callback when a bulk batch finishes (after per-file onUploaded) */
  onBulkUploaded?: (results: AdminMediaUploadResponse[]) => void;
  onError?: (message: string) => void;
};

export type MediaUploadPanelHandle = {
  openFilePicker: () => void;
};

/**
 * Bulk upload panel with drag-and-drop — pick multiple images, set shared defaults.
 *
 * @param props - Success and error callbacks after upload
 */
export const MediaUploadPanel = forwardRef<
  MediaUploadPanelHandle,
  MediaUploadPanelProps
>(function MediaUploadPanel(
  { onUploaded, onBulkUploaded, onError },
  ref,
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<BulkUploadDraft[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [defaultTitle, setDefaultTitle] = useState("");
  const [defaultAlt, setDefaultAlt] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    openFilePicker: () => fileRef.current?.click(),
  }));

  function handleDefaultTitleChange(nextTitle: string) {
    setDefaultTitle(nextTitle);
    setDrafts((prev) => applyDefaultsToDrafts(prev, nextTitle, defaultAlt));
  }

  function handleDefaultAltChange(nextAlt: string) {
    setDefaultAlt(nextAlt);
    setDrafts((prev) => applyDefaultsToDrafts(prev, defaultTitle, nextAlt));
  }

  /**
   * Opens the bulk review modal for selected files.
   *
   * @param files - Image files to upload
   */
  function openWithFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    revokeBulkUploadPreviews(drafts);
    setDrafts(buildBulkUploadDrafts(fileArray, defaultTitle, defaultAlt));
    setUploadOpen(true);
  }

  function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;
    openWithFiles(files);
    event.target.value = "";
  }

  function closeUpload() {
    revokeBulkUploadPreviews(drafts);
    setDrafts([]);
    setUploadOpen(false);
  }

  /**
   * Accepts dropped image files onto the upload zone.
   *
   * @param event - Drop event
   */
  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const files = event.dataTransfer.files;
    if (!files?.length) return;
    const images = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (images.length === 0) {
      onError?.("Drop JPEG, PNG, or WebP images only");
      return;
    }
    openWithFiles(images);
  }

  return (
    <section className="admin-media-upload-panel admin-media-library__upload">
      <div className="admin-media-library__upload-head">
        <div>
          <h2 className="admin-media-library__upload-title">Upload images</h2>
          <p className="admin-hint admin-hint--tight">
            Single or bulk upload · JPEG, PNG, WebP · max {MAX_UPLOAD_LABEL} each
          </p>
        </div>
      </div>

      <div
        className={`admin-media-library__dropzone${
          dragActive ? " admin-media-library__dropzone--active" : ""
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDragActive(false);
        }}
        onDrop={onDrop}
      >
        <input
          id="media-upload-file"
          ref={fileRef}
          className="admin-media-library__file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onFilesSelected}
        />
        <div className="admin-media-library__dropzone-inner">
          <span className="admin-media-library__dropzone-icon" aria-hidden>
            <Plus size={22} />
          </span>
          <p className="admin-media-library__dropzone-title">
            Drag images here or click to browse
          </p>
          <p className="admin-hint admin-hint--tight">
            Set title, alt, and tags in the review step before uploading
          </p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => fileRef.current?.click()}
          >
            Choose files
          </button>
        </div>
      </div>

      <BulkMediaUploadModal
        open={uploadOpen}
        drafts={drafts}
        onClose={closeUpload}
        defaultTitle={defaultTitle}
        defaultAlt={defaultAlt}
        tags={tags}
        onDefaultTitleChange={handleDefaultTitleChange}
        onDefaultAltChange={handleDefaultAltChange}
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
        onUploaded={(results) => {
          if (onBulkUploaded) {
            onBulkUploaded(results);
          } else {
            for (const result of results) onUploaded(result);
          }
          setDefaultTitle("");
          setDefaultAlt("");
          setTags([]);
        }}
        onError={onError}
      />
    </section>
  );
});
