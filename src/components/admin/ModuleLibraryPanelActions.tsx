"use client";

import { useState } from "react";
import type { ModuleLibraryKey, ModuleLibraryPayload } from "@/content/types";
import { MODULE_LIBRARY_LABELS } from "@/content/types";
import { createAdminModuleLibraryItem } from "@/lib/api/admin-client";
import { ModuleLibraryPicker } from "./ModuleLibraryPicker";

type ModuleLibraryPanelActionsProps = {
  moduleKey: ModuleLibraryKey;
  variant?: string;
  payload: unknown;
  onInsert: (payload: unknown) => void;
  hasContent?: boolean;
};

/**
 * Insert-from-library and save-to-library actions for module editor panels.
 *
 * @param props - Module key, payload, insert handler, and optional content flag
 */
export function ModuleLibraryPanelActions({
  moduleKey,
  variant,
  payload,
  onInsert,
  hasContent = true,
}: ModuleLibraryPanelActionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveToLibrary() {
    const defaultName = `${MODULE_LIBRARY_LABELS[moduleKey]} template`;
    const name = window.prompt("Library item name", defaultName);
    if (!name?.trim()) return;

    setSaving(true);
    setMessage("");

    try {
      await createAdminModuleLibraryItem({
        moduleKey,
        variant: variant ?? null,
        name: name.trim(),
        payload: payload as ModuleLibraryPayload,
      });
      setMessage("Saved to library");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function insertFromLibrary(libraryPayload: unknown) {
    if (hasContent) {
      const ok = window.confirm(
        "Replace this section with the library item? Current content will be overwritten.",
      );
      if (!ok) return;
    }
    onInsert(libraryPayload);
  }

  return (
    <>
      <div className="admin-panel-actions">
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={() => setPickerOpen(true)}
        >
          Insert from library
        </button>
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--ghost"
          onClick={saveToLibrary}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save to library"}
        </button>
        {message ? <span className="admin-hint">{message}</span> : null}
      </div>

      <ModuleLibraryPicker
        open={pickerOpen}
        moduleKey={moduleKey}
        variant={variant}
        onClose={() => setPickerOpen(false)}
        onSelect={insertFromLibrary}
      />
    </>
  );
}
