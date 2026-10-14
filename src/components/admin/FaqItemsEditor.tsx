"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_FAQ_CATEGORY,
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS,
  type FaqCategoryId,
} from "@/content/types/faq-categories";
import {
  createBlankFaq,
  faqAnswerPreview,
  faqQuestionPreview,
  resolveFaqCategory,
} from "@/lib/cms/faq-utils";
import { FaqCategorySelect } from "./FaqCategorySelect";
import { NestedItemCard } from "./NestedItemCard";
import {
  reorderItems,
  SortableList,
  SortableRow,
  withSortField,
} from "./SortableList";
import { TextField } from "./TextField";
import { useStableListKeys } from "./useStableListKeys";

type FaqEditorItem = {
  question: string;
  answer: string;
  category?: FaqCategoryId;
};

type FaqItemsEditorProps<T extends FaqEditorItem> = {
  items: T[];
  onChange: (items: T[]) => void;
  idPrefix: string;
  /** Custom blank row factory; category is applied from the active filter */
  createItem?: () => T;
  /** Extra fields rendered below question/category/answer (e.g. home FAQ tag/image) */
  renderExtraFields?: (
    faq: T,
    index: number,
    update: (patch: Partial<T>) => void,
  ) => React.ReactNode;
};

/**
 * Shared FAQ list editor — category chip filter, collapsible cards, drag reorder.
 *
 * @param props - FAQ rows and change handler
 */
export function FaqItemsEditor<T extends FaqEditorItem>({
  items,
  onChange,
  idPrefix,
  createItem,
  renderExtraFields,
}: FaqItemsEditorProps<T>) {
  const [categoryFilter, setCategoryFilter] = useState<"all" | FaqCategoryId>(
    "all",
  );
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    items.length,
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const category of FAQ_CATEGORIES) {
      counts[category.id] = 0;
    }
    for (const faq of items) {
      counts[resolveFaqCategory(faq)]++;
    }
    return counts;
  }, [items]);

  const visibleIndexes = items.flatMap((faq, index) => {
    if (categoryFilter === "all") return [index];
    return resolveFaqCategory(faq) === categoryFilter ? [index] : [];
  });

  function updateItem(index: number, patch: Partial<FaqEditorItem>) {
    const next = [...items];
    next[index] = { ...items[index], ...patch } as T;
    onChange(next);
  }

  function updateItemFull(index: number, patch: Partial<T>) {
    const next = [...items];
    next[index] = { ...items[index], ...patch };
    onChange(next);
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    onChange(withSortField(reorderItems(items, fromIndex, toIndex)) as T[]);
  }

  function handleRemove(index: number) {
    removeKey(index);
    onChange(items.filter((_, i) => i !== index));
  }

  function handleAdd() {
    addKey();
    const base = createItem?.() ?? createBlankFaq<T>();
    const category =
      categoryFilter === "all" ? DEFAULT_FAQ_CATEGORY : categoryFilter;
    onChange([...items, { ...base, category }]);
  }

  return (
    <div className="admin-faq-editor">
      {items.length > 0 ? (
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
              <span className="admin-chip-count">{categoryCounts.all}</span>
            </button>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`admin-chip ${categoryFilter === category.id ? "admin-chip--active" : ""}`}
                onClick={() => setCategoryFilter(category.id)}
              >
                {category.label}
                <span className="admin-chip-count">
                  {categoryCounts[category.id]}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="admin-empty-card">
          <p>No FAQs yet.</p>
          <button type="button" className="admin-btn-sm" onClick={handleAdd}>
            Add first FAQ
          </button>
        </div>
      ) : visibleIndexes.length === 0 ? (
        <div className="admin-empty-card">
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
            {items.map((faq, index) => {
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
                      defaultOpen={!faq.question.trim()}
                      dragHandleProps={dragHandleProps}
                      onRemove={() => handleRemove(index)}
                      headerActions={
                        <span className="admin-faq-category-badge">
                          {FAQ_CATEGORY_LABELS[categoryId]}
                        </span>
                      }
                    >
                      <div className="admin-grid-2">
                        <TextField
                          label="Question"
                          value={faq.question}
                          onChange={(question) => updateItem(index, { question })}
                        />
                        <div className="admin-field">
                          <label
                            className="admin-label"
                            htmlFor={`${idPrefix}-category-${index}`}
                          >
                            Category
                          </label>
                          <FaqCategorySelect
                            id={`${idPrefix}-category-${index}`}
                            value={faq.category ?? DEFAULT_FAQ_CATEGORY}
                            onChange={(category) =>
                              updateItem(index, { category })
                            }
                          />
                        </div>
                      </div>
                      <TextField
                        label="Answer"
                        value={faq.answer}
                        onChange={(answer) => updateItem(index, { answer })}
                        multiline
                        rows={3}
                      />
                      {renderExtraFields?.(faq, index, (patch) =>
                        updateItemFull(index, patch),
                      )}
                    </NestedItemCard>
                  )}
                </SortableRow>
              );
            })}
          </SortableList>
        </div>
      )}

      {items.length > 0 ? (
        <div className="admin-faq-editor__footer">
          <button type="button" className="admin-btn-sm" onClick={handleAdd}>
            Add FAQ
          </button>
        </div>
      ) : null}
    </div>
  );
}
