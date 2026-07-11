"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ModulePageEditor } from "@/components/admin/modules";
import type { PageModulesDocument } from "@/content/types";

/**
 * Module-based site page editor.
 */
export default function AdminPageEditor() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);

  const [modules, setModules] = useState<PageModulesDocument | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/modules/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load page modules");
        const body = (await response.json()) as {
          modules: PageModulesDocument;
        };
        setModules(body.modules);
      })
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  async function onSave(next: PageModulesDocument) {
    const response = await fetch(
      `/api/admin/modules/${encodeURIComponent(slug)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      },
    );

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error ?? "Save failed");
    }

    setModules(next);
  }

  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  if (!modules) {
    return <p className="admin-hint">Loading modules…</p>;
  }

  return (
    <ModulePageEditor
      initial={modules}
      slug={slug}
      backHref="/admin/pages"
      backLabel="All pages"
      onSave={onSave}
    />
  );
}
