"use client";

import { useState } from "react";
import { mergeMediaTagOptions } from "@/lib/cdn/media-tags";
import { TextField } from "./TextField";
import { useMediaLibraryTags } from "./useMediaLibraryTags";

type MediaMetadataFieldsProps = {
  caption: string;
  description: string;
  tags: string[];
  /** Tags already loaded by the parent. Skips another media-library request. */
  tagOptions?: string[];
  /** Optional alt text (shown when editing existing assets) */
  alt?: string;
  onCaptionChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onAltChange?: (value: string) => void;
};

/**
 * Shared caption, description, and tag picker for media uploads and edits.
 *
 * @param props - Field values and change handlers
 */
export function MediaMetadataFields({
  caption,
  description,
  tags,
  tagOptions,
  alt = "",
  onCaptionChange,
  onDescriptionChange,
  onTagsChange,
  onAltChange,
}: MediaMetadataFieldsProps) {
  const [customTag, setCustomTag] = useState("");
  const libraryTags = useMediaLibraryTags(tagOptions == null);
  const resolvedTagOptions = mergeMediaTagOptions(
    tagOptions ?? libraryTags,
    tags,
  );

  function toggleTag(tag: string) {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((item) => item !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  }

  function addCustomTag() {
    const trimmed = customTag.trim().replace(/\s+/g, " ").toLowerCase();
    if (!trimmed || tags.some((tag) => tag.toLowerCase() === trimmed)) return;
    onTagsChange([...tags, trimmed]);
    setCustomTag("");
  }

  return (
    <div className="admin-media-metadata">
      <TextField
        label="Caption"
        value={caption}
        onChange={onCaptionChange}
        placeholder="Short label shown in admin lists"
      />
      {onAltChange ? (
        <TextField
          label="Alt text"
          value={alt}
          onChange={onAltChange}
          placeholder="Describe the image for accessibility"
        />
      ) : null}
      <TextField
        label="Description"
        value={description}
        onChange={onDescriptionChange}
        placeholder="Optional longer notes about this image"
        multiline
        rows={3}
      />
      <div className="admin-field">
        <span className="admin-label">Tags</span>
        <p className="admin-hint admin-hint--tight">
          Pick a category — helps filter the library.
        </p>
        <div className="admin-quick-add-chips">
          {resolvedTagOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`admin-chip ${tags.includes(tag) ? "admin-chip--active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tags.includes(tag) ? "✓ " : "+ "}
              {tag}
            </button>
          ))}
        </div>
        <div className="admin-tag-custom-row">
          <input
            className="admin-input admin-input--compact"
            value={customTag}
            placeholder="Custom tag…"
            onChange={(event) => setCustomTag(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomTag();
              }
            }}
          />
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={addCustomTag}
          >
            Add tag
          </button>
        </div>
        {tags.length > 0 ? (
          <div className="admin-selected-tags">
            {tags.map((tag) => (
              <span key={tag} className="admin-library-badge">
                {tag}
                <button
                  type="button"
                  className="admin-tag-remove"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() =>
                    onTagsChange(tags.filter((item) => item !== tag))
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
