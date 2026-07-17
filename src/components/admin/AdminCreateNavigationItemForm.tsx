"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createNavigationItemAction } from "@/app/admin/navigation/actions";
import { Plus } from "@/icons";

type AdminCreateNavigationItemFormProps = {
  /** Parent navigation group id */
  groupId: string;
};

/**
 * Adds a page or href item into an existing navigation group.
 *
 * @param props - Target group id
 */
export function AdminCreateNavigationItemForm({
  groupId,
}: AdminCreateNavigationItemFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin-form-stack"
      style={{ paddingTop: "1rem" }}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set("groupId", groupId);
        startTransition(async () => {
          await createNavigationItemAction(formData);
          router.refresh();
          event.currentTarget.reset();
        });
      }}
    >
      <div className="admin-grid-2">
        <div className="admin-field">
          <label className="admin-label" htmlFor={`nav-item-label-${groupId}`}>
            Label
          </label>
          <input
            id={`nav-item-label-${groupId}`}
            name="label"
            required
            className="admin-input"
            placeholder="Course title"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor={`nav-item-type-${groupId}`}>
            Item type
          </label>
          <select
            id={`nav-item-type-${groupId}`}
            name="itemType"
            className="admin-input"
            defaultValue="page"
          >
            <option value="page">Page</option>
            <option value="static">Href</option>
          </select>
        </div>
        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`nav-item-page-type-${groupId}`}
          >
            Page type
          </label>
          <select
            id={`nav-item-page-type-${groupId}`}
            name="pageType"
            className="admin-input"
            defaultValue="online"
          >
            <option value="site">site</option>
            <option value="course">course</option>
            <option value="online">online</option>
            <option value="retreat">retreat</option>
            <option value="venue">venue</option>
          </select>
        </div>
        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`nav-item-page-slug-${groupId}`}
          >
            Page slug
          </label>
          <input
            id={`nav-item-page-slug-${groupId}`}
            name="pageSlug"
            className="admin-input"
            placeholder="online-200-hour-…"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor={`nav-item-href-${groupId}`}>
            Href (for static)
          </label>
          <input
            id={`nav-item-href-${groupId}`}
            name="href"
            className="admin-input"
            placeholder="/path"
          />
        </div>
      </div>
      <button type="submit" className="admin-btn-sm" disabled={pending}>
        <Plus size={16} /> {pending ? "Adding…" : "Add item to group"}
      </button>
    </form>
  );
}
