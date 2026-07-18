"use client";

import { useEffect, useState } from "react";
import { OnlineCourseEditor } from "@/components/admin/OnlineCourseEditor";
import { RetreatEditor } from "@/components/admin/RetreatEditor";
import type {
  OnlineCourseDocument,
  PageModulesDocument,
  RetreatDocument,
} from "@/content/types";
import {
  fetchAdminPageEditor,
  saveAdminPageEditor,
} from "@/lib/api/admin-client";

type ProductEditorsAdminClientProps = {
  slug: string;
  kind: "online" | "retreat";
  backHref: string;
  backLabel: string;
  /** Preloaded canonical page document, when available. */
  initialDocument?: OnlineCourseDocument | RetreatDocument;
  initialModules?: PageModulesDocument | null;
};

/**
 * Loads online/retreat product + modules and mounts the layout-specific editor.
 *
 * @param props - Slug, product kind, and back-nav
 */
export default function ProductEditorsAdminClient({
  slug,
  kind,
  backHref,
  backLabel,
  initialDocument,
  initialModules,
}: ProductEditorsAdminClientProps) {
  const [document, setDocument] = useState<
    OnlineCourseDocument | RetreatDocument | null
  >(initialDocument ?? null);
  const [modules, setModules] = useState<PageModulesDocument | null>(
    initialModules ?? null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialDocument) return;
    fetchAdminPageEditor(slug)
      .then((body) => {
        setDocument(body.product?.document ?? null);
        setModules(body.modules);
      })
      .catch((err: Error) => setError(err.message));
  }, [initialDocument, slug]);

  if (error) return <p className="admin-error">{error}</p>;
  if (!document) return <p className="admin-hint">Loading product…</p>;

  if (kind === "online") {
    return (
      <OnlineCourseEditor
        initialCourse={document as OnlineCourseDocument}
        initialModules={modules}
        slug={slug}
        backHref={backHref}
        backLabel={backLabel}
        onSave={async ({ course, modules: nextModules }) => {
          await saveAdminPageEditor(slug, {
            modules: nextModules,
            content: null,
            product: { kind: "online", document: course },
          });
          setDocument(course);
          setModules(nextModules);
        }}
      />
    );
  }

  return (
    <RetreatEditor
      initialRetreat={document as RetreatDocument}
      initialModules={modules}
      slug={slug}
      backHref={backHref}
      backLabel={backLabel}
      onSave={async ({ retreat, modules: nextModules }) => {
        await saveAdminPageEditor(slug, {
          modules: nextModules,
          content: null,
          product: { kind: "retreat", document: retreat },
        });
        setDocument(retreat);
        setModules(nextModules);
      }}
    />
  );
}
