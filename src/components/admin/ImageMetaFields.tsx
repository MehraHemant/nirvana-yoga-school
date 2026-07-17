"use client";

import type {
  CmsInteractiveImage,
  ImageClickAction,
} from "@/content/types/cms-image";

type ImageMetaFieldsProps = {
  /** Current image meta (url is managed by ImageField separately) */
  value: CmsInteractiveImage;
  /** Called with a partial update merged by the parent */
  onChange: (next: CmsInteractiveImage) => void;
  /** Optional id prefix for form controls */
  idPrefix?: string;
};

/**
 * Alt text + click-action controls for a CMS image.
 * Shows a redirect URL field only when action is `redirect`.
 *
 * @param props - Current meta values and change handler
 */
export function ImageMetaFields({
  value,
  onChange,
  idPrefix = "img-meta",
}: ImageMetaFieldsProps) {
  const action: ImageClickAction = value.clickAction ?? "fullscreen";

  return (
    <div className="admin-image-meta">
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-alt`}>
          Alt text
        </label>
        <input
          id={`${idPrefix}-alt`}
          className="admin-input"
          type="text"
          value={value.alt ?? ""}
          placeholder="Describe the image for accessibility"
          onChange={(event) => onChange({ ...value, alt: event.target.value })}
        />
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-click`}>
          On click
        </label>
        <select
          id={`${idPrefix}-click`}
          className="admin-input admin-select"
          value={action}
          onChange={(event) =>
            onChange({
              ...value,
              clickAction: event.target.value as ImageClickAction,
            })
          }
        >
          <option value="fullscreen">Fullscreen</option>
          <option value="redirect">Redirect</option>
          <option value="none">None</option>
        </select>
      </div>

      {action === "redirect" ? (
        <div className="admin-field">
          <label className="admin-label" htmlFor={`${idPrefix}-redirect`}>
            Redirect URL
          </label>
          <input
            id={`${idPrefix}-redirect`}
            className="admin-input"
            type="url"
            value={value.redirectUrl ?? ""}
            placeholder="https://…"
            onChange={(event) =>
              onChange({ ...value, redirectUrl: event.target.value })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
