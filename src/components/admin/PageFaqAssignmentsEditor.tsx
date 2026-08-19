"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { FaqUsageIndicator } from "@/components/admin/FaqUsageIndicator";
import { FaqAdminTagFilterChips } from "@/components/admin/FaqAdminTagFilterChips";
import { FaqCategorySelect } from "@/components/admin/FaqCategorySelect";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import {
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_IDS,
  FAQ_CATEGORY_LABELS,
  DEFAULT_FAQ_CATEGORY,
  type FaqCategoryId,
} from "@/content/types/faq-categories";
import type {
  FaqAssignmentExtras,
  FaqContextType,
  FaqRecordWithUsage,
  FaqAdminTagFilter,
  ResolvedFaq,
} from "@/content/types/faqs";
import {
  faqAdminTagLabel,
  isFaqAdminTagId,
} from "@/content/types/faqs";
import {
  countFaqsByAdminTag,
  faqAnswerPreview,
  faqQuestionPreview,
  groupFaqsByCategory,
  matchesFaqAdminTagFilter,
  matchesFaqSearch,
  normalizeFaqQuestion,
  resolveFaqCategory,
} from "@/lib/cms/faq-utils";
import { ApiClientError, parseApiJson } from "@/lib/types/api";

type AssignedRow = ResolvedFaq & {
  /** True when the catalog row should be updated on save. */
  dirty?: boolean;
};

type PageFaqAssignmentsEditorProps = {
  contextType: FaqContextType;
  contextKey: string;
  /** Default admin tag for newly created catalog FAQs. */
  adminTag?: string;
  idPrefix: string;
  /** Called after assignments are persisted. */
  onSaved?: () => void;
  /** Optional per-row extras fields (e.g. home FAQ image/tag). */
  renderAssignmentExtras?: (
    row: AssignedRow,
    index: number,
    updateExtras: (patch: FaqAssignmentExtras) => void,
  ) => React.ReactNode;
};

/**
 * Sorts catalog rows by fixed category order, then question.
 *
 * @param faqs - FAQ catalog rows
 */
function sortFaqsByCategory(faqs: FaqRecordWithUsage[]): FaqRecordWithUsage[] {
  return [...faqs].sort((a, b) => {
    const categoryDelta =
      FAQ_CATEGORY_IDS.indexOf(resolveFaqCategory(a)) -
      FAQ_CATEGORY_IDS.indexOf(resolveFaqCategory(b));
    if (categoryDelta !== 0) return categoryDelta;
    return a.question.localeCompare(b.question);
  });
}

/**
 * Per-page FAQ assignment editor — pick from catalog, reorder, create inline.
 *
 * @param props - Context and optional home-specific extras
 */
export function PageFaqAssignmentsEditor({
  contextType,
  contextKey,
  adminTag = "",
  idPrefix,
  onSaved,
  renderAssignmentExtras,
}: PageFaqAssignmentsEditorProps) {
  const [assigned, setAssigned] = useState<AssignedRow[]>([]);
  const [catalog, setCatalog] = useState<FaqRecordWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | FaqCategoryId>(
    "all",
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState<
    "all" | FaqCategoryId
  >("all");
  const [pickerTagFilter, setPickerTagFilter] = useState<FaqAdminTagFilter>(
    adminTag && isFaqAdminTagId(adminTag) ? adminTag : "all",
  );
  const [pickerSearchQuery, setPickerSearchQuery] = useState("");
  const [draft, setDraft] = useState({
    question: "",
    answer: "",
    category: DEFAULT_FAQ_CATEGORY as FaqCategoryId,
    adminTag,
  });
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    assigned.length,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [assignmentsRes, catalogRes] = await Promise.all([
        fetch(
          `/api/admin/faq-assignments?contextType=${encodeURIComponent(contextType)}&contextKey=${encodeURIComponent(contextKey)}`,
        ),
        fetch("/api/admin/faqs"),
      ]);
      const assignmentsBody = await parseApiJson<{ faqs: ResolvedFaq[] }>(
        assignmentsRes,
      );
      const catalogBody = await parseApiJson<{ faqs: FaqRecordWithUsage[] }>(
        catalogRes,
      );
      setAssigned(assignmentsBody.faqs ?? []);
      setCatalog(catalogBody.faqs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [contextType, contextKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignedIds = useMemo(
    () => new Set(assigned.map((row) => row.id)),
    [assigned],
  );

  const availableCatalog = useMemo(() => {
    return catalog.filter((faq) => !assignedIds.has(faq.id));
  }, [catalog, assignedIds]);

  const pickerCatalog = useMemo(() => {
    return availableCatalog.filter((faq) => {
      if (!matchesFaqAdminTagFilter(faq, pickerTagFilter)) {
        return false;
      }
      if (
        pickerCategoryFilter !== "all" &&
        resolveFaqCategory(faq) !== pickerCategoryFilter
      ) {
        return false;
      }
      if (!matchesFaqSearch(faq, pickerSearchQuery)) {
        return false;
      }
      return true;
    });
  }, [
    availableCatalog,
    pickerTagFilter,
    pickerCategoryFilter,
    pickerSearchQuery,
  ]);

  const pickerGroups = useMemo(
    () => groupFaqsByCategory(pickerCatalog),
    [pickerCatalog],
  );

  const pickerAdminTagCounts = useMemo(
    () => countFaqsByAdminTag(availableCatalog),
    [availableCatalog],
  );

  const pickerCategoryCounts = useMemo(() => {
    const base = availableCatalog.filter((faq) =>
      matchesFaqAdminTagFilter(faq, pickerTagFilter),
    );
    const counts: Record<string, number> = { all: base.length };
    for (const category of FAQ_CATEGORIES) {
      counts[category.id] = 0;
    }
    for (const faq of base) {
      counts[resolveFaqCategory(faq)]++;
    }
    return counts;
  }, [availableCatalog, pickerTagFilter]);

  const assignedCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assigned.length };
    for (const category of FAQ_CATEGORIES) {
      counts[category.id] = 0;
    }
    for (const faq of assigned) {
      counts[resolveFaqCategory(faq)]++;
    }
    return counts;
  }, [assigned]);

  const bulkCatalogFaqs = useMemo(() => {
    if (!adminTag) return [];
    return sortFaqsByCategory(
      catalog.filter(
        (faq) => faq.adminTag === adminTag && !assignedIds.has(faq.id),
      ),
    );
  }, [catalog, adminTag, assignedIds]);

  const availableByCategory = useMemo(() => {
    const byCategory: Partial<Record<FaqCategoryId, FaqRecordWithUsage[]>> = {};
    for (const faq of bulkCatalogFaqs) {
      const categoryId = resolveFaqCategory(faq);
      if (!byCategory[categoryId]) byCategory[categoryId] = [];
      byCategory[categoryId]!.push(faq);
    }
    return byCategory;
  }, [bulkCatalogFaqs]);

  const isCourseContext = adminTag === "course";

  const visibleIndexes = assigned.flatMap((faq, index) => {
    if (categoryFilter === "all") return [index];
    return resolveFaqCategory(faq) === categoryFilter ? [index] : [];
  });

  /**
   * Persists the current assignment order and inline catalog edits.
   */
  async function persistAssignments(nextAssigned: AssignedRow[]) {
    setSaving(true);
    setError("");
    try {
      for (const row of nextAssigned.filter((item) => item.dirty)) {
        await parseApiJson(
          await fetch(`/api/admin/faqs/${encodeURIComponent(row.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: row.question,
              answer: row.answer,
              category: row.category,
              adminTag: row.adminTag ?? adminTag,
            }),
          }),
        );
      }

      const extrasByFaqId: Record<string, FaqAssignmentExtras> = {};
      for (const row of nextAssigned) {
        if (row.extras && Object.keys(row.extras).length > 0) {
          extrasByFaqId[row.id] = row.extras;
        }
      }

      const body = await parseApiJson<{ faqs: ResolvedFaq[] }>(
        await fetch("/api/admin/faq-assignments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contextType,
            contextKey,
            faqIds: nextAssigned.map((row) => row.id),
            extrasByFaqId,
          }),
        }),
      );
      setAssigned(body.faqs ?? []);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save assignments");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  function updateAssigned(index: number, patch: Partial<AssignedRow>) {
    setAssigned((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch, dirty: true };
      return next;
    });
  }

  function updateExtras(index: number, patch: FaqAssignmentExtras) {
    setAssigned((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        extras: { ...next[index].extras, ...patch },
      };
      return next;
    });
  }

  function catalogRowToAssigned(
    faq: FaqRecordWithUsage,
    sortOrder: number,
  ): AssignedRow {
    return {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      adminTag: faq.adminTag,
      assignmentId: "",
      sortOrder,
    };
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const next = reorderItems(assigned, fromIndex, toIndex);
    setAssigned(next);
    await persistAssignments(next);
  }

  async function handleRemove(index: number) {
    removeKey(index);
    const next = assigned.filter((_, i) => i !== index);
    setAssigned(next);
    await persistAssignments(next);
  }

  async function handleAddFromCatalog(faqId: string) {
    const faq = catalog.find((row) => row.id === faqId);
    if (!faq) return;
    addKey();
    const next: AssignedRow[] = [
      ...assigned,
      catalogRowToAssigned(faq, assigned.length * 10),
    ];
    setAssigned(next);
    await persistAssignments(next);
  }

  async function handleAddAllFromCatalog() {
    if (bulkCatalogFaqs.length === 0) return;
    for (let i = 0; i < bulkCatalogFaqs.length; i++) {
      addKey();
    }
    const next: AssignedRow[] = [
      ...assigned,
      ...bulkCatalogFaqs.map((faq, index) =>
        catalogRowToAssigned(faq, (assigned.length + index) * 10),
      ),
    ];
    setAssigned(next);
    setPickerOpen(false);
    await persistAssignments(next);
  }

  async function handleAddCategoryFromCatalog(categoryId: FaqCategoryId) {
    const toAdd = availableByCategory[categoryId];
    if (!toAdd?.length) return;
    for (let i = 0; i < toAdd.length; i++) {
      addKey();
    }
    const next: AssignedRow[] = [
      ...assigned,
      ...toAdd.map((faq, index) =>
        catalogRowToAssigned(faq, (assigned.length + index) * 10),
      ),
    ];
    setAssigned(next);
    await persistAssignments(next);
  }

  async function handleRemoveAll() {
    if (assigned.length === 0) return;
    const confirmed = window.confirm(
      `Remove all ${assigned.length} FAQ${assigned.length === 1 ? "" : "s"} from this page? Catalog entries are kept.`,
    );
    if (!confirmed) return;
    setAssigned([]);
    await persistAssignments([]);
  }

  /**
   * Creates a catalog FAQ (or reuses an existing match) and assigns it to this page.
   */
  async function handleCreateAndAssign() {
    const question = draft.question.trim();
    const answer = draft.answer.trim();
    if (!question && !answer) {
      setError("Question or answer is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const normalizedQuestion = normalizeFaqQuestion(question);
      let faq = catalog.find(
        (row) => normalizeFaqQuestion(row.question) === normalizedQuestion,
      );

      if (!faq) {
        try {
          const body = await parseApiJson<{ faq: FaqRecordWithUsage }>(
            await fetch("/api/admin/faqs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: draft.question,
                answer: draft.answer,
                category: draft.category,
                adminTag: draft.adminTag || adminTag,
              }),
            }),
          );
          faq = {
            ...body.faq,
            usage:
              body.faq.usage ?? { inUse: false, references: [] },
          };
          setCatalog((prev) => [...prev, faq!]);
        } catch (err) {
          if (err instanceof ApiClientError && err.code === "CONFLICT") {
            const catalogBody = await parseApiJson<{ faqs: FaqRecordWithUsage[] }>(
              await fetch("/api/admin/faqs"),
            );
            const refreshed = catalogBody.faqs ?? [];
            setCatalog(refreshed);
            faq = refreshed.find(
              (row) =>
                normalizeFaqQuestion(row.question) === normalizedQuestion,
            );
            if (!faq) throw err;
          } else {
            throw err;
          }
        }
      }

      if (assignedIds.has(faq.id)) {
        setError("This FAQ is already assigned to this page.");
        return;
      }

      addKey();
      const next: AssignedRow[] = [
        ...assigned,
        catalogRowToAssigned(faq, assigned.length * 10),
      ];
      setAssigned(next);
      await persistAssignments(next);

      const catalogBody = await parseApiJson<{ faqs: FaqRecordWithUsage[] }>(
        await fetch("/api/admin/faqs"),
      );
      setCatalog(catalogBody.faqs ?? []);

      setCreateOpen(false);
      setDraft({
        question: "",
        answer: "",
        category:
          categoryFilter === "all" ? DEFAULT_FAQ_CATEGORY : categoryFilter,
        adminTag,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create and assign FAQ",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="admin-muted">Loading assigned FAQs…</p>;
  }

  const categoryQuickAddChips = FAQ_CATEGORIES.filter(
    (category) => (availableByCategory[category.id]?.length ?? 0) > 0,
  ).map((category) => {
    const count = availableByCategory[category.id]!.length;
    return (
      <button
        key={category.id}
        type="button"
        className="admin-chip admin-chip--action"
        disabled={saving}
        onClick={() => handleAddCategoryFromCatalog(category.id)}
      >
        {category.label}
        <span className="admin-chip-count">{count}</span>
      </button>
    );
  });

  return (
    <div className="admin-faq-editor admin-faq-assignments">
      {error ? <p className="admin-error">{error}</p> : null}

      {isCourseContext ? (
        <p className="admin-callout admin-callout--info admin-faq-assignments__hint">
          Course FAQs come from the shared catalog. Start with{" "}
          <strong>Add all course FAQs</strong>, then drag to reorder or expand a
          card to edit question and answer inline. Edits update the catalog for
          every course page using that FAQ.
        </p>
      ) : null}

      <section className="admin-faq-section" aria-labelledby={`${idPrefix}-assigned-heading`}>
        <header className="admin-faq-section__header">
          <div className="admin-faq-section__heading">
            <h3
              className="admin-faq-section__title"
              id={`${idPrefix}-assigned-heading`}
            >
              On this page
            </h3>
            <p className="admin-hint admin-hint--tight">
              {assigned.length === 0
                ? "No FAQs assigned yet"
                : `${assigned.length} FAQ${assigned.length === 1 ? "" : "s"} · drag to reorder`}
              {assigned.length > 0 && bulkCatalogFaqs.length > 0
                ? ` · ${bulkCatalogFaqs.length} more in catalog`
                : ""}
            </p>
          </div>
          <div className="admin-faq-section__actions admin-faq-assignments__toolbar">
            <button
              type="button"
              className="admin-btn-sm admin-btn-secondary"
              onClick={() => {
                setPickerOpen(true);
                setCreateOpen(false);
                setPickerSearchQuery("");
                if (adminTag && isFaqAdminTagId(adminTag)) {
                  setPickerTagFilter(adminTag);
                }
              }}
            >
              Add from catalog
            </button>
            <button
              type="button"
              className={`admin-btn-sm ${createOpen ? "" : "admin-btn-secondary"}`}
              onClick={() => {
                setCreateOpen((open) => !open);
                if (!createOpen) setPickerOpen(false);
              }}
            >
              {createOpen ? "Close create form" : "Create & assign"}
            </button>
            {adminTag && bulkCatalogFaqs.length > 0 ? (
              <button
                type="button"
                className="admin-btn-sm"
                disabled={saving}
                onClick={handleAddAllFromCatalog}
              >
                Add all {faqAdminTagLabel(adminTag)} ({bulkCatalogFaqs.length})
              </button>
            ) : null}
            {assigned.length > 0 ? (
              <button
                type="button"
                className="admin-btn-sm admin-btn-secondary admin-btn-danger-text"
                disabled={saving}
                onClick={handleRemoveAll}
              >
                Remove all
              </button>
            ) : null}
            {saving ? <span className="admin-muted">Saving…</span> : null}
          </div>
        </header>

        {adminTag && bulkCatalogFaqs.length > 0 ? (
          <div className="admin-faq-quick-add">
            <span className="admin-label admin-faq-quick-add__label">
              Add by category
            </span>
            <div className="admin-faq-editor__filters">{categoryQuickAddChips}</div>
          </div>
        ) : null}

        {createOpen ? (
          <div className="admin-faq-create-card">
            <div className="admin-grid-2">
              <TextField
                label="Question"
                value={draft.question}
                onChange={(question) => setDraft({ ...draft, question })}
              />
              <div className="admin-field">
                <label className="admin-label" htmlFor={`${idPrefix}-new-cat`}>
                  Category
                </label>
                <FaqCategorySelect
                  id={`${idPrefix}-new-cat`}
                  value={draft.category}
                  onChange={(category) => setDraft({ ...draft, category })}
                />
              </div>
            </div>
            <TextField
              label="Answer"
              value={draft.answer}
              onChange={(answer) => setDraft({ ...draft, answer })}
              multiline
              rows={3}
            />
            {!adminTag ? (
              <TextField
                label="Admin tag"
                value={draft.adminTag}
                onChange={(nextTag) => setDraft({ ...draft, adminTag: nextTag })}
                hint="Internal label for editors only."
              />
            ) : (
              <p className="admin-muted admin-faq-create-card__tag">
                Saved to catalog with admin tag:{" "}
                <span className="admin-faq-admin-tag">
                  {faqAdminTagLabel(adminTag)}
                </span>
              </p>
            )}
            <button
              type="button"
              className="admin-btn-sm"
              disabled={
                saving || (!draft.question.trim() && !draft.answer.trim())
              }
              onClick={handleCreateAndAssign}
            >
              Create & assign
            </button>
          </div>
        ) : null}

        {assigned.length > 0 ? (
          <div className="admin-faq-editor__toolbar">
            <span className="admin-label admin-faq-editor__filter-label">
              Filter assigned by category
            </span>
            <div className="admin-faq-editor__filters">
              <button
                type="button"
                className={`admin-chip ${categoryFilter === "all" ? "admin-chip--active" : ""}`}
                onClick={() => setCategoryFilter("all")}
              >
                All
                <span className="admin-chip-count">
                  {assignedCategoryCounts.all}
                </span>
              </button>
              {FAQ_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`admin-chip ${categoryFilter === category.id ? "admin-chip--active" : ""}`}
                  onClick={() => setCategoryFilter(category.id)}
                  disabled={assignedCategoryCounts[category.id] === 0}
                >
                  {category.label}
                  <span className="admin-chip-count">
                    {assignedCategoryCounts[category.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {assigned.length === 0 ? (
          <div className="admin-empty-card">
            <p>
              {isCourseContext
                ? "No course FAQs on this page yet."
                : "No FAQs assigned to this page yet."}
            </p>
            {isCourseContext ? (
              <p className="admin-hint admin-hint--tight">
                Most course pages use the full course FAQ set from the catalog.
              </p>
            ) : null}
            <div className="admin-empty-card-actions">
              {adminTag && bulkCatalogFaqs.length > 0 ? (
                <button
                  type="button"
                  className="admin-btn-sm"
                  disabled={saving}
                  onClick={handleAddAllFromCatalog}
                >
                  Add all {bulkCatalogFaqs.length}{" "}
                  {faqAdminTagLabel(adminTag)} FAQs
                </button>
              ) : null}
              <button
                type="button"
                className="admin-btn-sm admin-btn-secondary"
                onClick={() => {
                  setPickerOpen(true);
                  setCreateOpen(false);
                }}
              >
                Browse catalog
              </button>
              <button
                type="button"
                className="admin-btn-sm admin-btn-secondary"
                onClick={() => setCreateOpen(true)}
              >
                Create & assign
              </button>
            </div>
            {adminTag && bulkCatalogFaqs.length > 0 ? (
              <div className="admin-faq-quick-add admin-faq-quick-add--empty">
                <span className="admin-label admin-faq-quick-add__label">
                  Or add by category
                </span>
                <div className="admin-faq-editor__filters">
                  {categoryQuickAddChips}
                </div>
              </div>
            ) : null}
          </div>
        ) : visibleIndexes.length === 0 ? (
          <div className="admin-empty-card admin-empty-card--compact">
            <p>No FAQs in this category.</p>
            <button
              type="button"
              className="admin-btn-sm"
              onClick={() => setCategoryFilter("all")}
            >
              Show all categories
            </button>
          </div>
        ) : (
          <div className="admin-faq-editor__list">
            <SortableList ids={keys} onReorder={handleReorder}>
              {assigned.map((faq, index) => {
                if (!visibleIndexes.includes(index)) return null;
                const categoryId = resolveFaqCategory(faq);
                return (
                  <SortableRow key={keys[index]} id={keys[index]}>
                    {({ dragHandleProps }) => (
                      <NestedItemCard
                        title={faqQuestionPreview(faq.question)}
                        subtitle={faqAnswerPreview(faq.answer)}
                        index={index}
                        collapsible
                        defaultOpen={false}
                        dragHandleProps={dragHandleProps}
                        onRemove={() => handleRemove(index)}
                        headerActions={
                          <>
                            {faq.adminTag && faq.adminTag !== adminTag ? (
                              <span className="admin-faq-admin-tag">
                                {faqAdminTagLabel(faq.adminTag)}
                              </span>
                            ) : null}
                            <span className="admin-faq-category-badge">
                              {FAQ_CATEGORY_LABELS[categoryId]}
                            </span>
                          </>
                        }
                      >
                        <div className="admin-grid-2">
                          <TextField
                            label="Question"
                            value={faq.question}
                            onChange={(question) =>
                              updateAssigned(index, { question })
                            }
                          />
                          <div className="admin-field">
                            <label
                              className="admin-label"
                              htmlFor={`${idPrefix}-cat-${index}`}
                            >
                              Category
                            </label>
                            <FaqCategorySelect
                              id={`${idPrefix}-cat-${index}`}
                              value={faq.category}
                              onChange={(category) =>
                                updateAssigned(index, { category })
                              }
                            />
                          </div>
                        </div>
                        <TextField
                          label="Answer"
                          value={faq.answer}
                          onChange={(answer) =>
                            updateAssigned(index, { answer })
                          }
                          multiline
                          rows={3}
                        />
                        {renderAssignmentExtras?.(faq, index, (patch) =>
                          updateExtras(index, patch),
                        )}
                        <div className="admin-inline-actions">
                          <button
                            type="button"
                            className="admin-btn-sm"
                            disabled={saving || !faq.dirty}
                            onClick={() => persistAssignments(assigned)}
                          >
                            {faq.dirty ? "Save changes" : "Saved"}
                          </button>
                        </div>
                      </NestedItemCard>
                    )}
                  </SortableRow>
                );
              })}
            </SortableList>
          </div>
        )}
      </section>

      {pickerOpen ? (
        <div className="admin-modal-layer">
          <button
            type="button"
            className="admin-modal-backdrop"
            onClick={() => setPickerOpen(false)}
            aria-label="Close FAQ catalog"
          />
          <div
            className="admin-modal admin-modal--faq-picker"
            role="dialog"
            aria-modal="true"
            aria-label="FAQ catalog"
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Add from catalog</h2>
              <button
                type="button"
                className="admin-btn-icon"
                onClick={() => setPickerOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="admin-faq-modal-body">
              <AdminSearchField
                value={pickerSearchQuery}
                onChange={setPickerSearchQuery}
                placeholder="Search question or answer…"
                ariaLabel="Search catalog FAQs"
              />
              <FaqAdminTagFilterChips
                value={pickerTagFilter}
                onChange={setPickerTagFilter}
                counts={pickerAdminTagCounts}
                label="Filter catalog by admin tag"
              />

              <div className="admin-faq-editor__toolbar">
                <span className="admin-label admin-faq-editor__filter-label">
                  Filter by category
                </span>
                <div className="admin-faq-editor__filters">
                  <button
                    type="button"
                    className={`admin-chip ${pickerCategoryFilter === "all" ? "admin-chip--active" : ""}`}
                    onClick={() => setPickerCategoryFilter("all")}
                  >
                    All
                    <span className="admin-chip-count">
                      {pickerCategoryCounts.all}
                    </span>
                  </button>
                  {FAQ_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`admin-chip ${pickerCategoryFilter === category.id ? "admin-chip--active" : ""}`}
                      onClick={() => setPickerCategoryFilter(category.id)}
                    >
                      {category.label}
                      <span className="admin-chip-count">
                        {pickerCategoryCounts[category.id]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {pickerCatalog.length === 0 ? (
                <div className="admin-empty-card admin-empty-card--compact">
                  <p>
                    {pickerSearchQuery.trim()
                      ? "No FAQs match your search."
                      : "No matching FAQs in the catalog."}
                    {!pickerSearchQuery.trim() &&
                    adminTag &&
                    pickerTagFilter === adminTag
                      ? " Try another admin tag or create one on this page."
                      : !pickerSearchQuery.trim()
                        ? " Create one on this page or add FAQs in Shared sections → FAQ catalog."
                        : ""}
                  </p>
                  {pickerSearchQuery.trim() ||
                  pickerCategoryFilter !== "all" ||
                  pickerTagFilter !== "all" ? (
                    <button
                      type="button"
                      className="admin-btn-sm"
                      onClick={() => {
                        setPickerSearchQuery("");
                        setPickerCategoryFilter("all");
                        setPickerTagFilter(
                          adminTag && isFaqAdminTagId(adminTag)
                            ? adminTag
                            : "all",
                        );
                      }}
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : (
                pickerGroups.map((group) => (
                  <div key={group.id} className="admin-faq-picker__group">
                    <h4 className="admin-faq-picker__group-title">
                      {group.label}
                      <span className="admin-chip-count">
                        {group.items.length}
                      </span>
                    </h4>
                    <div className="admin-faq-picker__group-list">
                      {group.items.map((faq) => (
                        <button
                          key={faq.id}
                          type="button"
                          className="admin-faq-picker__item"
                          disabled={saving}
                          onClick={() => handleAddFromCatalog(faq.id)}
                        >
                          <strong>{faqQuestionPreview(faq.question)}</strong>
                          <span>{faqAnswerPreview(faq.answer, "", 96)}</span>
                          {faq.usage?.inUse ? (
                            <FaqUsageIndicator usage={faq.usage} variant="hint" />
                          ) : null}
                          {faq.adminTag && faq.adminTag !== adminTag ? (
                            <span className="admin-faq-admin-tag">
                              {faqAdminTagLabel(faq.adminTag)}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
