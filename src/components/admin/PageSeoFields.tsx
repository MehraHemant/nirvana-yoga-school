"use client";

import { ImageField } from "@/components/admin/ImageField";
import { TextField } from "@/components/admin/TextField";
import type { PageSeoMeta } from "@/content/types/page-seo";

type PageSeoFieldsProps = {
  /** Current page SEO meta (may be undefined) */
  value?: PageSeoMeta;
  /** Called with the next meta object */
  onChange: (meta: PageSeoMeta) => void;
};

/**
 * Shared admin fields for page-level SEO (title, description, OG image, keywords, noIndex).
 *
 * @param props - Current meta value and change handler
 */
export function PageSeoFields({ value, onChange }: PageSeoFieldsProps) {
  const meta = value ?? {};

  function patch(partial: Partial<PageSeoMeta>) {
    onChange({ ...meta, ...partial });
  }

  return (
    <>
      <TextField
        label="Title"
        value={meta.title ?? ""}
        onChange={(title) => patch({ title })}
        hint="Leave empty to use Site config default SEO title"
      />
      <TextField
        label="Description"
        value={meta.description ?? ""}
        onChange={(description) => patch({ description })}
        multiline
        rows={2}
      />
      <div className="admin-grid-2">
        <ImageField
          label="OG image"
          value={meta.ogImage ?? ""}
          compact
          onChange={(ogImage) => patch({ ogImage })}
          hint="Recommended 1200×630"
        />
      </div>
      <TextField
        label="Keywords"
        value={meta.keywords ?? ""}
        onChange={(keywords) => patch({ keywords })}
        multiline
        rows={4}
        hint="Optional, comma-separated"
      />
      <label className="admin-checkbox-row">
        <input
          type="checkbox"
          checked={meta.noIndex ?? false}
          onChange={(event) => patch({ noIndex: event.target.checked })}
        />
        <span>No index (hide from search engines)</span>
      </label>
    </>
  );
}
