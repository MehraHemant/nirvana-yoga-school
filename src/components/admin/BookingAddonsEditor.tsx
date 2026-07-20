"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ListRowActions } from "@/components/admin/ListRowActions";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import {
  DragHandle,
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import { createEmptyBookingAddons } from "@/lib/cms/structural-defaults";
import type {
  BookingAddon,
  BookingAddonsContent,
  BookingType,
} from "@/content/types/booking";
import { parseApiJson } from "@/lib/types/api";

const APPLIES_OPTIONS: { value: BookingType; label: string }[] = [
  { value: "course", label: "Courses" },
  { value: "retreat", label: "Retreats" },
];

/**
 * Builds a stable slug-like id from a label.
 *
 * @param label - Display label
 */
function addonIdFromLabel(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || `addon-${Date.now()}`
  );
}

/**
 * Admin editor for optional booking checkout add-ons.
 */
export function BookingAddonsEditor() {
  const [doc, setDoc] = useState<BookingAddonsContent | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const items = doc?.items ?? [];
  const keys = useStableListKeys(items.length);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/settings/bookingAddons")
      .then((res) => parseApiJson<{ settings: BookingAddonsContent }>(res))
      .then((body) => {
        if (cancelled) return;
        const next = body.settings ?? createEmptyBookingAddons();
        setDoc(next);
        setBaseline(JSON.stringify(next));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        const fallback = createEmptyBookingAddons();
        setDoc(fallback);
        setBaseline(JSON.stringify(fallback));
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(
    () => Boolean(doc) && JSON.stringify(doc) !== baseline,
    [doc, baseline],
  );

  /**
   * Updates one add-on row.
   *
   * @param index - Row index
   * @param patch - Partial fields
   */
  function updateItem(index: number, patch: Partial<BookingAddon>) {
    if (!doc) return;
    const nextItems = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    setDoc({ ...doc, items: nextItems });
  }

  function addItem() {
    if (!doc) return;
    keys.addKey();
    const label = "New add-on";
    setDoc({
      ...doc,
      items: [
        ...items,
        {
          id: addonIdFromLabel(`${label}-${items.length + 1}`),
          label,
          priceUsd: 0,
          description: "",
          appliesTo: ["course", "retreat"],
          active: true,
        },
      ],
    });
  }

  function removeItem(index: number) {
    if (!doc) return;
    keys.removeKey(index);
    setDoc({
      ...doc,
      items: items.filter((_, i) => i !== index),
    });
  }

  function reorder(fromIndex: number, toIndex: number) {
    if (!doc) return;
    keys.reorderKeys(fromIndex, toIndex);
    setDoc({ ...doc, items: reorderItems(items, fromIndex, toIndex) });
  }

  async function handleSave() {
    if (!doc) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/settings/bookingAddons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: doc }),
      });
      await parseApiJson(res);
      setBaseline(JSON.stringify(doc));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !doc) {
    return <p className="admin-hint">Loading booking add-ons…</p>;
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <Link href="/admin/bookings" className="admin-back-link">
          ← Bookings
        </Link>
        <div className="admin-editor-title-row">
          <div>
            <h1 className="admin-title">Booking add-ons</h1>
            <p className="admin-subtitle">
              Optional extras shown before payment on /booking and
              /retreat-booking
            </p>
          </div>
        </div>
      </div>

      <div className="admin-tip-banner">
        <strong>Quick guide:</strong> These add-ons appear as a checkout step
        before PayPal. Prices are added to the program fee, then deposit and
        PayPal fee are calculated on the total.
      </div>

      <div className="admin-editor-layout">
        <div className="admin-editor-sections">
          <CollapsiblePanel
            id="booking-addons"
            step={1}
            title="Add-on catalog"
            subtitle={`${items.length} item${items.length === 1 ? "" : "s"}`}
            description="Drag to reorder. Inactive items stay in CMS but are hidden from checkout."
            open
            actions={
              <SectionLiveField
                id="booking-addons-live"
                value={doc.live}
                onChange={(live) => setDoc({ ...doc, live })}
              />
            }
          >
            <TextField
              label="Intro copy"
              value={doc.intro ?? ""}
              onChange={(intro) => setDoc({ ...doc, intro })}
              multiline
              hint="Shown above the checklist on the booking page."
            />

            <div className="admin-field-header" style={{ marginTop: "1rem" }}>
              <span className="admin-label">Add-ons</span>
              <button type="button" className="admin-btn-sm" onClick={addItem}>
                Add item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="admin-empty-card">
                <p>No add-ons yet.</p>
                <div className="admin-empty-card-actions">
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={addItem}
                  >
                    Add item
                  </button>
                </div>
              </div>
            ) : (
              <SortableList
                ids={keys.keys}
                onReorder={reorder}
                className="admin-stack"
              >
                {items.map((item, index) => (
                  <SortableRow key={keys.keys[index]} id={keys.keys[index]}>
                    {({ dragHandleProps }) => (
                      <div className="admin-nested-card">
                        <div className="admin-row-between">
                          <div className="admin-actions">
                            <DragHandle dragHandleProps={dragHandleProps} />
                            <strong>{item.label || "Untitled"}</strong>
                          </div>
                          <ListRowActions
                            onRemove={() => removeItem(index)}
                          />
                        </div>
                        <div className="admin-grid-2">
                          <TextField
                            label="Label"
                            value={item.label}
                            onChange={(label) => updateItem(index, { label })}
                          />
                          <TextField
                            label="Price (USD)"
                            value={String(item.priceUsd ?? 0)}
                            onChange={(value) => {
                              const priceUsd = Number.parseFloat(value);
                              updateItem(index, {
                                priceUsd: Number.isFinite(priceUsd)
                                  ? Math.max(0, Math.round(priceUsd))
                                  : 0,
                              });
                            }}
                          />
                        </div>
                        <TextField
                          label="Description"
                          value={item.description ?? ""}
                          onChange={(description) =>
                            updateItem(index, { description })
                          }
                          multiline
                        />
                        <div className="admin-field">
                          <span className="admin-label">Applies to</span>
                          <div className="admin-chip-row">
                            {APPLIES_OPTIONS.map((option) => {
                              const selected =
                                !item.appliesTo?.length ||
                                item.appliesTo.includes(option.value);
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  className={`admin-chip ${selected ? "admin-chip--active" : ""}`}
                                  onClick={() => {
                                    const current = item.appliesTo?.length
                                      ? [...item.appliesTo]
                                      : (["course", "retreat"] as BookingType[]);
                                    const next = current.includes(option.value)
                                      ? current.filter(
                                          (value) => value !== option.value,
                                        )
                                      : [...current, option.value];
                                    updateItem(index, {
                                      appliesTo:
                                        next.length === 0
                                          ? [option.value]
                                          : next,
                                    });
                                  }}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <label
                          className={`admin-live-switch ${item.active === false ? "admin-live-switch--off" : "admin-live-switch--on"}`}
                        >
                          <span className="admin-live-switch__label">
                            {item.active === false ? "Hidden" : "Active"}
                          </span>
                          <span className="admin-live-switch__track">
                            <span className="admin-live-switch__thumb" />
                          </span>
                          <input
                            className="admin-live-switch__input"
                            type="checkbox"
                            checked={item.active !== false}
                            onChange={(event) =>
                              updateItem(index, {
                                active: event.target.checked,
                              })
                            }
                          />
                        </label>
                      </div>
                    )}
                  </SortableRow>
                ))}
              </SortableList>
            )}
          </CollapsiblePanel>
        </div>
      </div>

      <AdminSaveBar
        title="Booking add-ons"
        subtitle="global_settings.bookingAddons"
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/booking"
      />
    </div>
  );
}
