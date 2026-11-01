"use client";

import {
  QUIZ_CATEGORY_LABELS,
  type QuizCategoryFilter,
  type QuizCategoryId,
} from "@/content/types/quiz-categories";

type QuizCategoryPickerProps = {
  /** Categories that have at least one question, in display order. */
  categories: QuizCategoryId[];
  /** Selected category, or `all` for the full bank. */
  value: QuizCategoryFilter;
  /** Called when the visitor picks a category. */
  onChange: (value: QuizCategoryFilter) => void;
};

/**
 * Category chips for the quiz intro. Uses the same pill buttons as the
 * faculty jump list.
 *
 * @param props - Categories in the bank, the selection, and change handler
 */
export function QuizCategoryPicker({
  categories,
  value,
  onChange,
}: QuizCategoryPickerProps) {
  const chipClass = (selected: boolean) =>
    `type-ui shrink-0 rounded-full border px-3.5 py-2 font-semibold transition-colors ${
      selected
        ? "border-primary bg-primary text-white"
        : "surface-panel border-ink/8 text-ink"
    }`;

  return (
    <fieldset className="w-full border-0 p-0">
      <legend className="type-eyebrow text-ink">Category</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={chipClass(value === "all")}
          aria-pressed={value === "all"}
          onClick={() => onChange("all")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={chipClass(value === category)}
            aria-pressed={value === category}
            onClick={() => onChange(category)}
          >
            {QUIZ_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
