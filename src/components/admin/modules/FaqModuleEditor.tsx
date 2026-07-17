"use client";

import type { FaqsModule } from "@/content/types";
import { CollapsiblePanel } from "../CollapsiblePanel";
import { ListRowActions } from "../ListRowActions";
import {
  SortableList,
  SortableRow,
  reorderItems,
  withSortField,
} from "../SortableList";
import { useStableListKeys } from "../useStableListKeys";
import { SectionIdField } from "../SectionIdField";
import { ModuleLiveField } from "./ModuleLiveField";
import type { ModulePanelProps } from "./types";

type FaqModuleEditorProps = ModulePanelProps & {
  faqs: FaqsModule;
  onChange: (faqs: FaqsModule) => void;
};

/**
 * FAQ module editor with drag-and-drop question reorder.
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
  const { keys, addKey, removeKey, reorderKeys } = useStableListKeys(
    faqs.items.length,
  );

  function handleReorder(fromIndex: number, toIndex: number) {
    reorderKeys(fromIndex, toIndex);
    const items = withSortField(
      reorderItems(faqs.items, fromIndex, toIndex),
    ) as typeof faqs.items;
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
      {faqs.items.length === 0 ? (
        <div className="admin-empty-card">
          <p>No FAQs yet.</p>
          <button
            type="button"
            className="admin-btn-sm"
            onClick={() => {
              addKey();
              onChange({
                ...faqs,
                items: [{ question: "", answer: "" }],
              });
            }}
          >
            Add first FAQ
          </button>
        </div>
      ) : (
        <div className="admin-compact-table-scroll">
          <div className="admin-compact-table admin-compact-table--form admin-compact-table--faq">
            <div className="admin-compact-table-head admin-compact-table-row">
              <span className="admin-compact-col admin-compact-col--num">
                #
              </span>
              <span className="admin-compact-col admin-compact-col--question">
                Question
              </span>
              <span className="admin-compact-col admin-compact-col--answer">
                Answer
              </span>
              <span className="admin-compact-col admin-compact-col--actions">
                <span className="sr-only">Actions</span>
              </span>
            </div>
            <SortableList ids={keys} onReorder={handleReorder}>
              {faqs.items.map((faq, index) => (
                <SortableRow key={keys[index]} id={keys[index]}>
                  {({ dragHandleProps }) => (
                    <div className="admin-compact-table-row admin-compact-table-row--tall">
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
                            items[index] = {
                              ...faq,
                              question: event.target.value,
                            };
                            onChange({ ...faqs, items });
                          }}
                        />
                      </span>
                      <span className="admin-compact-col admin-compact-col--answer">
                        <textarea
                          className="admin-textarea admin-textarea--row"
                          value={faq.answer}
                          placeholder="Answer text…"
                          rows={2}
                          onChange={(event) => {
                            const items = [...faqs.items];
                            items[index] = {
                              ...faq,
                              answer: event.target.value,
                            };
                            onChange({ ...faqs, items });
                          }}
                        />
                      </span>
                      <span className="admin-compact-col admin-compact-col--actions">
                        <ListRowActions
                          dragHandleProps={dragHandleProps}
                          onRemove={() => {
                            removeKey(index);
                            onChange({
                              ...faqs,
                              items: faqs.items.filter((_, i) => i !== index),
                            });
                          }}
                        />
                      </span>
                    </div>
                  )}
                </SortableRow>
              ))}
            </SortableList>
          </div>
        </div>
      )}
      <button
        type="button"
        className="admin-btn-sm"
        onClick={() => {
          addKey();
          onChange({
            ...faqs,
            items: [...faqs.items, { question: "", answer: "" }],
          });
        }}
      >
        Add FAQ
      </button>
    </CollapsiblePanel>
  );
}
