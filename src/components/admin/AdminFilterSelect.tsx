import type { ReactNode } from "react";

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
