"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteBlogPostAction } from "@/app/admin/blog/actions";
import type { BlogPostDocument } from "@/content/types";
import { resolveBlogBodyHtml } from "@/lib/cms/blog-html";
import { AdminSaveBar } from "./AdminSaveBar";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { SectionLiveField } from "./SectionLiveField";
import { TextField } from "./TextField";

const RichTextEditor = dynamic(
  () => import("./RichTextEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="admin-field">
        <span className="admin-label">Content</span>
        <p className="admin-hint">Loading editor…</p>
      </div>
    ),
  },
);

const EXCERPT_TARGET = 160;

type BlogPostEditorProps = {
  initial: BlogPostDocument;
  initialPublished?: boolean;
  onSave: (doc: BlogPostDocument) => Promise<void>;
  /** True on `/admin/blog/new` — shows slug field and hides preview until saved */
  isNew?: boolean;
};

/**
 * Editor for blog post metadata and rich-text body content.
 *
 * @param props - Initial post, publish state, and persist handler
 */
export function BlogPostEditor({
  initial,
  initialPublished = false,
  onSave,
  isNew = false,
}: BlogPostEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [published, setPublished] = useState(initialPublished);
  const [baseline, setBaseline] = useState(
    () => `${JSON.stringify(initial)}|${initialPublished}`,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deletePending, startDeleteTransition] = useTransition();

  const snapshot = `${JSON.stringify(doc)}|${published}`;
  const dirty = snapshot !== baseline;

  const bodyHtml = useMemo(
    () => resolveBlogBodyHtml(doc.bodyHtml, doc.content),
    [doc.bodyHtml, doc.content],
  );

  const hasLegacyBlocks =
    !doc.bodyHtml?.trim() && (doc.content?.length ?? 0) > 0;
  const excerptLength = doc.excerpt.trim().length;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const nextDoc: BlogPostDocument = {
        ...doc,
        published,
        publishedAt:
          published && !doc.publishedAt
            ? new Date().toISOString().slice(0, 10)
            : doc.publishedAt,
      };
      await onSave(nextDoc);
      setDoc(nextDoc);
      setBaseline(`${JSON.stringify(nextDoc)}|${published}`);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (isNew || !doc.slug) return;
    if (
      !window.confirm(
        `Delete "${doc.title || doc.slug}"? This permanently removes the post and cannot be undone.`,
      )
    ) {
      return;
    }

    startDeleteTransition(async () => {
      setError("");
      try {
        const formData = new FormData();
        formData.set("slug", doc.slug);
        await deleteBlogPostAction(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <div className="admin-editor admin-blog-editor">
      <div className="admin-editor-header">
        <Link href="/admin/blog" className="admin-back-link">
          ← All posts
        </Link>
        <div className="admin-editor-title-row">
          <div>
            <h1 className="admin-title">{doc.title || "Untitled post"}</h1>
            <p className="admin-subtitle">
              <code className="admin-table-slug">
                /blog/{doc.slug || "your-slug"}
              </code>
              {isNew && !doc.slug ? (
                <span className="admin-hint">
                  {" "}
                  — generated from title on save
                </span>
              ) : null}
            </p>
          </div>
          <span
            className={`admin-pill${published ? " admin-pill--published" : ""}`}
          >
            {published ? "Published" : "Draft"}
          </span>
          {!isNew && doc.slug ? (
            <button
              type="button"
              className="admin-btn-sm admin-btn-sm--danger"
              disabled={deletePending || saving}
              onClick={handleDelete}
            >
              {deletePending ? "Deleting…" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>

      <CollapsiblePanel
        title="Post details"
        subtitle="Title, category, cover, and visibility"
        step={1}
        defaultOpen={isNew}
        actions={
          <SectionLiveField
            id="blog-published"
            value={published}
            liveLabel="Published"
            hiddenLabel="Draft"
            onChange={setPublished}
          />
        }
      >
        <TextField
          label="Title"
          value={doc.title}
          onChange={(title) => setDoc({ ...doc, title })}
        />
        {isNew ? (
          <TextField
            label="Slug (optional)"
            value={doc.slug}
            onChange={(slug) => setDoc({ ...doc, slug })}
            placeholder="auto-generated from title"
            hint="Leave blank to generate from the title. Public URL: /blog/your-slug"
          />
        ) : null}
        <div className="admin-grid-2">
          <TextField
            label="Category"
            value={doc.category}
            onChange={(category) => setDoc({ ...doc, category })}
            placeholder="e.g. Yoga tips"
          />
          <TextField
            label="Published date"
            value={doc.publishedAt ?? ""}
            onChange={(publishedAt) => setDoc({ ...doc, publishedAt })}
            placeholder="2026-07-12"
            hint="Shown on the article. Set automatically when you first publish."
          />
        </div>
        <div className="admin-field">
          <div className="admin-rich-text-label-row">
            <label className="admin-label" htmlFor="blog-excerpt">
              Excerpt / SEO description
            </label>
            <span
              className={`admin-char-count${excerptLength > EXCERPT_TARGET ? " admin-char-count--warn" : ""}`}
            >
              {excerptLength}/{EXCERPT_TARGET}
            </span>
          </div>
          <textarea
            id="blog-excerpt"
            className="admin-textarea"
            rows={3}
            value={doc.excerpt}
            placeholder="Short summary for cards and search results…"
            onChange={(event) =>
              setDoc({ ...doc, excerpt: event.target.value })
            }
          />
          <p className="admin-hint">
            Plain text only. Aim for ~{EXCERPT_TARGET} characters for search
            snippets.
          </p>
        </div>
        <ImageField
          label="Cover image"
          value={doc.image}
          onChange={(image) => setDoc({ ...doc, image })}
          hint="Hero image on the blog index and article header."
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        id="blog-article-body"
        title="Article body"
        subtitle="Rich text — headings, lists, links, images"
        step={2}
        defaultOpen
      >
        {hasLegacyBlocks ? (
          <p className="admin-callout admin-callout--info">
            This post uses legacy block content. It appears below until you edit
            and save — then rich text replaces it on the live site.
          </p>
        ) : null}
        <RichTextEditor
          label="Content"
          value={bodyHtml}
          onChange={(html) => setDoc({ ...doc, bodyHtml: html })}
          placeholder="Write your article…"
          enableImages
          showStats
        />
      </CollapsiblePanel>

      <AdminSaveBar
        title={doc.title || "Blog post"}
        subtitle={published ? "Published" : "Draft"}
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref={!isNew && doc.slug ? `/blog/${doc.slug}` : undefined}
      />
    </div>
  );
}
