"use client";

import type { FaqsModule } from "@/content/types";
import { FaqItemsEditor } from "@/components/admin/FaqItemsEditor";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { SectionIdField } from "../SectionIdField";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type FaqModuleEditorProps = ModulePanelProps & {
  faqs: FaqsModule;
  onChange: (faqs: FaqsModule) => void;
};

/**
 * FAQ module editor — inline questions for this page only.
 *
 * @param props - FAQ config and change handler
 */
export function FaqModuleEditor({
  faqs,
  onChange,
  panelId = "module-faq",
  step = 10,
  description,
  open,
  onOpenChange,
}: FaqModuleEditorProps) {
  const itemCount = faqs.items?.length ?? 0;

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="FAQ"
      subtitle={
        itemCount > 0
          ? `${itemCount} question${itemCount === 1 ? "" : "s"}`
          : "No questions yet"
      }
      description={
        description ??
        "Add questions and answers for this page. Choose one of four categories, drag to reorder, and expand cards to edit."
      }
      open={open}
      onOpenChange={onOpenChange}
      actions={
        <ModuleLiveField
          id={`${panelId}-live`}
          value={faqs.live}
          onChange={(live) => onChange({ ...faqs, live })}
        />
      }
    >
      <SectionIdField
        fieldId={`${panelId}-section-id`}
        value={faqs._id}
        onChange={(_id) => onChange({ ...faqs, _id })}
      />
      <FaqItemsEditor
        items={faqs.items ?? []}
        onChange={(items) => onChange({ ...faqs, items })}
        idPrefix={panelId}
      />
    </CollapsiblePanel>
  );
}
