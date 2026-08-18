"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleBlogPublishedAction } from "@/app/admin/blog/actions";
import { SectionLiveField } from "./SectionLiveField";

type BlogPublishedToggleProps = {
  /** Blog post id */
  postId: string;
  /** Current published flag */
  published: boolean;
};

/**
 * Inline Published/Draft switch for admin blog list rows.
 *
 * @param props - Post id and current publish state
 */
export function BlogPublishedToggle({
  postId,
  published: initialPublished,
}: BlogPublishedToggleProps) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [pending, startTransition] = useTransition();

  function handleChange(nextPublished: boolean) {
    if (pending) return;

    const previous = published;
    setPublished(nextPublished);

    const formData = new FormData();
    formData.set("id", postId);
    formData.set("published", nextPublished ? "true" : "false");

    startTransition(async () => {
      try {
        await toggleBlogPublishedAction(formData);
        router.refresh();
      } catch {
        setPublished(previous);
      }
    });
  }

  return (
    <SectionLiveField
      id={`blog-published-${postId}`}
      value={published}
      liveLabel="Published"
      hiddenLabel="Draft"
      onChange={handleChange}
    />
  );
}
