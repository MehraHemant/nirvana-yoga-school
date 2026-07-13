"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ModulePageEditor } from "@/components/admin/modules";
import type { PageModulesDocument } from "@/content/types";
import {
  fetchAdminPageModules,
  saveAdminPageModules,
} from "@/lib/api/admin-client";

/**
 * Module-based site page editor.
 */
export default function AdminPageEditor() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);

  const [modules, setModules] = useState<PageModulesDocument | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminPageModules(slug)
      .then((body) => setModules(body.modules))
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  async function onSave(next: PageModulesDocument) {
    await saveAdminPageModules(slug, next);
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
