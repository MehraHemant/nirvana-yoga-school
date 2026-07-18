"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BlogPostDocument } from "@/content/types";
import { resolveBlogBodyHtml } from "@/lib/cms/blog-html";
import { AdminSaveBar } from "./AdminSaveBar";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ImageField } from "./ImageField";
import { RichTextEditor } from "./RichTextEditor";
import { TextField } from "./TextField";

type BlogPostEditorProps = {
  initial: BlogPostDocument;
  onSave: (doc: BlogPostDocument) => Promise<void>;
};

/**
 * Editor for blog post metadata and rich-text body content.
 *
 * @param props - Initial post and persist handler
 */
export function BlogPostEditor({ initial, onSave }: BlogPostEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(doc) !== baseline;

  const bodyHtml = useMemo(
    () => resolveBlogBodyHtml(doc.bodyHtml, doc.content),
    [doc.bodyHtml, doc.content],
  );

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await onSave(doc);
      setBaseline(JSON.stringify(doc));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <Link href="/admin/blog" className="admin-back-link">
          ← All posts
        </Link>
        <h1 className="admin-title">{doc.title}</h1>
        <p className="admin-subtitle">{doc.slug}</p>
      </div>

      <CollapsiblePanel title="Post metadata" defaultOpen>
        <TextField
          label="Title"
          value={doc.title}
          onChange={(title) => setDoc({ ...doc, title })}
        />
        <div className="admin-grid-2">
          <TextField
            label="Category"
            value={doc.category}
            onChange={(category) => setDoc({ ...doc, category })}
          />
          <TextField
            label="Published date"
            value={doc.publishedAt ?? ""}
            onChange={(publishedAt) => setDoc({ ...doc, publishedAt })}
            placeholder="2026-07-12"
          />
        </div>
        <TextField
          label="Excerpt / description"
          value={doc.excerpt}
          onChange={(excerpt) => setDoc({ ...doc, excerpt })}
          multiline
          rows={3}
          hint="Short summary for cards and SEO meta description (plain text)."
        />
        <ImageField
          label="Cover image"
          value={doc.image}
          onChange={(image) => setDoc({ ...doc, image })}
        />
      </CollapsiblePanel>

      <CollapsiblePanel title="Article body" defaultOpen>
        <RichTextEditor
          label="Content"
          value={bodyHtml}
          onChange={(html) => setDoc({ ...doc, bodyHtml: html })}
          placeholder="Write your article…"
        />
        <p className="admin-hint">
          Use headings, lists, links, and quotes. Legacy block content is
          imported automatically until you save rich text here.
        </p>
      </CollapsiblePanel>

      <AdminSaveBar
        title={doc.title || "Blog post"}
        subtitle={doc.slug}
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref={`/blog/${doc.slug}`}
      />
    </div>
  );
}
