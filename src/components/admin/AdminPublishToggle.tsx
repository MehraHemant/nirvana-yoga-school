"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setPagePublishedAction } from "@/app/admin/pages/content-actions";
import { Check, Close } from "@/icons";

type AdminPublishToggleProps = {
  /** Page id */
  pageId: string;
  /** Current published flag */
  published: boolean;
};

/**
 * Icon publish / unpublish control for admin section tables.
 *
 * @param props - Page id and current status
 */
export function AdminPublishToggle({
  pageId,
  published,
}: AdminPublishToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const label = published ? "Unpublish" : "Publish";

  return (
    <button
      type="button"
      className={
        published
          ? "admin-icon-btn admin-icon-btn--danger"
          : "admin-icon-btn admin-icon-btn--success"
      }
      disabled={pending}
      aria-busy={pending}
      aria-label={label}
      title={label}
      onClick={() => {
        const formData = new FormData();
        formData.set("id", pageId);
        formData.set("published", published ? "false" : "true");
        startTransition(async () => {
          await setPagePublishedAction(formData);
          router.refresh();
        });
      }}
    >
      {published ? <Close size={16} /> : <Check size={16} />}
      <span className="sr-only">{label}</span>
    </button>
  );
}
