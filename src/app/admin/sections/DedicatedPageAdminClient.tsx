"use client";

import { useEffect, useState } from "react";
import { ContactPageEditor } from "@/components/admin/ContactPageEditor";
import { EnquirePageEditor } from "@/components/admin/EnquirePageEditor";
import { HomeSectionsEditor } from "@/components/admin/HomeSectionsEditor";
import type {
  BookingPageContent,
  ContactPageContent,
  DedicatedPageContent,
  EnquirePageContent,
  HomePageContent,
} from "@/content/types/dedicated-pages";
import {
  fetchAdminPageEditor,
  saveAdminPageEditor,
} from "@/lib/api/admin-client";

type DedicatedPageSlug = "home" | "contact" | "enquire-now" | "booking";

type DedicatedPageAdminClientProps = {
  /** Dedicated page slug */
  slug: DedicatedPageSlug;
  backHref?: string;
  backLabel?: string;
  /** Preloaded canonical page document, when routed from `/admin/pages/[slug]`. */
  initialContent?: DedicatedPageContent;
};

/**
 * Loads/saves dedicated page content_data and mounts the matching editor.
 *
 * @param props - Slug and optional back-nav overrides
 */
export default function DedicatedPageAdminClient({
  slug,
  backHref,
  backLabel,
  initialContent,
}: DedicatedPageAdminClientProps) {
  const [content, setContent] = useState<DedicatedPageContent | null>(
    initialContent ?? null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialContent) return;
    fetchAdminPageEditor(slug)
      .then((body) => setContent(body.content))
      .catch((err: Error) => setError(err.message));
  }, [initialContent, slug]);

  async function onSave(next: DedicatedPageContent) {
    await saveAdminPageEditor(slug, {
      modules: null,
      content: next,
      product: null,
    });
    setContent(next);
  }

  if (error) return <p className="admin-error">{error}</p>;
  if (!content) return <p className="admin-hint">Loading page content…</p>;

  if (slug === "home") {
    return (
      <HomeSectionsEditor
        initial={content as HomePageContent}
        onSave={onSave}
        backHref={backHref ?? "/admin/sections/home"}
        backLabel={backLabel ?? "Home"}
      />
    );
  }

  if (slug === "contact") {
    return (
      <ContactPageEditor
        initial={content as ContactPageContent}
        onSave={onSave}
        backHref={backHref ?? "/admin/sections/contact"}
        backLabel={backLabel ?? "Contact"}
      />
    );
  }

  return (
    <EnquirePageEditor
      initial={
        slug === "booking"
          ? (content as BookingPageContent)
          : (content as EnquirePageContent)
      }
      onSave={onSave}
      backHref={backHref ?? "/admin/sections/other"}
      backLabel={backLabel ?? "Other pages"}
      pageLabel={slug === "booking" ? "Booking" : "Enquire"}
      previewHref={slug === "booking" ? "/booking" : "/enquire-now"}
    />
  );
}
