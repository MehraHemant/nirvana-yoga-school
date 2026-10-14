import {
  FAQ_CATEGORIES,
  normalizeFaqCategory,
  type FaqCategoryId,
} from "@/content/types/faq-categories";

type FaqCategorySelectProps = {
  value?: string;
  onChange: (category: FaqCategoryId) => void;
  id?: string;
  compact?: boolean;
};

/**
 * Fixed four-option category dropdown for FAQ admin rows.
 *
 * @param props - Current value and change handler
 */
export function FaqCategorySelect({
  value,
  onChange,
  id,
  compact = false,
}: FaqCategorySelectProps) {
  return (
    <select
      id={id}
      className={
        compact
          ? "admin-select admin-select--compact admin-input--compact"
          : "admin-input admin-select"
      }
      value={normalizeFaqCategory(value)}
      onChange={(event) =>
        onChange(normalizeFaqCategory(event.target.value))
      }
    >
      {FAQ_CATEGORIES.map((category) => (
        <option key={category.id} value={category.id}>
          {category.label}
        </option>
      ))}
    </select>
  );
}
