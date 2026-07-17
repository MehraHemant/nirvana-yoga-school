"use client";

import { useEffect, useState } from "react";
import { ModulePageEditor } from "@/components/admin/modules";
import type { PageModulesDocument } from "@/content/types";
import {
  fetchAdminPageModules,
  saveAdminPageModules,
} from "@/lib/api/admin-client";
import {
  adminSectionListHref,
  adminSectionListLabel,
} from "@/lib/cms/admin-section-nav";

type AdminPageModulesClientProps = {
  /** Page slug */
  slug: string;
};

/**
 * Client module editor for `page_modules` JSON on a site page.
 *
 * @param props - Page slug used for load/save API calls
 */
export default function AdminPageModulesClient({
  slug,
}: AdminPageModulesClientProps) {
  const [modules, setModules] = useState<PageModulesDocument | null>(null);
  const [pageType, setPageType] = useState("site");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminPageModules(slug)
      .then((body) => {
        setModules(body.modules);
        setPageType(body.meta?.type ?? "site");
      })
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
      backHref={adminSectionListHref(pageType, slug)}
      backLabel={adminSectionListLabel(pageType, slug)}
      onSave={onSave}
    />
  );
}
