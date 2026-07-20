"use client";

import { useEffect, useMemo, useState } from "react";
import { teacherSlug } from "@/content/teachers-slug";
import type { SitePagePerson } from "@/content/types/site-page";
import { parseApiJson } from "@/lib/types/api";
import { ListRowActions } from "./ListRowActions";
import { reorderItems, SortableList, SortableRow } from "./SortableList";

export type FacultyOption = {
  /** Stable database row identifier. */
  id: string;
  /** Stable slug from teacher name. */
  slug: string;
  /** Display name. */
  name: string;
  /** Optional compact display metadata. */
  image?: string;
  /** Optional compact display metadata. */
  role?: string;
};

/**
 * Small round avatar for a faculty option, falling back to an initial.
 *
 * @param props - Faculty option to render
 */
function TeacherAvatar({ item }: { item: FacultyOption }) {
  if (item.image) {
    return (
      // biome-ignore lint/performance/noImgElement: CMS images use arbitrary URLs.
      <img src={item.image} alt="" className="admin-teachers-picker__avatar" />
    );
  }
  return (
    <span
      className="admin-teachers-picker__avatar admin-teachers-picker__avatar--placeholder"
      aria-hidden="true"
    >
      {item.name.slice(0, 1)}
    </span>
  );
}

type TeachersPickerProps = {
  /** Currently selected faculty slugs */
  selectedSlugs: string[];
  /** Called when the selection changes */
  onChange: (selectedSlugs: string[], people: SitePagePerson[]) => void;
  /** Optional hint under the picker */
  hint?: string;
};

const FACULTY_CACHE_TTL_MS = 60_000;
let facultyCache: { expiresAt: number; options: FacultyOption[] } | null = null;
let facultyRequest: Promise<FacultyOption[]> | null = null;
const profileCache = new Map<string, SitePagePerson>();

/**
 * Removes legacy duplicate faculty rows by their selection identity.
 *
 * @param options - Faculty options returned by the API
 * @returns One option per teacher slug (falling back to the row id)
 */
function uniqueFaculty(options: FacultyOption[]): FacultyOption[] {
  const seen = new Set<string>();

  return options.flatMap((option) => {
    const slug = option.slug || teacherSlug(option.name);
    const identity = slug || option.id;
    if (!identity || seen.has(identity)) return [];
    seen.add(identity);
    return [{ ...option, slug }];
  });
}

/**
 * Loads and briefly caches the shared faculty dataset across picker mounts.
 * The shared request prevents React Strict Mode from issuing a second fetch.
 *
 * @returns Unique faculty options
 */
function loadFaculty(): Promise<FacultyOption[]> {
  if (facultyCache && facultyCache.expiresAt > Date.now()) {
    return Promise.resolve(facultyCache.options);
  }

  if (!facultyRequest) {
    facultyRequest = fetch("/api/admin/faculty")
      .then((res) => parseApiJson<{ faculty: FacultyOption[] }>(res))
      .then((body) => {
        const options = uniqueFaculty(body.faculty);
        facultyCache = {
          options,
          expiresAt: Date.now() + FACULTY_CACHE_TTL_MS,
        };
        return options;
      })
      .finally(() => {
        facultyRequest = null;
      });
  }

  return facultyRequest;
}

/**
 * Loads complete profiles only for the selected compact faculty options.
 *
 * @param ids - Selected faculty row ids
 * @returns Profiles in selection order
 */
async function loadFacultyProfiles(ids: string[]): Promise<SitePagePerson[]> {
  const missingIds = ids.filter((id) => !profileCache.has(id));

  if (missingIds.length > 0) {
    const params = new URLSearchParams();
    for (const id of missingIds) params.append("id", id);
    const response = await fetch(`/api/admin/faculty/profiles?${params}`);
    const body = await parseApiJson<{ people: SitePagePerson[] }>(response);

    for (const [index, id] of missingIds.entries()) {
      const person = body.people[index];
      if (person) profileCache.set(id, person);
    }
  }

  return ids.flatMap((id) => {
    const person = profileCache.get(id);
    return person ? [person] : [];
  });
}

/**
 * Multi-select faculty picker backed by the focused faculty admin API.
 * Does not invent orphan teacher records — only selects from the store.
 *
 * @param props - Selected slugs and change handler
 */
export function TeachersPicker({
  selectedSlugs,
  onChange,
  hint = "Faculty is managed under Teachers. Select who appears on this page.",
}: TeachersPickerProps) {
  const [faculty, setFaculty] = useState<FacultyOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadFaculty()
      .then((options) => {
        if (controller.signal.aborted) return;
        setFaculty(options);
        setError("");
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setError(err.message || "Failed to load faculty");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  /**
   * Applies a new ordered slug selection — drops slugs no longer in the
   * faculty store, resolves full profiles, and reports the result upstream.
   *
   * @param nextSlugs - Selected slugs in the order they should be persisted
   */
  async function applySelection(nextSlugs: string[]) {
    setUpdating(true);
    setError("");
    const bySlug = new Map(faculty.map((item) => [item.slug, item]));
    const kept = nextSlugs.filter((slug) => bySlug.has(slug));
    const ids = kept.flatMap((slug) => {
      const item = bySlug.get(slug);
      return item ? [item.id] : [];
    });

    try {
      const people = await loadFacultyProfiles(ids);
      onChange(kept, people);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load faculty");
    } finally {
      setUpdating(false);
    }
  }

  function toggle(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((itemSlug) => itemSlug !== slug)
      : [...selectedSlugs, slug];
    return applySelection(next);
  }

  function reorderSelected(fromIndex: number, toIndex: number) {
    return applySelection(
      reorderItems(
        selectedFaculty.map((item) => item.slug),
        fromIndex,
        toIndex,
      ),
    );
  }

  function clearSelection() {
    onChange([], []);
  }

  const visibleFaculty = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return faculty;
    return faculty.filter((item) =>
      `${item.name} ${item.role ?? ""}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [faculty, query]);
  const selectedFaculty = useMemo(() => {
    const bySlug = new Map(faculty.map((item) => [item.slug, item]));
    return selectedSlugs.flatMap((slug) => {
      const item = bySlug.get(slug);
      return item ? [item] : [];
    });
  }, [faculty, selectedSlugs]);
  const selectedCount = selectedFaculty.length;

  if (loading) {
    return <p className="admin-hint">Loading faculty…</p>;
  }

  if (error) {
    return (
      <p className="admin-error">
        {error}. Ensure the Teachers page exists in the CMS, then retry.
      </p>
    );
  }

  if (faculty.length === 0) {
    return (
      <p className="admin-hint">
        No faculty yet. Add teachers under{" "}
        <a href="/admin/sections/teachers" className="admin-link">
          Teachers
        </a>
        , then return here to select them.
      </p>
    );
  }

  return (
    <div className="admin-field admin-teachers-picker">
      <div className="admin-teachers-picker__header">
        <span className="admin-label">Teachers on this page</span>
        <div className="admin-teachers-picker__actions">
          <span className="admin-teachers-picker__count" aria-live="polite">
            {selectedCount} selected
          </span>
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={clearSelection}
            disabled={selectedCount === 0 || updating}
          >
            Clear
          </button>
        </div>
      </div>
      {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
      {selectedFaculty.length > 0 ? (
        <div className="admin-teachers-picker__selected">
          <span className="admin-teachers-picker__selected-label">
            Selected order (drag to reorder)
          </span>
          <SortableList
            ids={selectedFaculty.map((item) => item.slug)}
            onReorder={reorderSelected}
            className="admin-teachers-picker__selected-list"
          >
            {selectedFaculty.map((item, index) => (
              <SortableRow
                key={item.slug}
                id={item.slug}
                className="admin-teachers-picker__selected-row"
              >
                {({ dragHandleProps }) => (
                  <>
                    <span className="admin-teachers-picker__selected-order">
                      {index + 1}
                    </span>
                    <TeacherAvatar item={item} />
                    <span className="admin-teachers-picker__person">
                      <span>{item.name}</span>
                      {item.role ? (
                        <small className="admin-teachers-picker__role">
                          {item.role}
                        </small>
                      ) : null}
                    </span>
                    <ListRowActions
                      dragHandleProps={dragHandleProps}
                      onRemove={() => toggle(item.slug)}
                    />
                  </>
                )}
              </SortableRow>
            ))}
          </SortableList>
        </div>
      ) : null}
      <input
        className="admin-input admin-teachers-picker__search"
        type="search"
        aria-label="Search faculty"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search faculty"
      />
      <ul className="admin-teachers-picker__grid">
        {visibleFaculty.map((item) => (
          <li key={item.id}>
            <label className="admin-teachers-picker__card">
              <input
                type="checkbox"
                checked={selectedSlugs.includes(item.slug)}
                onChange={() => toggle(item.slug)}
                disabled={updating}
              />
              <TeacherAvatar item={item} />
              <span className="admin-teachers-picker__person">
                <span>{item.name}</span>
                {item.role ? (
                  <small className="admin-teachers-picker__role">
                    {item.role}
                  </small>
                ) : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {visibleFaculty.length === 0 ? (
        <p className="admin-hint">No faculty match “{query}”.</p>
      ) : null}
      {updating ? (
        <p className="admin-hint admin-hint--tight" aria-live="polite">
          Updating selected teachers…
        </p>
      ) : null}
      <p className="admin-hint" style={{ marginTop: "0.5rem" }}>
        <a href="/admin/sections/teachers" className="admin-link">
          Edit faculty profiles →
        </a>
      </p>
    </div>
  );
}
