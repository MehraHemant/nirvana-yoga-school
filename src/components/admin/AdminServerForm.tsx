"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTransition } from "react";

type AdminServerFormProps = {
  /** Server action called with form FormData */
  action: (formData: FormData) => Promise<void>;
  /** Optional class on the form */
  className?: string;
  /** Form fields and submit control */
  children: ReactNode;
  /** Label while pending for auto-disable of submit */
  pendingLabel?: string;
};

/**
 * Client form wrapper that invokes a server action without using form `action={fn}` props.
 *
 * @param props - Server action and form children
 */
export function AdminServerForm({
  action,
  className,
  children,
}: AdminServerFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          await action(formData);
          router.refresh();
        });
      }}
      data-pending={pending ? "true" : undefined}
    >
      <fieldset
        disabled={pending}
        style={{ border: "none", margin: 0, padding: 0, minInlineSize: 0 }}
      >
        {children}
      </fieldset>
    </form>
  );
}
