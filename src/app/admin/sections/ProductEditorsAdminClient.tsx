"use client";

import { useEffect, useState } from "react";
import { OnlineCourseEditor } from "@/components/admin/OnlineCourseEditor";
import { RetreatEditor } from "@/components/admin/RetreatEditor";
import type {
  OnlineCourseDocument,
  PageModulesDocument,
  RetreatDocument,
} from "@/content/types";
import { parseApiJson } from "@/lib/types/api";

type ProductEditorsAdminClientProps = {
  slug: string;
  kind: "online" | "retreat";
  backHref: string;
  backLabel: string;
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
}: ProductEditorsAdminClientProps) {
  const [document, setDocument] = useState<
    OnlineCourseDocument | RetreatDocument | null
  >(null);
  const [modules, setModules] = useState<PageModulesDocument | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${encodeURIComponent(slug)}`)
      .then((res) =>
        parseApiJson<{
          document: OnlineCourseDocument | RetreatDocument;
          modules: PageModulesDocument | null;
        }>(res),
      )
      .then((body) => {
        setDocument(body.document);
        setModules(body.modules);
      })
      .catch((err: Error) => setError(err.message));
  }, [slug]);

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
          const res = await fetch(
            `/api/admin/products/${encodeURIComponent(slug)}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind: "online",
                course,
                modules: nextModules,
              }),
            },
          );
          await parseApiJson(res);
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
        const res = await fetch(
          `/api/admin/products/${encodeURIComponent(slug)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind: "retreat",
              retreat,
              modules: nextModules,
            }),
          },
        );
        await parseApiJson(res);
        setDocument(retreat);
        setModules(nextModules);
      }}
    />
  );
}
