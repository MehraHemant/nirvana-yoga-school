"use client";

import { useFormStatus } from "react-dom";
import { deleteBlogPostAction } from "@/app/admin/blog/actions";
import { Trash } from "@/icons";

type DeleteBlogPostButtonProps = {
  /** Blog post slug */
  slug: string;
  /** Post title shown in the confirmation dialog */
  title: string;
};

/**
 * Pending-aware submit control for blog post delete forms.
 */
function DeleteSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="admin-icon-btn admin-icon-btn--danger"
      disabled={pending}
      aria-busy={pending}
      aria-label="Delete post"
      title="Delete post"
    >
      <Trash size={16} />
      <span className="sr-only">Delete post</span>
    </button>
  );
}

/**
 * Confirmed hard-delete for a blog post (server action).
 *
 * @param props - Slug and title for the confirmation prompt
 */
export function DeleteBlogPostButton({
  slug,
  title,
}: DeleteBlogPostButtonProps) {
  return (
    <form
      action={deleteBlogPostAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete "${title}"? This permanently removes the post and cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <DeleteSubmit />
    </form>
  );
}
