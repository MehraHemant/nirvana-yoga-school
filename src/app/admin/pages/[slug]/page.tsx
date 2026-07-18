"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DedicatedPageAdminClient from "@/app/admin/sections/DedicatedPageAdminClient";
import ProductEditorsAdminClient from "@/app/admin/sections/ProductEditorsAdminClient";
import TeachersAdminClient from "@/app/admin/sections/teachers/TeachersAdminClient";
import {
  EDITORIAL_MODULE_PANELS,
  HUB_MODULE_PANELS,
  KIRTAN_MODULE_PANELS,
  ModulePageEditor,
  type ModulePanelId,
  RESIDENTIAL_MODULE_PANELS,
  VENUE_MODULE_PANELS,
} from "@/components/admin/modules/ModulePageEditor";
import { YttHubEditor } from "@/components/admin/YttHubEditor";
import type { PageModulesDocument } from "@/content/types";
import type { YttHubContent } from "@/content/types/shared-sections";
import {
  fetchAdminPageEditor,
  saveAdminPageEditor,
} from "@/lib/api/admin-client";
import {
  adminSectionListHref,
  adminSectionListLabel,
} from "@/lib/cms/admin-section-nav";
import {
  type PageLayoutId,
  publicViewHref,
  resolvePageLayoutId,
  sharedSectionLinksForLayout,
} from "@/lib/cms/page-layout-registry";
import { parseApiJson } from "@/lib/types/api";

/**
 * Page editor router — picks a layout-specific editor from the page-layout registry.
 */
export default function AdminPageEditor() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);

  return <AdminLayoutRouter slug={slug} />;
}

/**
 * Resolves layoutId (from modules meta type when needed) and mounts the editor.
 *
 * @param props - Page slug
 */
function AdminLayoutRouter({ slug }: { slug: string }) {
  if (slug === "teacher") {
    return (
      <TeachersAdminClient
        backHref="/admin/sections/teachers"
        backLabel="Teachers"
      />
    );
  }

  if (slug === "yoga-teacher-training-in-rishikesh-india") {
    return (
      <YttHubAdminClient
        backHref="/admin/sections/other"
        backLabel="Other pages"
      />
    );
  }

  return <TypedLayoutEditor slug={slug} />;
}

/**
 * Loads one canonical page document, then mounts its guided layout editor.
 *
 * @param props - Page slug
 */
function TypedLayoutEditor({ slug }: { slug: string }) {
  const [modules, setModules] = useState<PageModulesDocument | null>(null);
  const [pageType, setPageType] = useState("site");
  const [content, setContent] = useState<
    import("@/content/types/dedicated-pages").DedicatedPageContent | null
  >(null);
  const [product, setProduct] =
    useState<
      import("@/lib/types/admin-api").AdminPageEditorDocument["product"]
    >(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchAdminPageEditor(slug)
      .then((body) => {
        setModules(body.modules);
        setPageType(body.meta.type);
        setContent(body.content);
        setProduct(body.product);
        setReady(true);
      })
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  if (error) return <p className="admin-error">{error}</p>;
  if (!ready) return <p className="admin-hint">Loading editor…</p>;

  const layoutId = resolvePageLayoutId(pageType, slug);
  const backHref = adminSectionListHref(pageType, slug);
  const backLabel = adminSectionListLabel(pageType, slug);

  if (
    (slug === "home" ||
      slug === "contact" ||
      slug === "enquire-now" ||
      slug === "booking") &&
    content
  ) {
    return (
      <DedicatedPageAdminClient
        slug={slug}
        initialContent={content}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (layoutId === "onlineCourse") {
    if (!product || product.kind !== "online") {
      return <p className="admin-error">Online course document not found.</p>;
    }
    return (
      <ProductEditorsAdminClient
        slug={slug}
        kind="online"
        initialDocument={product.document}
        initialModules={modules}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (layoutId === "retreat") {
    if (!product || product.kind !== "retreat") {
      return <p className="admin-error">Retreat document not found.</p>;
    }
    return (
      <ProductEditorsAdminClient
        slug={slug}
        kind="retreat"
        initialDocument={product.document}
        initialModules={modules}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (!modules) {
    return <p className="admin-hint">Loading modules…</p>;
  }

  const { panels, hint } = layoutModuleConfig(layoutId);

  async function onSave(next: PageModulesDocument) {
    await saveAdminPageEditor(slug, {
      modules: next,
      content: null,
      product: null,
    });
    setModules(next);
  }

  return (
    <ModulePageEditor
      initial={modules}
      slug={slug}
      backHref={backHref}
      backLabel={backLabel}
      onSave={onSave}
      visiblePanels={panels}
      layoutHint={hint}
      previewHref={publicViewHref(pageType, slug)}
      sharedLinks={sharedSectionLinksForLayout(layoutId)}
    />
  );
}

/**
 * Module panel allowlist for a layout family.
 *
 * @param layoutId - Resolved layout id
 */
function layoutModuleConfig(layoutId: PageLayoutId): {
  panels: ModulePanelId[];
  hint: string;
} {
  switch (layoutId) {
    case "residentialCourse":
      return {
        panels: RESIDENTIAL_MODULE_PANELS,
        hint: "Residential course",
      };
    case "venue":
      return {
        panels: VENUE_MODULE_PANELS,
        hint: "Venue",
      };
    case "hub":
      return {
        panels: HUB_MODULE_PANELS,
        hint: "Marketing hub",
      };
    case "kirtan":
      return {
        panels: KIRTAN_MODULE_PANELS,
        hint: "Kirtan",
      };
    default:
      return {
        panels: EDITORIAL_MODULE_PANELS,
        hint: "Editorial",
      };
  }
}

type YttHubAdminClientProps = {
  backHref: string;
  backLabel: string;
};

/**
 * Loads/saves `global_settings.yttHub` for the YTT hub page.
 *
 * @param props - Back-nav overrides
 */
function YttHubAdminClient({ backHref, backLabel }: YttHubAdminClientProps) {
  const [doc, setDoc] = useState<YttHubContent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/yttHub")
      .then((res) => parseApiJson<{ settings: YttHubContent }>(res))
      .then((body) => setDoc(body.settings))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="admin-error">{error}</p>;
  if (!doc) return <p className="admin-hint">Loading YTT hub…</p>;

  return (
    <YttHubEditor
      initial={doc}
      backHref={backHref}
      backLabel={backLabel}
      onSave={async (next) => {
        const res = await fetch("/api/admin/settings/yttHub", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: next }),
        });
        await parseApiJson(res);
        setDoc(next);
      }}
    />
  );
}
