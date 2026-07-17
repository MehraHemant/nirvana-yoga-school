"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createNavigationGroupAction } from "@/app/admin/navigation/actions";
import { Plus } from "@/icons";

/**
 * Creates a navigation group via server action (avoids form-action serialization issues).
 */
export function AdminCreateNavigationGroupForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin-form-stack"
      style={{ padding: 0 }}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          await createNavigationGroupAction(formData);
          router.refresh();
          event.currentTarget.reset();
        });
      }}
    >
      <div className="admin-grid-2">
        <div className="admin-field">
          <label className="admin-label" htmlFor="nav-key">
            Key
          </label>
          <input
            id="nav-key"
            name="key"
            placeholder="primary"
            required
            className="admin-input"
            pattern="[a-z][a-z0-9_-]{1,63}"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="nav-label">
            Label
          </label>
          <input
            id="nav-label"
            name="label"
            placeholder="Primary navigation"
            required
            className="admin-input"
          />
        </div>
      </div>
      <button type="submit" className="admin-btn" disabled={pending}>
        <Plus size={16} /> {pending ? "Creating…" : "Create group"}
      </button>
    </form>
  );
}
