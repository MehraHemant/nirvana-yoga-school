type SelectOption = {
  /** Option value stored in CMS */
  value: string;
  /** Visible label */
  label: string;
};

type SelectFieldProps = {
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Options for the dropdown */
  options: SelectOption[];
  /** Called when the selection changes */
  onChange: (value: string) => void;
  /** Optional element id */
  id?: string;
  /** Optional help text */
  hint?: string;
};

/**
 * Labeled select dropdown for admin forms.
 *
 * @param props - Label, value, options, and change handler
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  id,
  hint,
}: SelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={fieldId}>
        {label}
      </label>
      <select
        id={fieldId}
        className="admin-input admin-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="admin-hint">{hint}</p> : null}
    </div>
  );
}
