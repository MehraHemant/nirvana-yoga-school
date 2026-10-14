"use client";

import { TextField } from "@/components/admin/TextField";

type SectionIdFieldProps = {
  /** Current optional section `_id` */
  value?: string;
  /** Change handler for `_id` */
  onChange: (value: string) => void;
  /** Stable input id */
  fieldId: string;
};

/**
 * Compact `_id` field shown at the top of each admin section panel body.
 * When set, used as the public section HTML `id` for scroll anchors.
 *
 * @param props - Current id value and change handler
 */
export function SectionIdField({
  value,
  onChange,
  fieldId,
}: SectionIdFieldProps) {
  return (
    <TextField
      id={fieldId}
      label="_id"
      value={value ?? ""}
      onChange={onChange}
      placeholder="Optional section id"
      hint="Scroll anchor when set; leave empty to use the default"
    />
  );
}
