"use client";

import { useEffect, useState } from "react";
import { TeachersFacultyEditor } from "@/components/admin/TeachersFacultyEditor";
import type { SitePageDocument } from "@/content/types";
import { parseApiJson } from "@/lib/types/api";

type TeachersAdminClientProps = {
  /** When embedded from /admin/pages/teacher */
  backHref?: string;
  backLabel?: string;
};

/**
 * Loads the teacher page document from the admin API and mounts the faculty editor.
 *
 * @param props - Optional back-nav overrides
 */
export default function TeachersAdminClient({
  backHref = "/admin",
  backLabel = "Dashboard",
}: TeachersAdminClientProps) {
  const [doc, setDoc] = useState<SitePageDocument | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/pages/teacher")
      .then((res) => parseApiJson<{ page: SitePageDocument }>(res))
      .then((body) => setDoc(body.page))
      .catch((err: Error) => setError(err.message));
  }, []);

  async function onSave(next: SitePageDocument) {
    const res = await fetch("/api/admin/pages/teacher", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    await parseApiJson(res);
    setDoc(next);
  }

  if (error) {
    return <p className="admin-error">{error}</p>;
  }

  if (!doc) {
    return <p className="admin-hint">Loading faculty…</p>;
  }

  return (
    <TeachersFacultyEditor
      initial={doc}
      onSave={onSave}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
