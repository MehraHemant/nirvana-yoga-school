import type { ReactNode } from "react";

type AdminFilterSelectProps = {
  /** DOM id for label association */
  id: string;
  /** Form field name */
  name: string;
  /** Visible label above the control; omit for inline toolbar selects */
  label?: string;
  /** Initial value for uncontrolled GET forms */
  defaultValue?: string;
  /** Wider min-width for long option labels */
  wide?: boolean;
  /** Native option elements */
  children: ReactNode;
};

/**
 * Styled native `<select>` for admin filter toolbars — custom chevron and aligned height.
 *
 * @param props - Select identity, optional label, and option children
 */
export function AdminFilterSelect({
  id,
  name,
  label,
  defaultValue,
  wide,
  children,
}: AdminFilterSelectProps) {
  const wrapClass = wide
    ? "admin-select-wrap admin-select-wrap--wide"
    : "admin-select-wrap";

  const selectControl = (
    <div className={wrapClass}>
      <select
        id={id}
        name={name}
        className="admin-input admin-select"
        defaultValue={defaultValue}
      >
        {children}
      </select>
    </div>
  );

  if (label) {
    return (
      <div className="admin-filter-field">
        <label className="admin-label" htmlFor={id}>
          {label}
        </label>
        {selectControl}
      </div>
    );
  }

  return selectControl;
}

type AdminFilterSubmitProps = {
  /** Button label — defaults to “Apply” */
  children?: ReactNode;
};

/**
 * Primary filter form submit — matches select control height in toolbars.
 *
 * @param props - Visible button label
 */
export function AdminFilterSubmit({
  children = "Apply",
}: AdminFilterSubmitProps) {
  return (
    <div className="admin-filter-actions">
      <button type="submit" className="admin-btn-filter">
        {children}
      </button>
    </div>
  );
}
