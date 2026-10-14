"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "@/icons";

type AdminPasswordFieldProps = {
  /** Field label */
  label: string;
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Input id; auto-generated from label when omitted */
  id?: string;
  /** Optional helper text below the input */
  hint?: string;
  /** Autocomplete token for password managers */
  autoComplete?: "current-password" | "new-password";
  /** Minimum password length */
  minLength?: number;
  /** Whether the field is required */
  required?: boolean;
};

/**
 * Admin password input with show/hide visibility toggle.
 *
 * @param props - Label, value, and standard password input attributes
 */
export function AdminPasswordField({
  label,
  value,
  onChange,
  id,
  hint,
  autoComplete,
  minLength,
  required = false,
}: AdminPasswordFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="admin-password-field">
        <input
          id={fieldId}
          className="admin-input admin-input--password"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          className="admin-password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint ? <p className="admin-hint admin-hint--tight">{hint}</p> : null}
    </div>
  );
}
