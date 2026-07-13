"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { EligibilityModuleEditor } from "@/components/admin/modules/EligibilityModuleEditor";
import { FaqModuleEditor } from "@/components/admin/modules/FaqModuleEditor";
import { HeroModuleEditor } from "@/components/admin/modules/HeroModuleEditor";
import { InclusionsModuleEditor } from "@/components/admin/modules/InclusionsModuleEditor";
import { OverviewModuleEditor } from "@/components/admin/modules/OverviewModuleEditor";
import { PricingModuleEditor } from "@/components/admin/modules/PricingModuleEditor";
import { ScheduleModuleEditor } from "@/components/admin/modules/ScheduleModuleEditor";
import { StickyNavModuleEditor } from "@/components/admin/modules/StickyNavModuleEditor";
import { SyllabusModuleEditor } from "@/components/admin/modules/SyllabusModuleEditor";
import { TextField } from "@/components/admin/TextField";
import type {
  EligibilityModule,
  FaqsModule,
  HeroModule,
  InclusionsModule,
  ModuleLibraryItemRecord,
  OverviewModule,
  PricingModule,
  ScheduleModule,
  SyllabusModule,
} from "@/content/types";
import { MODULE_LIBRARY_LABELS } from "@/content/types";
import type { StickyNavItem } from "@/content/types/shared";
import {
  fetchAdminModuleLibraryItem,
  saveAdminModuleLibraryItem,
} from "@/lib/api/admin-client";

/**
 * Edit a single module library item payload and name.
 */
export default function AdminLibraryEditPage() {
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<ModuleLibraryItemRecord | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminModuleLibraryItem(id)
      .then((body) => {
        setItem(body.item);
        setName(body.item.name);
      })
      .catch(() => setError("Library item not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!item) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const body = await saveAdminModuleLibraryItem(id, {
        name,
        payload: item.payload,
      });
      setItem(body.item);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updatePayload(payload: unknown) {
    if (!item) return;
    setItem({
      ...item,
      payload: payload as ModuleLibraryItemRecord["payload"],
    });
  }

  if (loading) {
    return <p className="admin-hint">Loading…</p>;
  }

  if (!item) {
    return (
      <div>
        <p className="admin-error">{error || "Not found"}</p>
        <Link href="/admin/library" className="admin-back-link">
          ← Back to library
        </Link>
      </div>
    );
  }

  const label = MODULE_LIBRARY_LABELS[item.moduleKey];

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <Link href="/admin/library" className="admin-back-link">
          ← Content library
        </Link>
        <h1 className="admin-title">Edit {label}</h1>
        <p className="admin-subtitle">
          {item.moduleKey}
          {item.variant ? ` · ${item.variant}` : ""}
        </p>
      </div>

      <div className="admin-card" style={{ marginBottom: "1rem" }}>
        <TextField label="Library item name" value={name} onChange={setName} />
      </div>

      {item.moduleKey === "hero" ? (
        <HeroModuleEditor
          hero={item.payload as HeroModule}
          onChange={(hero) => updatePayload(hero)}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "stickyNav" ? (
        <StickyNavModuleEditor
          items={(item.payload as { items: StickyNavItem[] }).items}
          onChange={(items) => updatePayload({ items })}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "overview" ? (
        <OverviewModuleEditor
          overview={item.payload as OverviewModule}
          onChange={(overview) => updatePayload(overview)}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "inclusions" ? (
        <InclusionsModuleEditor
          inclusions={item.payload as InclusionsModule}
          onChange={(inclusions) => updatePayload(inclusions)}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "eligibility" ? (
        <EligibilityModuleEditor
          eligibility={item.payload as EligibilityModule}
          onChange={(eligibility) => updatePayload(eligibility)}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "syllabus" ? (
        <SyllabusModuleEditor
          syllabus={item.payload as SyllabusModule}
          onChange={(syllabus) => updatePayload(syllabus)}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "schedule" ? (
        <ScheduleModuleEditor
          schedule={item.payload as ScheduleModule}
          onChange={(schedule) => updatePayload(schedule)}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "pricing" ? (
        <PricingModuleEditor
          pricing={item.payload as PricingModule}
          onChange={(pricing) => updatePayload(pricing)}
          open
          hideLibraryActions
        />
      ) : null}

      {item.moduleKey === "faqs" ? (
        <FaqModuleEditor
          faqs={item.payload as FaqsModule}
          onChange={(faqs) => updatePayload(faqs)}
          open
          hideLibraryActions
        />
      ) : null}

      <AdminSaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={handleSave}
      />
    </div>
  );
}
