"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPageAction } from "@/app/admin/pages/content-actions";
import { Plus } from "@/icons";

/** Slugifies a title for the live-preview slug hint. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Create-page panel — spins up a new live site page, then opens its editor so
 * the admin can add section content types. Slug defaults to the title.
 */
export function AdminCreatePageForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const previewSlug = slug ? slugify(slug) : slugify(title);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createPageAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.slug) {
        router.push(`/admin/pages/${result.slug}`);
      }
    });
  }

  if (!open) {
    return (
      <button type="button" className="admin-btn" onClick={() => setOpen(true)}>
        <Plus size={16} /> New page
      </button>
    );
  }

  return (
    <form className="admin-create-page" onSubmit={onSubmit}>
      <div className="admin-create-page-head">
        <h2 className="admin-cms-panel-title">Create a page</h2>
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
      <div className="admin-grid-2">
        <div className="admin-field">
          <label className="admin-label" htmlFor="new-page-title">
            Page title
          </label>
          <input
            id="new-page-title"
            name="title"
            className="admin-input"
            required
            value={title}
            placeholder="Karma Yoga Retreat"
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="new-page-slug">
            Slug (optional)
          </label>
          <input
            id="new-page-slug"
            name="slug"
            className="admin-input"
            value={slug}
            placeholder="karma-yoga-retreat"
            onChange={(event) => setSlug(event.target.value)}
          />
          {previewSlug ? (
            <p className="admin-hint admin-hint--tight">
              Lives at <code>/{previewSlug}</code>
            </p>
          ) : null}
        </div>
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="new-page-desc">
          Description (optional)
        </label>
        <textarea
          id="new-page-desc"
          name="description"
          className="admin-textarea"
          rows={2}
          value={description}
          placeholder="Shown in search results and page metadata."
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <button type="submit" className="admin-btn" disabled={pending}>
        <Plus size={16} /> {pending ? "Creating…" : "Create & add sections"}
      </button>
    </form>
  );
}
