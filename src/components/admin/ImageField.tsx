"use client";

import { useRef, useState } from "react";
import { uploadAdminMedia } from "@/lib/api/admin-client";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/cdn/constants";
import { MediaMetadataFields } from "./MediaMetadataFields";
import { MediaPicker } from "./MediaPicker";

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

/**
 * Image URL field with upload, library picker, metadata on upload, and preview.
 *
 * @param props - Label, current URL, and change handler
 */
export function ImageField({ label, value, onChange, hint }: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(
        `File exceeds ${MAX_UPLOAD_LABEL} (${Math.round(file.size / 1024)}KB)`,
      );
      return;
    }

    setPendingFile(file);
    setCaption("");
    setDescription("");
    setTags([]);
    setUploadModalOpen(true);
    setError("");
    event.target.value = "";
  }

  async function confirmUpload() {
    if (!pendingFile) return;

    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", pendingFile);
    form.append("caption", caption);
    form.append("description", description);
    form.append("tags", JSON.stringify(tags));

    try {
      const body = await uploadAdminMedia(form);
      onChange(body.url);
      setUploadModalOpen(false);
      setPendingFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const fieldId = `image-field-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="admin-image-field">
        {value ? (
          <div className="admin-image-preview">
            {/* biome-ignore lint/performance/noImgElement: admin preview */}
            <img src={value} alt="" />
          </div>
        ) : (
          <div className="admin-image-preview admin-image-preview--empty">
            No image
          </div>
        )}
        <div className="admin-image-controls">
          <input
            id={fieldId}
            className="admin-input"
            type="url"
            value={value}
            placeholder="https://…"
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="admin-image-actions">
            <button
              type="button"
              className="admin-btn-sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--ghost"
              onClick={() => setPickerOpen(true)}
            >
              Library
            </button>
            {value ? (
              <button
                type="button"
                className="admin-btn-sm admin-btn-sm--ghost"
                onClick={() => onChange("")}
              >
                Clear
              </button>
            ) : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onFileSelected}
          />
        </div>
      </div>
      {hint ? <p className="admin-hint">{hint}</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
      />

      {uploadModalOpen && pendingFile ? (
        <div className="admin-modal-layer">
          <button
            type="button"
            className="admin-modal-backdrop"
            onClick={() => setUploadModalOpen(false)}
            aria-label="Close upload dialog"
          />
          <div
            className="admin-modal admin-modal--library"
            role="dialog"
            aria-modal="true"
            aria-label="Upload image details"
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Upload image</h2>
              <button
                type="button"
                className="admin-btn-icon"
                onClick={() => setUploadModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="admin-hint admin-hint--tight">
              {pendingFile.name} · {Math.round(pendingFile.size / 1024)}KB
            </p>
            <MediaMetadataFields
              caption={caption}
              description={description}
              tags={tags}
              onCaptionChange={setCaption}
              onDescriptionChange={setDescription}
              onTagsChange={setTags}
            />
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-sm admin-btn-sm--ghost"
                onClick={() => setUploadModalOpen(false)}
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
    </div>
  );
}
