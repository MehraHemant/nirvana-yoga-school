"use client";

import { useEffect, useState } from "react";
import { ContactPageEditor } from "@/components/admin/ContactPageEditor";
import { EnquirePageEditor } from "@/components/admin/EnquirePageEditor";
import { HomeSectionsEditor } from "@/components/admin/HomeSectionsEditor";
import type {
  ContactPageContent,
  DedicatedPageContent,
  EnquirePageContent,
  HomePageContent,
} from "@/content/types/dedicated-pages";
import { parseApiJson } from "@/lib/types/api";

type DedicatedPageSlug = "home" | "contact" | "enquire-now";

type DedicatedPageAdminClientProps = {
  /** Dedicated page slug */
  slug: DedicatedPageSlug;
  backHref?: string;
  backLabel?: string;
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
}: DedicatedPageAdminClientProps) {
  const [content, setContent] = useState<DedicatedPageContent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/dedicated/${encodeURIComponent(slug)}`)
      .then((res) => parseApiJson<{ content: DedicatedPageContent }>(res))
      .then((body) => setContent(body.content))
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  async function onSave(next: DedicatedPageContent) {
    const res = await fetch(`/api/admin/dedicated/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    await parseApiJson(res);
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
      initial={content as EnquirePageContent}
      onSave={onSave}
      backHref={backHref ?? "/admin/sections/enquire"}
      backLabel={backLabel ?? "Enquire"}
    />
  );
}
