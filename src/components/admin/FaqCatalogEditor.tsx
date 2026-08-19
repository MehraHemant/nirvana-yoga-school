"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { FaqAdminTagFilterChips } from "@/components/admin/FaqAdminTagFilterChips";
import { FaqCategorySelect } from "@/components/admin/FaqCategorySelect";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS,
  type FaqCategoryId,
} from "@/content/types/faq-categories";
import type { FaqRecord } from "@/content/types/faqs";
import {
  faqAdminTagLabel,
  type FaqAdminTagFilter,
} from "@/content/types/faqs";
import {
  countFaqsByAdminTag,
  faqAnswerPreview,
  faqQuestionPreview,
  matchesFaqAdminTagFilter,
  matchesFaqSearch,
  resolveFaqCategory,
} from "@/lib/cms/faq-utils";
import { parseApiJson } from "@/lib/types/api";

/**
 * Serializes catalog rows for dirty comparison (ignores DB timestamps).
 *
 * @param faqs - FAQ list
 */
function serializeFaqsForCompare(faqs: FaqRecord[]): string {
  return JSON.stringify(
    faqs.map(({ createdAt, updatedAt, ...faq }) => faq),
  );
}

export type FaqCatalogEditorHandle = {
  /** Persists every FAQ with unsaved edits. */
  saveAll: () => Promise<void>;
  /** Whether any FAQ differs from the last saved snapshot. */
  hasUnsavedChanges: () => boolean;
};

type FaqCatalogEditorProps = {
  /** Called when pending FAQ edits change. */
  onDirtyChange?: (dirty: boolean) => void;
};

/**
 * Shared CMS editor for the centralized FAQ catalog (DB-backed).
 */
export const FaqCatalogEditor = forwardRef<
  FaqCatalogEditorHandle,
  FaqCatalogEditorProps
>(function FaqCatalogEditor({ onDirtyChange }, ref) {
  const [faqs, setFaqs] = useState<FaqRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedBaseline, setSavedBaseline] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | FaqCategoryId>(
    "all",
  );
  const [adminTagFilter, setAdminTagFilter] = useState<FaqAdminTagFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const faqsRef = useRef(faqs);
  const savedBaselineRef = useRef(savedBaseline);
  faqsRef.current = faqs;
  savedBaselineRef.current = savedBaseline;
  const { keys, addKey, removeKey } = useStableListKeys(faqs.length);

  const isDirty =
    !loading &&
    savedBaseline !== "" &&
    serializeFaqsForCompare(faqs) !== savedBaseline;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  /**
   * Updates local FAQ list and the saved snapshot after a successful write.
   *
   * @param updater - Next FAQ list
   */
  function commitFaqs(updater: (prev: FaqRecord[]) => FaqRecord[]) {
    setFaqs((prev) => {
      const next = updater(prev);
      const baseline = serializeFaqsForCompare(next);
      setSavedBaseline(baseline);
      savedBaselineRef.current = baseline;
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch("/api/admin/faqs")
      .then((res) => parseApiJson<{ faqs: FaqRecord[] }>(res))
      .then((body) => {
        if (cancelled) return;
        const loaded = body.faqs ?? [];
        const baseline = serializeFaqsForCompare(loaded);
        setFaqs(loaded);
        setSavedBaseline(baseline);
        savedBaselineRef.current = baseline;
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load FAQs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Writes one FAQ to the API.
   *
   * @param faq - FAQ draft
   * @param isNew - Whether to POST a new FAQ
   */
  async function persistFaq(faq: FaqRecord, isNew: boolean): Promise<FaqRecord> {
    const payload = {
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      adminTag: faq.adminTag,
    };
    const response = await fetch(
      isNew ? "/api/admin/faqs" : `/api/admin/faqs/${encodeURIComponent(faq.id)}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await parseApiJson<{ faq: FaqRecord }>(response);
    return body.faq;
  }

  /**
   * Saves all FAQs that differ from the saved baseline.
   */
  async function saveAll(): Promise<void> {
    const current = faqsRef.current;
    setError("");
    for (const faq of current) {
      const isNew = faq.id.startsWith("new-");
      setSavingId(faq.id);
      try {
        const saved = await persistFaq(faq, isNew);
        commitFaqs((prev) =>
          prev.map((row) => (row.id === faq.id ? saved : row)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save FAQ");
        throw err;
      } finally {
        setSavingId(null);
      }
    }
  }

  useImperativeHandle(ref, () => ({
    saveAll,
    hasUnsavedChanges: () =>
      savedBaselineRef.current !== "" &&
      serializeFaqsForCompare(faqsRef.current) !== savedBaselineRef.current,
  }));

  function updateFaq(index: number, patch: Partial<FaqRecord>) {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  async function handleRemove(index: number) {
    const faq = faqs[index];
    if (!faq) return;
    if (!faq.id.startsWith("new-")) {
      setSavingId(faq.id);
      try {
        const response = await fetch(
          `/api/admin/faqs/${encodeURIComponent(faq.id)}`,
          { method: "DELETE" },
        );
        await parseApiJson(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete FAQ");
        setSavingId(null);
        return;
      }
      setSavingId(null);
    }
    commitFaqs((prev) => prev.filter((_, i) => i !== index));
    removeKey(index);
  }

  function handleAdd() {
    const category =
      categoryFilter === "all" ? ("general" as FaqCategoryId) : categoryFilter;
    const adminTag =
      adminTagFilter !== "all" && adminTagFilter !== "untagged"
        ? adminTagFilter
        : "";
    const draft: FaqRecord = {
      id: `new-${Date.now()}`,
      question: "",
      answer: "",
      category,
      adminTag,
    };
    addKey();
    setFaqs((prev) => [...prev, draft]);
  }

  const adminTagCounts = countFaqsByAdminTag(faqs);

  const visibleIndexes = faqs.flatMap((faq, index) => {
    if (categoryFilter !== "all" && resolveFaqCategory(faq) !== categoryFilter) {
      return [];
    }
    if (!matchesFaqAdminTagFilter(faq, adminTagFilter)) {
      return [];
    }
    if (!matchesFaqSearch(faq, searchQuery)) {
      return [];
    }
    return [index];
  });

  const hasActiveFilters =
    categoryFilter !== "all" ||
    adminTagFilter !== "all" ||
    searchQuery.trim() !== "";

  return (
    <CollapsiblePanel
      id="shared-faq-catalog"
      step={20}
      title="FAQ catalog"
      subtitle={`${faqs.length} questions`}
      description="Central FAQ library. Assign questions to pages from each page editor."
      defaultOpen
    >
      {loading ? <p className="admin-muted">Loading FAQs…</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      {!loading && faqs.length > 0 ? (
        <>
          <AdminSearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search question or answer…"
            ariaLabel="Search FAQs"
          />
          <FaqAdminTagFilterChips
            value={adminTagFilter}
            onChange={setAdminTagFilter}
            counts={adminTagCounts}
          />
          <div className="admin-faq-editor__toolbar">
            <span className="admin-label admin-faq-editor__filter-label">
              Filter by category
            </span>
            <div className="admin-faq-editor__filters">
              <button
                type="button"
                className={`admin-chip ${categoryFilter === "all" ? "admin-chip--active" : ""}`}
                onClick={() => setCategoryFilter("all")}
              >
                All
              </button>
              {FAQ_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`admin-chip ${categoryFilter === category.id ? "admin-chip--active" : ""}`}
                  onClick={() => setCategoryFilter(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {!loading && faqs.length === 0 ? (
        <div className="admin-empty-card">
          <p>No FAQs in the catalog yet.</p>
          <button type="button" className="admin-btn-sm" onClick={handleAdd}>
            Add first FAQ
          </button>
        </div>
      ) : null}

      {!loading && faqs.length > 0 && visibleIndexes.length === 0 ? (
        <div className="admin-empty-card">
          <p>
            {searchQuery.trim()
              ? "No FAQs match your search."
              : "No FAQs match the current filters."}
          </p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              setCategoryFilter("all");
              setAdminTagFilter("all");
              setSearchQuery("");
            }}
          >
            {hasActiveFilters ? "Clear filters" : "Show all FAQs"}
          </button>
        </div>
      ) : null}

      {!loading && visibleIndexes.length > 0 ? (
        <div className="admin-faq-editor__list">
          {faqs.map((faq, index) => {
            if (!visibleIndexes.includes(index)) return null;
            const categoryId = resolveFaqCategory(faq);
            return (
              <NestedItemCard
                key={keys[index]}
                title={faqQuestionPreview(faq.question)}
                subtitle={faqAnswerPreview(faq.answer)}
                index={index}
                collapsible
                defaultOpen={!faq.question.trim()}
                onRemove={() => handleRemove(index)}
                headerActions={
                  <>
                    {faq.adminTag ? (
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
                    onChange={(question) => updateFaq(index, { question })}
                  />
                  <div className="admin-field">
                    <label className="admin-label" htmlFor={`faq-cat-${index}`}>
                      Category
                    </label>
                    <FaqCategorySelect
                      id={`faq-cat-${index}`}
                      value={faq.category}
                      onChange={(category) => updateFaq(index, { category })}
                    />
                  </div>
                </div>
                <TextField
                  label="Answer"
                  value={faq.answer}
                  onChange={(answer) => updateFaq(index, { answer })}
                  multiline
                  rows={3}
                />
                <TextField
                  label="Admin tag"
                  value={faq.adminTag}
                  onChange={(adminTag) => updateFaq(index, { adminTag })}
                  hint="Internal label for editors only — not shown on the public site."
                />
                <div className="admin-inline-actions">
                  <button
                    type="button"
                    className="admin-btn-sm"
                    disabled={savingId === faq.id}
                    onClick={async () => {
                      setSavingId(faq.id);
                      setError("");
                      try {
                        const saved = await persistFaq(
                          faq,
                          faq.id.startsWith("new-"),
                        );
                        commitFaqs((prev) =>
                          prev.map((row) => (row.id === faq.id ? saved : row)),
                        );
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "Failed to save",
                        );
                      } finally {
                        setSavingId(null);
                      }
                    }}
                  >
                    {savingId === faq.id ? "Saving…" : "Save FAQ"}
                  </button>
                </div>
              </NestedItemCard>
            );
          })}
        </div>
      ) : null}

      {!loading ? (
        <div className="admin-faq-editor__footer">
          <button type="button" className="admin-btn-sm" onClick={handleAdd}>
            Add FAQ
          </button>
        </div>
      ) : null}
    </CollapsiblePanel>
  );
});
