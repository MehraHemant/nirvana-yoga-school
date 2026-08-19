type AdminSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Accessible name when placeholder is not enough */
  ariaLabel?: string;
  /** Extra class names (e.g. admin-media-picker-search in modals) */
  className?: string;
};

/**
 * Shared admin text search input (FAQ catalog, media library, pickers).
 *
 * @param props - Controlled value and optional placeholder
 */
export function AdminSearchField({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
  className,
}: AdminSearchFieldProps) {
  const classes = ["admin-input", "admin-search", className]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      type="search"
      className={classes}
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
