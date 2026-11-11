"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { ListRowActions } from "@/components/admin/ListRowActions";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import {
  type DragHandleProps,
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import type {
  BookingAddon,
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

type CourseOption = {
  slug: string;
  title: string;
  type: string;
  published: boolean;
};

type AddKind = "manual" | "course";

type AddonDraft = {
  kind: AddKind;
  label: string;
  price: string;
  description: string;
  courseSlug: string;
  where: string;
};

const EMPTY_DRAFT: AddonDraft = {
  kind: "manual",
  label: "",
  price: "",
  description: "",
  courseSlug: "",
  where: "all",
};

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
        <optgroup label="Only one course">
          {courses.map((program) => (
            <option key={program.slug} value={`program:${program.slug}`}>
              {program.title}
            </option>
          ))}
        </optgroup>
      ) : null}
      {retreats.length > 0 ? (
        <optgroup label="Only one retreat">
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
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [draft, setDraft] = useState<AddonDraft>(EMPTY_DRAFT);
  const nameRef = useRef<HTMLInputElement>(null);
  const courseRef = useRef<HTMLSelectElement>(null);
  const items = doc?.items ?? [];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/admin/settings/bookingAddons").then((res) =>
        parseApiJson<{ settings: BookingAddonsContent }>(res),
      ),
      fetch("/api/admin/courses").then((res) =>
        parseApiJson<{ courses: CourseOption[] }>(res),
      ),
      fetch("/api/admin/pages").then((res) =>
        parseApiJson<{ pages: ProgramOption[] }>(res),
      ),
    ])
      .then(([addonsBody, coursesBody, pagesBody]) => {
        if (cancelled) return;
        const next = addonsBody.settings ?? createEmptyBookingAddons();
        next.items = (next.items ?? []).map((item) =>
          item.type === "course"
            ? item
            : {
                ...item,
                type: "manual" as const,
                priceUsd: item.priceUsd ?? 0,
              },
        );
        setDoc(next);
        setBaseline(JSON.stringify(next));
        setCourses(
          (coursesBody.courses ?? [])
            .filter((course) => course.type === "course")
            .sort((a, b) => a.title.localeCompare(b.title)),
        );
        setPrograms(
          (pagesBody.pages ?? [])
            .filter((page) => page.type === "course" || page.type === "retreat")
            .sort((a, b) => a.title.localeCompare(b.title)),
        );
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

  const dirty = Boolean(doc) && JSON.stringify(doc) !== baseline;
  const canAdd =
    draft.kind === "manual"
      ? draft.label.trim().length > 0
      : draft.courseSlug.trim().length > 0;

  /**
   * Patches one add-on row.
   *
   * @param index - Row index
   * @param patch - Partial fields
   */
  function updateItem(index: number, patch: Partial<BookingAddon>) {
    setDoc((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item, i) =>
          i === index ? ({ ...item, ...patch } as BookingAddon) : item,
        ),
      };
    });
  }

  /**
   * Appends the draft as a new add-on and clears the name fields.
   *
   * @param event - Form submit
   */
  function addItem(event: FormEvent) {
    event.preventDefault();
    if (!canAdd) return;

    const label = draft.label.trim();
    const description = draft.description.trim();
    const scope = whereFields(draft.where, programs);
    const kind = draft.kind;

    setDoc((current) => {
      if (!current) return current;
      const ids = current.items.map((item) => item.id);
      const next: BookingAddon =
        kind === "manual"
          ? {
              type: "manual",
              id: uniqueAddonId(label, ids),
              label,
              priceUsd: parsePrice(draft.price),
              description,
              ...scope,
              active: true,
            }
          : {
              type: "course",
              id: uniqueAddonId(label || draft.courseSlug, ids),
              label,
              courseSlug: draft.courseSlug,
              description,
              ...scope,
              active: true,
            };
      return { ...current, items: [...current.items, next] };
    });

    setDraft((prev) => ({
      ...prev,
      label: "",
      price: "",
      description: "",
      courseSlug: "",
    }));
    window.requestAnimationFrame(() => {
      if (kind === "manual") nameRef.current?.focus();
      else courseRef.current?.focus();
    });
  }

  /**
   * Removes one add-on row.
   *
   * @param index - Row index
   */
  function removeItem(index: number) {
    setDoc((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.filter((_, i) => i !== index),
      };
    });
  }

  /**
   * Reorders add-on rows after a drag.
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
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const value: BookingAddonsContent = {
        ...doc,
        items: doc.items.map((item) => {
          if (item.type === "course") {
            const { options: _options, priceUsd: _price, ...rest } = item;
            return rest;
          }
          return item;
        }),
      };
      const res = await fetch("/api/admin/settings/bookingAddons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      await parseApiJson(res);
      setDoc(value);
      setBaseline(JSON.stringify(value));
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
              Type a name and price, then Add. Guests see these on the booking
              page.
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
        <div className="admin-addon-composer__kinds">
          <button
            type="button"
            className={`admin-chip${draft.kind === "manual" ? " admin-chip--active" : ""}`}
            onClick={() => {
              setDraft((prev) => ({ ...prev, kind: "manual" }));
              window.requestAnimationFrame(() => nameRef.current?.focus());
            }}
          >
            Fixed price
          </button>
          <button
            type="button"
            className={`admin-chip${draft.kind === "course" ? " admin-chip--active" : ""}`}
            onClick={() => {
              setDraft((prev) => ({ ...prev, kind: "course" }));
              window.requestAnimationFrame(() => courseRef.current?.focus());
            }}
          >
            Course rooms
          </button>
        </div>

        <div
          className={`admin-addon-composer__fields${
            draft.kind === "course"
              ? " admin-addon-composer__fields--course"
              : ""
          }`}
        >
          {draft.kind === "manual" ? (
            <>
              <div className="admin-addon-field">
                <label className="admin-label" htmlFor="addon-add-name">
                  Name
                </label>
                <input
                  ref={nameRef}
                  id="addon-add-name"
                  className="admin-input"
                  value={draft.label}
                  placeholder="Airport pickup"
                  autoComplete="off"
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, label: event.target.value }))
                  }
                />
              </div>
              <div className="admin-addon-field">
                <label className="admin-label" htmlFor="addon-add-price">
                  USD
                </label>
                <input
                  id="addon-add-price"
                  className="admin-input"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={draft.price}
                  placeholder="40"
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, price: event.target.value }))
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="admin-addon-field">
                <label className="admin-label" htmlFor="addon-add-course">
                  Course
                </label>
                <select
                  ref={courseRef}
                  id="addon-add-course"
                  className="admin-input admin-select"
                  value={draft.courseSlug}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      courseSlug: event.target.value,
                    }))
                  }
                >
                  <option value="">Choose a course…</option>
                  {courses.map((course) => (
                    <option key={course.slug} value={course.slug}>
                      {course.title}
                      {!course.published ? " (draft)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-addon-field">
                <label className="admin-label" htmlFor="addon-add-name">
                  Name
                </label>
                <input
                  id="addon-add-name"
                  className="admin-input"
                  value={draft.label}
                  placeholder="Optional"
                  autoComplete="off"
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, label: event.target.value }))
                  }
                />
              </div>
            </>
          )}

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

          <div className="admin-addon-composer__submit">
            <button type="submit" className="admin-btn" disabled={!canAdd}>
              Add
            </button>
          </div>
        </div>

        <div className="admin-addon-composer__note">
          <input
            className="admin-input"
            value={draft.description}
            placeholder="Optional note guests will see"
            aria-label="Note"
            autoComplete="off"
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </div>
        <p className="admin-hint admin-hint--tight">
          {draft.kind === "manual"
            ? "A set amount, added to the program fee."
            : "The guest picks a room. Hidden when they are already booking that course."}
          {draft.kind === "course" && courses.length === 0
            ? " No courses found yet."
            : ""}
        </p>
      </form>

      {items.length === 0 ? (
        <p className="admin-hint">No add-ons yet.</p>
      ) : (
        <div className="admin-compact-table-scroll">
          <div className="admin-compact-table admin-addon-table">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span>Name</span>
              <span>USD / course</span>
              <span>Shown on</span>
              <span>Visible</span>
              <span />
            </div>
            <SortableList
              ids={items.map((item) => item.id)}
              onReorder={reorder}
            >
              {items.map((item, index) => (
                <SortableRow
                  key={item.id}
                  id={item.id}
                  className={`admin-compact-table-row${
                    item.active === false
                      ? " admin-compact-table-row--muted"
                      : ""
                  }`}
                >
                  {({ dragHandleProps }) => (
                    <AddonRowFields
                      item={item}
                      index={index}
                      courses={courses}
                      programs={programs}
                      dragHandleProps={dragHandleProps}
                      onChange={(patch) => updateItem(index, patch)}
                      onRemove={() => removeItem(index)}
                    />
                  )}
                </SortableRow>
              ))}
            </SortableList>
          </div>
        </div>
      )}

      <div className="admin-addon-intro">
        <label className="admin-label" htmlFor="addon-intro">
          Text above the list
        </label>
        <input
          id="addon-intro"
          className="admin-input"
          value={doc.intro ?? ""}
          placeholder="Optional. Shown above the extras on the booking page."
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

type AddonRowFieldsProps = {
  item: BookingAddon;
  index: number;
  courses: CourseOption[];
  programs: ProgramOption[];
  dragHandleProps: DragHandleProps;
  onChange: (patch: Partial<BookingAddon>) => void;
  onRemove: () => void;
};

/**
 * Inline fields for one saved add-on.
 *
 * @param props - Row data and handlers
 */
function AddonRowFields({
  item,
  index,
  courses,
  programs,
  dragHandleProps,
  onChange,
  onRemove,
}: AddonRowFieldsProps) {
  const where = whereKey(item);
  const courseSlug = item.type === "course" ? item.courseSlug : "";
  const courseKnown = courses.some((course) => course.slug === courseSlug);

  return (
    <>
      <span className="admin-addon-name">
        <input
          className="admin-input admin-input--compact"
          value={item.label}
          aria-label={`Add-on ${index + 1} name`}
          placeholder={
            item.type === "course" ? "Uses the course title" : "Name"
          }
          onChange={(event) => onChange({ label: event.target.value })}
        />
        <input
          className="admin-input admin-input--compact admin-addon-note"
          value={item.description ?? ""}
          aria-label={`Add-on ${index + 1} note`}
          placeholder="Note (optional)"
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </span>
      <span>
        {item.type === "course" ? (
          <select
            className="admin-input admin-select admin-input--compact"
            aria-label={`Add-on ${index + 1} course`}
            value={courseSlug}
            onChange={(event) =>
              onChange({
                courseSlug: event.target.value,
              } as Partial<BookingAddon>)
            }
          >
            <option value="">Choose a course…</option>
            {courseSlug && !courseKnown ? (
              <option value={courseSlug}>{courseSlug}</option>
            ) : null}
            {courses.map((course) => (
              <option key={course.slug} value={course.slug}>
                {course.title}
                {!course.published ? " (draft)" : ""}
              </option>
            ))}
          </select>
        ) : (
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
        )}
      </span>
      <span>
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
      </span>
      <span className="admin-addon-switch">
        <SectionLiveField
          id={`addon-on-${item.id}`}
          value={item.active}
          onChange={(active) => onChange({ active })}
          liveLabel="On"
          hiddenLabel="Off"
        />
      </span>
      <span className="admin-compact-col admin-compact-col--actions">
        <ListRowActions dragHandleProps={dragHandleProps} onRemove={onRemove} />
      </span>
    </>
  );
}
