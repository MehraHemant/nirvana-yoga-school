"use client";

import type { FaqsModule } from "@/content/types";
import { PageFaqAssignmentsEditor } from "@/components/admin/PageFaqAssignmentsEditor";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { SectionIdField } from "../SectionIdField";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type FaqModuleEditorProps = ModulePanelProps & {
  faqs: FaqsModule;
  onChange: (faqs: FaqsModule) => void;
  /** Page slug used for FAQ assignment context. */
  pageSlug: string;
  /** Default admin tag for newly created FAQs. */
  adminTag?: string;
};

/**
 * FAQ module editor — assigns/reorders FAQs from the shared catalog.
 *
 * @param props - FAQ config, page slug, and change handler
 */
export function FaqModuleEditor({
  faqs,
  onChange,
  pageSlug,
  adminTag = "course",
  panelId = "module-faq",
  step = 10,
  description,
  open,
  onOpenChange,
}: FaqModuleEditorProps) {
  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="FAQ"
      subtitle="Catalog assignments"
      description={
        description ??
        (adminTag === "course"
          ? "Assign course FAQs from the shared catalog. Use “Add all course FAQs” to populate quickly, then drag to reorder or expand cards to edit."
          : "Assign FAQs from the shared catalog. Edit question copy in the catalog or inline here.")
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
      <PageFaqAssignmentsEditor
        contextType="page"
        contextKey={pageSlug}
        adminTag={adminTag}
        idPrefix={panelId}
      />
    </CollapsiblePanel>
  );
}
