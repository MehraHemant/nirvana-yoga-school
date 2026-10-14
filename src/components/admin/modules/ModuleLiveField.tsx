"use client";

import { SectionLiveField } from "@/components/admin/SectionLiveField";

type ModuleLiveFieldProps = {
  /** Current module `live` flag */
  value?: boolean;
  /** Persist next live value on the module */
  onChange: (live: boolean) => void;
  /** Stable input id */
  id?: string;
};

/**
 * Live toggle for a `page_modules` section panel header.
 * Pass as `CollapsiblePanel` `actions` beside the module title.
 *
 * @param props - Current value and change handler
 */
export function ModuleLiveField({
  value,
  onChange,
  id = "module-live",
}: ModuleLiveFieldProps) {
  return <SectionLiveField id={id} value={value} onChange={onChange} />;
}
