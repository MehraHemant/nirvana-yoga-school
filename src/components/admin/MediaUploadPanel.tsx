"use client";

import { useRef, useState } from "react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/cdn/constants";
import { MediaMetadataFields } from "./MediaMetadataFields";

type MediaUploadPanelProps = {
  onUploaded: (result: { url: string; id: string }) => void;
  onError?: (message: string) => void;
};

/**
 * Upload panel with file picker and metadata fields (caption, description, tags).
 *
 * @param props - Success and error callbacks after upload
 */
export function MediaUploadPanel({
  onUploaded,
  onError,
}: MediaUploadPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) {
      onError?.("Choose an image first");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      onError?.(
        `File exceeds ${MAX_UPLOAD_LABEL} limit (${Math.round(file.size / 1024)}KB)`,
      );
      return;
    }

    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("caption", caption);
    form.append("description", description);
    form.append("tags", JSON.stringify(tags));

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: form,
    });

    setUploading(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      onError?.(body.error ?? "Upload failed");
      return;
    }

    const body = (await response.json()) as { url: string; id: string };
    setFile(null);
    setCaption("");
    setDescription("");
    setTags([]);
    if (fileRef.current) fileRef.current.value = "";
    onUploaded(body);
  }

  return (
    <div className="admin-card admin-media-upload-panel">
      <div className="admin-field">
        <label className="admin-label" htmlFor="media-upload-file">
          Image file
        </label>
        <input
          id="media-upload-file"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        {file ? (
          <p className="admin-hint admin-hint--tight">
            {file.name} · {Math.round(file.size / 1024)}KB
          </p>
        ) : null}
      </div>

      <MediaMetadataFields
        caption={caption}
        description={description}
        tags={tags}
        onCaptionChange={setCaption}
        onDescriptionChange={setDescription}
        onTagsChange={setTags}
      />

      <button
        type="button"
        className="admin-btn"
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? "Uploading…" : "Upload image"}
      </button>
    </div>
  );
}
