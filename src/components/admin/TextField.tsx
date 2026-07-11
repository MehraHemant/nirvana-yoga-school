type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  id?: string;
  placeholder?: string;
  hint?: string;
};

/**
 * Labeled text input or textarea for admin forms.
 *
 * @param props - Field label, value, and change handler
 */
export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  id,
  placeholder,
  hint,
}: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={fieldId}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={fieldId}
          className="admin-textarea"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={fieldId}
          className="admin-input"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint ? <p className="admin-hint">{hint}</p> : null}
    </div>
  );
}
