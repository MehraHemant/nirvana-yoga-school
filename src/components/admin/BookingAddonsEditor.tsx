"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import {
  DragHandle,
  type DragHandleProps,
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import type {
  BookingAddon,
  BookingAddonOption,
  BookingAddonsContent,
  BookingType,
} from "@/content/types/booking";
import { createEmptyBookingAddons } from "@/lib/cms/structural-defaults";
import { parseApiJson } from "@/lib/types/api";

type ProgramOption = {
  slug: string;
  title: string;
  type: string;
};

/** Editable room row (price kept as text while typing). */
type OptionDraft = {
  id: string;
  label: string;
  price: string;
};

type AddonDraft = {
  label: string;
  description: string;
  where: string;
  exclude: string[];
  options: OptionDraft[];
};

/**
 * Short random id for a room option.
 */
function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Blank room row for the composer.
 */
function blankOption(): OptionDraft {
  return { id: randomId(), label: "", price: "" };
}

/**
 * Fresh composer state.
 */
function emptyDraft(): AddonDraft {
  return {
    label: "",
    description: "",
    where: "all",
    exclude: [],
    options: [blankOption()],
  };
}

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
      .slice(0, 48) || "addon"
  );
}

/**
 * Returns an id that does not collide with add-ons already in the list.
 *
 * @param label - Source text
 * @param ids - Ids already used
 */
function uniqueAddonId(label: string, ids: string[]): string {
  const base = addonIdFromLabel(label);
  if (!ids.includes(base)) return base;
  let n = 2;
  while (ids.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Parses a USD amount, rounding to a whole dollar.
 *
 * @param value - Raw input
 */
function parsePrice(value: string): number {
  const price = Number.parseFloat(value);
  if (!Number.isFinite(price)) return 0;
  return Math.max(0, Math.round(price));
}

/**
 * Select value for where an add-on is offered.
 *
 * @param item - Add-on row
 */
function whereKey(item: BookingAddon): string {
  const slugs = (item.programSlugs ?? []).filter(Boolean);
  if (slugs.length > 1) return "multi";
  if (slugs.length === 1) return `program:${slugs[0]}`;
  if (item.appliesTo?.length === 1) return item.appliesTo[0];
  return "all";
}

/**
 * Label for an add-on limited to several programs.
 *
 * @param item - Add-on row
 * @param programs - Bookable programs
 */
function multiWhereLabel(
  item: BookingAddon,
  programs: ProgramOption[],
): string {
  const titles = (item.programSlugs ?? [])
    .filter(Boolean)
    .map(
      (slug) =>
        programs.find((program) => program.slug === slug)?.title ?? slug,
    );
  if (titles.length <= 2) return titles.join(", ");
  return `${titles.length} programs`;
}

/**
 * Maps the "shown on" select to stored scope fields.
 *
 * @param where - Select value
 * @param programs - Bookable programs
 */
function whereFields(
  where: string,
  programs: ProgramOption[],
): Pick<BookingAddon, "appliesTo" | "programSlugs"> {
  if (where === "course" || where === "retreat") {
    return { appliesTo: [where], programSlugs: [] };
  }
  if (where.startsWith("program:")) {
    const slug = where.slice("program:".length);
    const program = programs.find((entry) => entry.slug === slug);
    const type: BookingType =
      program?.type === "retreat" ? "retreat" : "course";
    return { appliesTo: [type], programSlugs: slug ? [slug] : [] };
  }
  return { appliesTo: ["course", "retreat"], programSlugs: [] };
}

type WhereSelectProps = {
  id: string;
  value: string;
  programs: ProgramOption[];
  multiLabel?: string;
  compact?: boolean;
  onChange: (value: string) => void;
};

/**
 * Where an add-on appears: every booking, one type, or one program.
 *
 * @param props - Current scope and program list
 */
function WhereSelect({
  id,
  value,
  programs,
  multiLabel,
  compact = false,
  onChange,
}: WhereSelectProps) {
  const programSlug = value.startsWith("program:")
    ? value.slice("program:".length)
    : "";
  const known = programs.some((program) => program.slug === programSlug);
  const courses = programs.filter((program) => program.type === "course");
  const retreats = programs.filter((program) => program.type === "retreat");

  return (
    <select
      id={id}
      className={`admin-input admin-select${compact ? " admin-input--compact" : ""}`}
      aria-label="Shown on"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {value === "multi" ? (
        <option value="multi">{multiLabel || "Several programs"}</option>
      ) : null}
      <option value="all">All bookings</option>
      <option value="course">All courses</option>
      <option value="retreat">All retreats</option>
      {programSlug && !known ? (
        <option value={value}>{programSlug}</option>
      ) : null}
      {courses.length > 0 ? (
        <optgroup label="Only when booking this course">
          {courses.map((program) => (
            <option key={program.slug} value={`program:${program.slug}`}>
              {program.title}
            </option>
          ))}
        </optgroup>
      ) : null}
      {retreats.length > 0 ? (
        <optgroup label="Only when booking this retreat">
          {retreats.map((program) => (
            <option key={program.slug} value={`program:${program.slug}`}>
              {program.title}
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  );
}

type ExcludePickerProps = {
  id: string;
  value: string[];
  programs: ProgramOption[];
  onChange: (value: string[]) => void;
};

/**
 * Courses / retreats where an add-on must never appear.
 *
 * @param props - Excluded slugs and program list
 */
function ExcludePicker({ id, value, programs, onChange }: ExcludePickerProps) {
  const available = programs.filter((program) => !value.includes(program.slug));
  const courses = available.filter((program) => program.type === "course");
  const retreats = available.filter((program) => program.type === "retreat");
  const titleFor = (slug: string) =>
    programs.find((program) => program.slug === slug)?.title ?? slug;

  return (
    <div className="admin-addon-exclude">
      <label className="admin-addon-exclude__label" htmlFor={id}>
        Exclude from
      </label>
      {value.map((slug) => (
        <span key={slug} className="admin-addon-exclude__chip">
          {titleFor(slug)}
          <button
            type="button"
            aria-label={`Stop excluding ${titleFor(slug)}`}
            onClick={() => onChange(value.filter((entry) => entry !== slug))}
          >
            ✕
          </button>
        </span>
      ))}
      <select
        id={id}
        className="admin-input admin-select admin-input--compact admin-addon-exclude__select"
        value=""
        onChange={(event) => {
          const slug = event.target.value;
          if (slug && !value.includes(slug)) onChange([...value, slug]);
        }}
      >
        <option value="">
          {value.length === 0 ? "No exclusions — add a program…" : "Add…"}
        </option>
        {courses.length > 0 ? (
          <optgroup label="Courses">
            {courses.map((program) => (
              <option key={program.slug} value={program.slug}>
                {program.title}
              </option>
            ))}
          </optgroup>
        ) : null}
        {retreats.length > 0 ? (
          <optgroup label="Retreats">
            {retreats.map((program) => (
              <option key={program.slug} value={program.slug}>
                {program.title}
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>
    </div>
  );
}

type OptionRowsProps = {
  rows: OptionDraft[];
  onChange: (rows: OptionDraft[]) => void;
};

/**
 * Editable list of room / package options with a USD price each.
 *
 * @param props - Rows and change handler
 */
function OptionRows({ rows, onChange }: OptionRowsProps) {
  const lastLabelRef = useRef<HTMLInputElement>(null);
  const [focusNew, setFocusNew] = useState(false);

  useEffect(() => {
    if (!focusNew) return;
    lastLabelRef.current?.focus();
    setFocusNew(false);
  }, [focusNew]);

  function patch(index: number, next: Partial<OptionDraft>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...next } : row)));
  }

  function addRow() {
    onChange([...rows, blankOption()]);
    setFocusNew(true);
  }

  return (
    <div className="admin-addon-options">
      <div className="admin-addon-options__head">
        <span>Room / option</span>
        <span>Price (USD)</span>
        <span />
      </div>
      {rows.map((row, index) => (
        <div key={row.id} className="admin-addon-options__row">
          <input
            ref={index === rows.length - 1 ? lastLabelRef : undefined}
            className="admin-input admin-input--compact"
            value={row.label}
            placeholder="Private Room with Balcony"
            aria-label={`Room option ${index + 1} name`}
            autoComplete="off"
            onChange={(event) => patch(index, { label: event.target.value })}
          />
          <input
            className="admin-input admin-input--compact"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={row.price}
            placeholder="499"
            aria-label={`Room option ${index + 1} price in USD`}
            onChange={(event) => patch(index, { price: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter" && index === rows.length - 1) {
                event.preventDefault();
                addRow();
              }
            }}
          />
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--danger"
            aria-label={`Remove room option ${index + 1}`}
            disabled={rows.length === 1}
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn-sm" onClick={addRow}>
        + Add room option
      </button>
    </div>
  );
}

/**
 * Converts stored options to editable rows.
 *
 * @param options - Stored options
 */
function toRows(options: BookingAddonOption[] | undefined): OptionDraft[] {
  const rows = (options ?? []).map((option) => ({
    id: option.id.split("::").pop() || randomId(),
    label: option.label,
    price: String(option.priceUsd ?? ""),
  }));
  return rows.length > 0 ? rows : [blankOption()];
}

/**
 * Converts editable rows to stored options (drops rows without a name).
 *
 * @param addonId - Parent add-on id
 * @param rows - Editable rows
 */
function fromRows(addonId: string, rows: OptionDraft[]): BookingAddonOption[] {
  return rows
    .filter((row) => row.label.trim())
    .map((row) => ({
      id: `${addonId}::${row.id}`,
      label: row.label.trim(),
      priceUsd: parsePrice(row.price),
    }));
}

/** Add-on as held in the editor: room rows are kept as drafts. */
type EditorItem = BookingAddon & { rows?: OptionDraft[] };

/**
 * Admin editor for optional booking checkout add-ons
 * (each add-on = a name plus room options with their own prices).
 */
export function BookingAddonsEditor() {
  const [doc, setDoc] = useState<
    (Omit<BookingAddonsContent, "items"> & { items: EditorItem[] }) | null
  >(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [draft, setDraft] = useState<AddonDraft>(emptyDraft);
  const nameRef = useRef<HTMLInputElement>(null);
  const items = doc?.items ?? [];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/admin/settings/bookingAddons").then((res) =>
        parseApiJson<{ settings: BookingAddonsContent }>(res),
      ),
      fetch("/api/admin/pages").then((res) =>
        parseApiJson<{ pages: ProgramOption[] }>(res),
      ),
    ])
      .then(([addonsBody, pagesBody]) => {
        if (cancelled) return;
        const stored = addonsBody.settings ?? createEmptyBookingAddons();
        const next = {
          ...stored,
          items: (stored.items ?? []).map((item): EditorItem => {
            if (item.type === "rooms") {
              return { ...item, rows: toRows(item.options) };
            }
            if (item.type === "course") return item;
            return {
              ...item,
              type: "manual" as const,
              priceUsd: item.priceUsd ?? 0,
            };
          }),
        };
        setDoc(next);
        setBaseline(JSON.stringify(next));
        setPrograms(
          (pagesBody.pages ?? [])
            .filter((page) => page.type === "course" || page.type === "retreat")
            .sort((a, b) => a.title.localeCompare(b.title)),
        );
      })
      .catch((err: Error) => {
        if (cancelled) return;
        const fallback = { ...createEmptyBookingAddons() };
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

  const dirty = Boolean(doc) && JSON.stringify(doc) !== baseline;
  const draftHasRoom = draft.options.some((row) => row.label.trim());
  const canAdd = draft.label.trim().length > 0 && draftHasRoom;

  /**
   * Patches one add-on row.
   *
   * @param index - Row index
   * @param patch - Partial fields
   */
  function updateItem(index: number, patch: Partial<EditorItem>) {
    setDoc((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item, i) =>
          i === index ? ({ ...item, ...patch } as EditorItem) : item,
        ),
      };
    });
  }

  /**
   * Replaces one add-on entirely (used when converting legacy kinds).
   *
   * @param index - Row index
   * @param next - New add-on
   */
  function replaceItem(index: number, next: EditorItem) {
    setDoc((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item, i) => (i === index ? next : item)),
      };
    });
  }

  /**
   * Appends the draft as a new room-options add-on and resets the form.
   *
   * @param event - Form submit
   */
  function addItem(event: FormEvent) {
    event.preventDefault();
    if (!canAdd) return;

    const label = draft.label.trim();
    const description = draft.description.trim();
    const scope = whereFields(draft.where, programs);
    const rows = draft.options.filter((row) => row.label.trim());

    setDoc((current) => {
      if (!current) return current;
      const ids = current.items.map((item) => item.id);
      const id = uniqueAddonId(label, ids);
      const next: EditorItem = {
        type: "rooms",
        id,
        label,
        description,
        options: fromRows(id, rows),
        rows,
        ...scope,
        excludeProgramSlugs: draft.exclude,
        active: true,
      };
      return { ...current, items: [...current.items, next] };
    });

    setDraft((prev) => ({
      ...emptyDraft(),
      where: prev.where,
      exclude: prev.exclude,
    }));
    window.requestAnimationFrame(() => nameRef.current?.focus());
  }

  /**
   * Removes one add-on.
   *
   * @param index - Row index
   */
  function removeItem(index: number) {
    const item = items[index];
    if (item && !window.confirm(`Remove “${item.label || "this add-on"}”?`)) {
      return;
    }
    setDoc((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.filter((_, i) => i !== index),
      };
    });
  }

  /**
   * Reorders add-ons after a drag.
   *
   * @param fromIndex - Drag source
   * @param toIndex - Drop target
   */
  function reorder(fromIndex: number, toIndex: number) {
    setDoc((current) => {
      if (!current) return current;
      return {
        ...current,
        items: reorderItems(current.items, fromIndex, toIndex),
      };
    });
  }

  async function handleSave() {
    if (!doc) return;

    const missing = doc.items.find(
      (item) =>
        item.type === "rooms" &&
        fromRows(item.id, item.rows ?? []).length === 0,
    );
    if (missing) {
      setError(
        `Add at least one room option to “${missing.label || "untitled add-on"}”.`,
      );
      return;
    }
    const unnamed = doc.items.find(
      (item) => item.type !== "course" && !item.label.trim(),
    );
    if (unnamed) {
      setError("Every add-on needs a name.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const value: BookingAddonsContent = {
        ...doc,
        items: doc.items.map((item): BookingAddon => {
          if (item.type === "rooms") {
            const { rows, priceUsd: _price, ...rest } = item;
            return {
              ...rest,
              label: rest.label.trim(),
              options: fromRows(item.id, rows ?? []),
            };
          }
          if (item.type === "course") {
            const { options: _options, priceUsd: _price, ...rest } = item;
            return rest;
          }
          const { rows: _rows, ...rest } = item;
          return rest;
        }),
      };
      const res = await fetch("/api/admin/settings/bookingAddons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
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
            <p className="admin-subtitle admin-subtitle--flush">
              Add an extra course or package with its own room options and
              prices. Guests pick one room per add-on on the booking page.
            </p>
          </div>
          <SectionLiveField
            id="booking-addons-live"
            value={doc.live}
            onChange={(live) => setDoc({ ...doc, live })}
            liveLabel="Shown"
            hiddenLabel="Hidden"
          />
        </div>
      </div>

      <form className="admin-addon-composer" onSubmit={addItem}>
        <h2 className="admin-addon-composer__title">New add-on</h2>
        <div className="admin-addon-composer__fields">
          <div className="admin-addon-field">
            <label className="admin-label" htmlFor="addon-add-name">
              Name
            </label>
            <input
              ref={nameRef}
              id="addon-add-name"
              className="admin-input"
              value={draft.label}
              placeholder="6-Day 50-Hour Yin Yoga Teacher Training (26th to 31st every month)"
              autoComplete="off"
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, label: event.target.value }))
              }
            />
          </div>
          <div className="admin-addon-field">
            <label className="admin-label" htmlFor="addon-add-where">
              Shown on
            </label>
            <WhereSelect
              id="addon-add-where"
              value={draft.where}
              programs={programs}
              onChange={(where) => setDraft((prev) => ({ ...prev, where }))}
            />
          </div>
        </div>

        <ExcludePicker
          id="addon-add-exclude"
          value={draft.exclude}
          programs={programs}
          onChange={(exclude) => setDraft((prev) => ({ ...prev, exclude }))}
        />

        <OptionRows
          rows={draft.options}
          onChange={(options) => setDraft((prev) => ({ ...prev, options }))}
        />

        <div className="admin-addon-composer__note">
          <input
            className="admin-input"
            value={draft.description}
            placeholder="Optional note guests will see (dates, what's included…)"
            aria-label="Note"
            autoComplete="off"
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </div>

        <div className="admin-addon-composer__footer">
          <p className="admin-hint admin-hint--tight">
            {canAdd
              ? "Add it to the list below, then Save."
              : "Enter a name and at least one room option."}
          </p>
          <button type="submit" className="admin-btn" disabled={!canAdd}>
            Add add-on
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="admin-hint">No add-ons yet.</p>
      ) : (
        <SortableList
          ids={items.map((item) => item.id)}
          onReorder={reorder}
          className="admin-addon-cards"
        >
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              id={item.id}
              className={`admin-addon-card${
                item.active === false ? " admin-addon-card--off" : ""
              }`}
            >
              {({ dragHandleProps }) => (
                <AddonCard
                  item={item}
                  index={index}
                  programs={programs}
                  dragHandleProps={dragHandleProps}
                  onChange={(patch) => updateItem(index, patch)}
                  onReplace={(next) => replaceItem(index, next)}
                  onRemove={() => removeItem(index)}
                />
              )}
            </SortableRow>
          ))}
        </SortableList>
      )}

      <div className="admin-addon-intro">
        <label className="admin-label" htmlFor="addon-intro">
          Text above the list
        </label>
        <input
          id="addon-intro"
          className="admin-input"
          value={doc.intro ?? ""}
          placeholder="Select Add-on Course (Optional)"
          onChange={(event) => setDoc({ ...doc, intro: event.target.value })}
        />
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

type AddonCardProps = {
  item: EditorItem;
  index: number;
  programs: ProgramOption[];
  dragHandleProps: DragHandleProps;
  onChange: (patch: Partial<EditorItem>) => void;
  onReplace: (next: EditorItem) => void;
  onRemove: () => void;
};

/**
 * One saved add-on: name, scope, visibility and its room options.
 *
 * @param props - Add-on and handlers
 */
function AddonCard({
  item,
  index,
  programs,
  dragHandleProps,
  onChange,
  onReplace,
  onRemove,
}: AddonCardProps) {
  const where = whereKey(item);
  const common = {
    id: item.id,
    label: item.label,
    description: item.description,
    appliesTo: item.appliesTo,
    programSlugs: item.programSlugs,
    excludeProgramSlugs: item.excludeProgramSlugs,
    active: item.active,
  };

  return (
    <>
      <div className="admin-addon-card__top">
        <DragHandle dragHandleProps={dragHandleProps} />
        <input
          className="admin-input admin-addon-card__name"
          value={item.label}
          aria-label={`Add-on ${index + 1} name`}
          placeholder={
            item.type === "course" ? "Uses the course title" : "Name"
          }
          onChange={(event) => onChange({ label: event.target.value })}
        />
        <WhereSelect
          id={`addon-where-${item.id}`}
          value={where}
          programs={programs}
          multiLabel={multiWhereLabel(item, programs)}
          compact
          onChange={(next) => {
            if (next === "multi") return;
            onChange(whereFields(next, programs));
          }}
        />
        <SectionLiveField
          id={`addon-on-${item.id}`}
          value={item.active}
          onChange={(active) => onChange({ active })}
          liveLabel="On"
          hiddenLabel="Off"
        />
        <button
          type="button"
          className="admin-btn-sm admin-btn-sm--danger"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>

      <input
        className="admin-input admin-input--compact admin-addon-note"
        value={item.description ?? ""}
        aria-label={`Add-on ${index + 1} note`}
        placeholder="Note guests will see (optional)"
        onChange={(event) => onChange({ description: event.target.value })}
      />

      <ExcludePicker
        id={`addon-exclude-${item.id}`}
        value={item.excludeProgramSlugs ?? []}
        programs={programs}
        onChange={(excludeProgramSlugs) => onChange({ excludeProgramSlugs })}
      />

      {item.type === "rooms" ? (
        <OptionRows
          rows={item.rows ?? [blankOption()]}
          onChange={(rows) => onChange({ rows })}
        />
      ) : item.type === "course" ? (
        <div className="admin-addon-legacy">
          <p className="admin-hint admin-hint--tight">
            Linked to course <code>{item.courseSlug}</code> — room prices come
            from that course. Convert it to set your own rooms and prices.
          </p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() =>
              onReplace({
                ...common,
                label: item.label.trim() || item.courseSlug,
                type: "rooms",
                options: [],
                rows: [blankOption()],
              })
            }
          >
            Convert to custom rooms
          </button>
        </div>
      ) : (
        <div className="admin-addon-legacy">
          <label className="admin-addon-flat">
            <span className="admin-label">Single price (USD)</span>
            <input
              className="admin-input admin-input--compact"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              aria-label={`Add-on ${index + 1} price in USD`}
              value={String(item.priceUsd ?? 0)}
              onChange={(event) =>
                onChange({ priceUsd: parsePrice(event.target.value) })
              }
            />
          </label>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() =>
              onReplace({
                ...common,
                type: "rooms",
                options: [],
                rows: [
                  {
                    id: randomId(),
                    label: "Standard",
                    price: String(item.priceUsd ?? ""),
                  },
                ],
              })
            }
          >
            Use room options instead
          </button>
        </div>
      )}
    </>
  );
}
