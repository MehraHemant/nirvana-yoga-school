"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Compact toolbar for shorter fields like excerpts */
  compact?: boolean;
};

/**
 * Tiptap-based rich text editor for CMS long-form content.
 *
 * @param props - Label, HTML value, change handler, and optional compact mode
 */
export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Write your content…",
  compact = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: compact ? false : { levels: [2, 3, 4] },
        blockquote: compact ? false : undefined,
        bulletList: compact ? false : undefined,
        orderedList: compact ? false : undefined,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "admin-rich-text-content",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="admin-field">
        <span className="admin-label">{label}</span>
        <p className="admin-hint">Loading editor…</p>
      </div>
    );
  }

  function setLink() {
    const previous = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  return (
    <div className="admin-field">
      <span className="admin-label">{label}</span>
      <div className="admin-rich-text">
        <div
          className="admin-rich-text-toolbar"
          role="toolbar"
          aria-label={`${label} formatting`}
        >
          <button
            type="button"
            className={`admin-rich-text-btn${editor.isActive("bold") ? " admin-rich-text-btn--active" : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            B
          </button>
          <button
            type="button"
            className={`admin-rich-text-btn${editor.isActive("italic") ? " admin-rich-text-btn--active" : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            I
          </button>
          {!compact ? (
            <>
              <button
                type="button"
                className={`admin-rich-text-btn${editor.isActive("heading", { level: 2 }) ? " admin-rich-text-btn--active" : ""}`}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                aria-label="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                className={`admin-rich-text-btn${editor.isActive("heading", { level: 3 }) ? " admin-rich-text-btn--active" : ""}`}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                aria-label="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                className={`admin-rich-text-btn${editor.isActive("bulletList") ? " admin-rich-text-btn--active" : ""}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Bullet list"
              >
                • List
              </button>
              <button
                type="button"
                className={`admin-rich-text-btn${editor.isActive("orderedList") ? " admin-rich-text-btn--active" : ""}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Numbered list"
              >
                1. List
              </button>
              <button
                type="button"
                className={`admin-rich-text-btn${editor.isActive("blockquote") ? " admin-rich-text-btn--active" : ""}`}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Blockquote"
              >
                “
              </button>
            </>
          ) : null}
          <button
            type="button"
            className={`admin-rich-text-btn${editor.isActive("link") ? " admin-rich-text-btn--active" : ""}`}
            onClick={setLink}
            aria-label="Link"
          >
            Link
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
