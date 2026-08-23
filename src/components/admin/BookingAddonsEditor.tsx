"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ListRowActions } from "@/components/admin/ListRowActions";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import {
  DragHandle,
  type DragHandleProps,
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import type {
  BookingAddon,
  BookingAddonKind,
  BookingAddonsContent,
  BookingType,
} from "@/content/types/booking";
import type { ResidentialCourseDocument } from "@/content/types/course";
import { getAddonKind } from "@/lib/booking/addons";
import { parseUsdAmount } from "@/lib/booking/pricing";
import { createEmptyBookingAddons } from "@/lib/cms/structural-defaults";
import { parseApiJson } from "@/lib/types/api";

const APPLIES_OPTIONS: { value: BookingType; label: string }[] = [
  { value: "course", label: "Courses" },
  { value: "retreat", label: "Retreats" },
];

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

type RoomPreview = {
  roomType: string;
  priceUsd: number;
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
      .slice(0, 48) || `addon-${Date.now()}`
  );
}

/**
 * Loads room pricing for a residential course (admin preview).
 *
 * @param slug - Course page slug
 */
async function loadCourseRooms(slug: string): Promise<RoomPreview[]> {
  if (!slug.trim()) return [];
  const res = await fetch(`/api/admin/courses/${encodeURIComponent(slug)}`);
  const body = await parseApiJson<{ course: ResidentialCourseDocument }>(res);
  const pricing = body.course?.pricing ?? [];
  return pricing.map((option) => ({
    roomType: option.roomType,
    priceUsd: parseUsdAmount(option.price),
  }));
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
  const [roomPreviews, setRoomPreviews] = useState<
    Record<string, RoomPreview[]>
  >({});
  const items = doc?.items ?? [];
  const keys = useStableListKeys(items.length);

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
        // Migrate legacy rows (no type) to explicit manual.
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
          (coursesBody.courses ?? []).filter(
            (course) => course.type === "course",
          ),
        );
        setPrograms(
          (pagesBody.pages ?? []).filter(
            (page) => page.type === "course" || page.type === "retreat",
          ),
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

  // Preview rooms for each course add-on row.
  useEffect(() => {
    const courseSlugs = items
      .filter(
        (item): item is Extract<BookingAddon, { type: "course" }> =>
          item.type === "course",
      )
      .map((item) => item.courseSlug.trim())
      .filter(Boolean);

    const unique = [...new Set(courseSlugs)];
    let cancelled = false;

    void Promise.all(
      unique.map(async (slug) => {
        if (roomPreviews[slug]) return;
        try {
          const rooms = await loadCourseRooms(slug);
          if (!cancelled) {
            setRoomPreviews((prev) =>
              prev[slug] ? prev : { ...prev, [slug]: rooms },
            );
          }
        } catch {
          if (!cancelled) {
            setRoomPreviews((prev) =>
              prev[slug] ? prev : { ...prev, [slug]: [] },
            );
          }
        }
      }),
    );

    return () => {
      cancelled = true;
    };
    // roomPreviews intentionally omitted — only refetch when items/slugs change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preview cache
  }, [items]);

  const dirty = useMemo(
    () => Boolean(doc) && JSON.stringify(doc) !== baseline,
    [doc, baseline],
  );

  const programsByType = useMemo(() => {
    return {
      course: programs.filter((program) => program.type === "course"),
      retreat: programs.filter((program) => program.type === "retreat"),
    };
  }, [programs]);

  /**
   * Updates one add-on row.
   *
   * @param index - Row index
   * @param patch - Partial fields
   */
  function updateItem(index: number, patch: Partial<BookingAddon>) {
    if (!doc) return;
    const nextItems = items.map((item, i) => {
      if (i !== index) return item;
      return { ...item, ...patch } as BookingAddon;
    });
    setDoc({ ...doc, items: nextItems });
  }

  /**
   * Appends a custom (manual) add-on.
   */
  function addCustomItem() {
    if (!doc) return;
    keys.addKey();
    const label = "New custom add-on";
    setDoc({
      ...doc,
      items: [
        ...items,
        {
          type: "manual",
          id: addonIdFromLabel(`${label}-${items.length + 1}`),
          label,
          priceUsd: 0,
          description: "",
          appliesTo: ["course", "retreat"],
          programSlugs: [],
          active: true,
        },
      ],
    });
  }

  /**
   * Appends a course add-on (rooms come from the linked course).
   */
  function addCourseItem() {
    if (!doc) return;
    keys.addKey();
    const first = courses[0];
    setDoc({
      ...doc,
      items: [
        ...items,
        {
          type: "course",
          id: addonIdFromLabel(`course-${first?.slug || items.length + 1}`),
          label: "",
          courseSlug: first?.slug ?? "",
          description: "",
          appliesTo: ["course", "retreat"],
          programSlugs: [],
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
      // Persist course add-ons without enriched options (resolved at checkout).
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
            <p className="admin-subtitle">
              Optional extras on /booking and /retreat-booking. Course add-ons
              expose that course&apos;s rooms at checkout.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-tip-banner">
        <strong>Quick guide:</strong> Use <em>Add custom</em> for a fixed-price
        extra, or <em>Add course</em> to upsell another course (guest picks a
        room/package). Scope each row to specific programs when needed. Prices
        are added to the program fee before deposit and PayPal fee.
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
              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={addCustomItem}
                >
                  Add custom
                </button>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={addCourseItem}
                >
                  Add course
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="admin-empty-card">
                <p>No add-ons yet.</p>
                <div className="admin-empty-card-actions">
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={addCustomItem}
                  >
                    Add custom
                  </button>
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={addCourseItem}
                  >
                    Add course
                  </button>
                </div>
              </div>
            ) : (
              <SortableList
                ids={keys.keys}
                onReorder={reorder}
                className="admin-stack"
              >
                {items.map((item, index) => {
                  const kind = getAddonKind(item);
                  return (
                    <SortableRow key={keys.keys[index]} id={keys.keys[index]}>
                      {({ dragHandleProps }) => (
                        <AddonRow
                          item={item}
                          kind={kind}
                          courses={courses}
                          programsByType={programsByType}
                          roomPreview={
                            item.type === "course"
                              ? roomPreviews[item.courseSlug.trim()]
                              : undefined
                          }
                          dragHandleProps={dragHandleProps}
                          onRemove={() => removeItem(index)}
                          onChange={(patch) => updateItem(index, patch)}
                          onCourseSlugChange={(courseSlug) => {
                            updateItem(index, {
                              courseSlug,
                            } as Partial<BookingAddon>);
                            if (courseSlug && !roomPreviews[courseSlug]) {
                              void loadCourseRooms(courseSlug).then((rooms) => {
                                setRoomPreviews((prev) => ({
                                  ...prev,
                                  [courseSlug]: rooms,
                                }));
                              });
                            }
                          }}
                        />
                      )}
                    </SortableRow>
                  );
                })}
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

type AddonRowProps = {
  item: BookingAddon;
  kind: BookingAddonKind;
  courses: CourseOption[];
  programsByType: {
    course: ProgramOption[];
    retreat: ProgramOption[];
  };
  roomPreview?: RoomPreview[];
  dragHandleProps: DragHandleProps;
  onRemove: () => void;
  onChange: (patch: Partial<BookingAddon>) => void;
  onCourseSlugChange: (slug: string) => void;
};

/**
 * One editable add-on row (custom or course).
 *
 * @param props - Row data and handlers
 */
function AddonRow({
  item,
  kind,
  courses,
  programsByType,
  roomPreview,
  dragHandleProps,
  onRemove,
  onChange,
  onCourseSlugChange,
}: AddonRowProps) {
  const title =
    kind === "course"
      ? item.label.trim() ||
        courses.find(
          (course) => item.type === "course" && course.slug === item.courseSlug,
        )?.title ||
        "Course add-on"
      : item.label || "Untitled";

  const appliesTo: BookingType[] = item.appliesTo?.length
    ? item.appliesTo
    : ["course", "retreat"];

  const scopePrograms = [
    ...(appliesTo.includes("course") ? programsByType.course : []),
    ...(appliesTo.includes("retreat") ? programsByType.retreat : []),
  ];

  return (
    <div className="admin-nested-card">
      <div className="admin-row-between">
        <div className="admin-actions">
          <DragHandle dragHandleProps={dragHandleProps} />
          <strong>{title}</strong>
          <span className="admin-hint" style={{ margin: 0 }}>
            {kind === "course" ? "Course" : "Custom"}
          </span>
        </div>
        <ListRowActions onRemove={onRemove} />
      </div>

      {kind === "manual" ? (
        <>
          <div className="admin-grid-2">
            <TextField
              label="Label"
              value={item.label}
              onChange={(label) => onChange({ label })}
            />
            <TextField
              label="Price (USD)"
              value={String(item.priceUsd ?? 0)}
              onChange={(value) => {
                const priceUsd = Number.parseFloat(value);
                onChange({
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
            onChange={(description) => onChange({ description })}
            multiline
          />
        </>
      ) : (
        <>
          <div className="admin-field">
            <label className="admin-label" htmlFor={`addon-course-${item.id}`}>
              Linked course
            </label>
            <select
              id={`addon-course-${item.id}`}
              className="admin-input"
              value={item.type === "course" ? item.courseSlug : ""}
              onChange={(event) => onCourseSlugChange(event.target.value)}
            >
              <option value="">Select a course…</option>
              {courses.map((course) => (
                <option key={course.slug} value={course.slug}>
                  {course.title}
                  {!course.published ? " (draft)" : ""}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="Label override (optional)"
            value={item.label}
            onChange={(label) => onChange({ label })}
            hint="Leave blank to use the course title at checkout."
          />
          <TextField
            label="Description"
            value={item.description ?? ""}
            onChange={(description) => onChange({ description })}
            multiline
          />
          <div className="admin-field">
            <span className="admin-label">Rooms from course (preview)</span>
            {!item.type || item.type !== "course" || !item.courseSlug ? (
              <p className="admin-hint">Select a course to preview rooms.</p>
            ) : roomPreview === undefined ? (
              <p className="admin-hint">Loading rooms…</p>
            ) : roomPreview.length === 0 ? (
              <p className="admin-hint">
                No pricing rooms found on this course.
              </p>
            ) : (
              <ul
                className="admin-hint"
                style={{ margin: 0, paddingLeft: "1.1rem" }}
              >
                {roomPreview.map((room) => (
                  <li key={room.roomType}>
                    {room.roomType} — {Math.round(room.priceUsd)} USD
                  </li>
                ))}
              </ul>
            )}
            <p className="admin-hint">
              Guests pick one of these rooms when they opt into this add-on.
              Prices come from the course catalog at booking time.
            </p>
          </div>
        </>
      )}

      <div className="admin-field">
        <span className="admin-label">Applies to</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {APPLIES_OPTIONS.map((option) => {
            const selected = appliesTo.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={`admin-chip ${selected ? "admin-chip--active" : ""}`}
                onClick={() => {
                  const next = selected
                    ? appliesTo.filter((value) => value !== option.value)
                    : [...appliesTo, option.value];
                  onChange({
                    appliesTo: next.length === 0 ? [option.value] : next,
                  });
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-field">
        <span className="admin-label">Show on programs</span>
        <p className="admin-hint">
          Leave all unselected to show on every program in the types above.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {scopePrograms.length === 0 ? (
            <span className="admin-hint">No programs found.</span>
          ) : (
            scopePrograms.map((program) => {
              const selected =
                !item.programSlugs?.length ||
                item.programSlugs.includes(program.slug);
              const explicit = Boolean(item.programSlugs?.length);
              return (
                <button
                  key={program.slug}
                  type="button"
                  className={`admin-chip ${!explicit || selected ? "admin-chip--active" : ""}`}
                  onClick={() => {
                    const current = item.programSlugs?.length
                      ? [...item.programSlugs]
                      : scopePrograms.map((entry) => entry.slug);
                    const next = current.includes(program.slug)
                      ? current.filter((slug) => slug !== program.slug)
                      : [...current, program.slug];
                    // All selected → store empty (means all).
                    const allSelected =
                      next.length === scopePrograms.length &&
                      scopePrograms.every((entry) => next.includes(entry.slug));
                    onChange({
                      programSlugs:
                        allSelected || next.length === 0 ? [] : next,
                    });
                  }}
                >
                  {program.title}
                </button>
              );
            })
          )}
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
          onChange={(event) => onChange({ active: event.target.checked })}
        />
      </label>
    </div>
  );
}
