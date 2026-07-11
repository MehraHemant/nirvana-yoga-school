"use client";

import type { FaqsModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import { ModuleLibraryPanelActions } from "../ModuleLibraryPanelActions";
import type { ModulePanelProps } from "./types";

type FaqModuleEditorProps = ModulePanelProps & {
  faqs: FaqsModule;
  onChange: (faqs: FaqsModule) => void;
};

/**
 * FAQ module editor.
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
  hideLibraryActions = false,
}: FaqModuleEditorProps) {
  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= faqs.items.length) return;
    const items = [...faqs.items];
    [items[index], items[target]] = [items[target], items[index]];
    onChange({ ...faqs, items });
  }

  return (
    <CollapsiblePanel
      id={panelId}
      step={step}
      title="FAQ"
      subtitle={`${faqs.items.length} questions`}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      actions={
        hideLibraryActions ? undefined : (
          <ModuleLibraryPanelActions
            moduleKey="faqs"
            payload={faqs}
            hasContent={faqs.items.length > 0}
            onInsert={(payload) => onChange(payload as FaqsModule)}
          />
        )
      }
    >
      {faqs.items.length === 0 ? (
        <div className="admin-empty-card">
          <p>No FAQs yet.</p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() =>
              onChange({
                ...faqs,
                items: [{ question: "", answer: "" }],
              })
            }
          >
            Add first FAQ
          </button>
        </div>
      ) : (
        <div className="admin-compact-table admin-compact-table--form admin-compact-table--faq">
          <div className="admin-compact-table-head admin-compact-table-row">
            <span className="admin-compact-col admin-compact-col--num">#</span>
            <span className="admin-compact-col admin-compact-col--question">
              Question
            </span>
            <span className="admin-compact-col admin-compact-col--answer">
              Answer
            </span>
            <span className="admin-compact-col admin-compact-col--actions" />
          </div>
          {faqs.items.map((faq, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: FAQ rows lack stable ids
            <div key={`faq-${index}`} className="admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                {index + 1}
              </span>
              <span className="admin-compact-col admin-compact-col--question">
                <input
                  className="admin-input admin-input--compact"
                  value={faq.question}
                  placeholder="What is included?"
                  onChange={(event) => {
                    const items = [...faqs.items];
                    items[index] = { ...faq, question: event.target.value };
                    onChange({ ...faqs, items });
                  }}
                />
              </span>
              <span className="admin-compact-col admin-compact-col--answer">
                <input
                  className="admin-input admin-input--compact"
                  value={faq.answer}
                  placeholder="Answer text…"
                  onChange={(event) => {
                    const items = [...faqs.items];
                    items[index] = { ...faq, answer: event.target.value };
                    onChange({ ...faqs, items });
                  }}
                />
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <ListRowActions
                  index={index}
                  total={faqs.items.length}
                  onMoveUp={() => moveItem(index, -1)}
                  onMoveDown={() => moveItem(index, 1)}
                  onRemove={() =>
                    onChange({
                      ...faqs,
                      items: faqs.items.filter((_, i) => i !== index),
                    })
                  }
                />
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() =>
          onChange({
            ...faqs,
            items: [...faqs.items, { question: "", answer: "" }],
          })
        }
      >
        Add FAQ
      </button>
    </CollapsiblePanel>
  );
}
