"use client";

import { ImageField } from "./ImageField";

type ImageListFieldProps = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  hint?: string;
};

/**
 * List of image URLs with upload + library picker on each row.
 *
 * @param props - Label, image URLs, and change handler
 */
export function ImageListField({
  label,
  items,
  onChange,
  addLabel = "Add image",
  hint,
}: ImageListFieldProps) {
  function updateItem(index: number, url: string) {
    const next = [...items];
    next[index] = url;
    onChange(next);
  }

  return (
    <div className="admin-field">
      <div className="admin-field-header">
        <div>
          <span className="admin-label">{label}</span>
          {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
        </div>
        <button
          type="button"
          className="admin-btn-sm"
          onClick={() => onChange([...items, ""])}
        >
          {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="admin-empty-card">
          <p>No images yet.</p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => onChange([""])}
          >
            {addLabel}
          </button>
        </div>
      ) : (
        <div className="admin-image-list">
          {items.map((url, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: CMS rows lack stable ids until saved
            <div key={`img-${index}`} className="admin-image-list-item">
              <span className="admin-image-list-num">{index + 1}</span>
              <div className="admin-image-list-field">
                <ImageField
                  label={`Image ${index + 1}`}
                  value={url}
                  onChange={(value) => updateItem(index, value)}
                />
              </div>
              <button
                type="button"
                className="admin-btn-icon admin-btn-icon--remove"
                aria-label={`Remove image ${index + 1}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
