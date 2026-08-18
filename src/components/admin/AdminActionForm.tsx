"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type AdminActionFormProps = {
  /** Server action bound to the form */
  action: (formData: FormData) => void | Promise<void>;
  /** Hidden field entries */
  fields: Record<string, string>;
  /** Accessible label for the submit button */
  label: string;
  /** Submit button contents */
  children: ReactNode;
};

/**
 * Pending-aware default submit control for server-action forms.
 *
 * @param props - Label and icon contents
 */
function DefaultSubmit({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="admin-icon-btn"
      aria-label={label}
      title={label}
      disabled={pending}
      aria-busy={pending}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/**
 * Non-destructive server-action form with an icon submit button.
 *
 * @param props - Action, hidden fields, label, and icon
 */
export function AdminActionForm({
  action,
  fields,
  label,
  children,
}: AdminActionFormProps) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <DefaultSubmit label={label}>{children}</DefaultSubmit>
    </form>
  );
}
