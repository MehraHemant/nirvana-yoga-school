"use client";

import { useState } from "react";
import type { ModuleLibraryKey } from "@/content/types";
import { MODULE_LIBRARY_LABELS } from "@/content/types";
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

    const response = await fetch("/api/admin/module-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleKey,
        variant: variant ?? null,
        name: name.trim(),
        payload,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setMessage(body.error ?? "Save failed");
      return;
    }

    setMessage("Saved to library");
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
