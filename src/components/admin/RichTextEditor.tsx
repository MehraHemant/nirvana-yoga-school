"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useState } from "react";
import { stripHtml } from "@/lib/cms/blog-html";
import { MediaPicker } from "./MediaPicker";

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Compact toolbar for shorter fields like excerpts */
  compact?: boolean;
  /** Allow inserting images from the media library */
  enableImages?: boolean;
  /** Show word and character counts below the editor */
  showStats?: boolean;
};

type ToolbarButtonProps = {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

/**
 * Toolbar button with active state styling.
 *
 * @param props - Button label, active flag, and click handler
 */
function ToolbarButton({
  active = false,
  label,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`admin-rich-text-btn${active ? " admin-rich-text-btn--active" : ""}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

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
  enableImages = !compact,
  showStats = !compact,
}: RichTextEditorProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: compact ? false : { levels: [2, 3, 4] },
        blockquote: compact ? false : undefined,
        bulletList: compact ? false : undefined,
        orderedList: compact ? false : undefined,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
      ...(enableImages
        ? [
            Image.configure({
              HTMLAttributes: {
                class: "admin-rich-text-image",
                loading: "lazy",
              },
            }),
          ]
        : []),
    ],
    [compact, enableImages, placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
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

  if (!mounted || !editor) {
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

  function insertImage(url: string) {
    editor?.chain().focus().setImage({ src: url }).run();
    setMediaOpen(false);
  }

  const plainText = stripHtml(editor.getHTML());
  const wordCount = plainText
    ? plainText.split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = plainText.length;

  return (
    <div className="admin-field">
      <div className="admin-rich-text-label-row">
        <span className="admin-label">{label}</span>
        {showStats ? (
          <span className="admin-char-count" aria-live="polite">
            {wordCount} words · {charCount} characters
          </span>
        ) : null}
      </div>
      <div className="admin-rich-text">
        <div
          className="admin-rich-text-toolbar"
          role="toolbar"
          aria-label={`${label} formatting`}
        >
          <div className="admin-rich-text-toolbar-group">
            <ToolbarButton
              active={editor.isActive("bold")}
              label="Bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("italic")}
              label="Italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("link")}
              label="Link"
              onClick={setLink}
            >
              Link
            </ToolbarButton>
          </div>

          {!compact ? (
            <>
              <span
                className="admin-rich-text-toolbar-sep"
                aria-hidden="true"
              />
              <div className="admin-rich-text-toolbar-group">
                <ToolbarButton
                  active={editor.isActive("heading", { level: 2 })}
                  label="Heading 2"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                >
                  H2
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("heading", { level: 3 })}
                  label="Heading 3"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                >
                  H3
                </ToolbarButton>
              </div>
              <span
                className="admin-rich-text-toolbar-sep"
                aria-hidden="true"
              />
              <div className="admin-rich-text-toolbar-group">
                <ToolbarButton
                  active={editor.isActive("bulletList")}
                  label="Bullet list"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  • List
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("orderedList")}
                  label="Numbered list"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  1. List
                </ToolbarButton>
                <ToolbarButton
                  active={editor.isActive("blockquote")}
                  label="Blockquote"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                >
                  “ Quote
                </ToolbarButton>
              </div>
            </>
          ) : null}

          {enableImages ? (
            <>
              <span
                className="admin-rich-text-toolbar-sep"
                aria-hidden="true"
              />
              <div className="admin-rich-text-toolbar-group">
                <ToolbarButton
                  label="Insert image"
                  onClick={() => setMediaOpen(true)}
                >
                  Image
                </ToolbarButton>
              </div>
            </>
          ) : null}

          <span className="admin-rich-text-toolbar-sep" aria-hidden="true" />
          <div className="admin-rich-text-toolbar-group">
            <ToolbarButton
              label="Undo"
              onClick={() => editor.chain().focus().undo().run()}
            >
              Undo
            </ToolbarButton>
            <ToolbarButton
              label="Redo"
              onClick={() => editor.chain().focus().redo().run()}
            >
              Redo
            </ToolbarButton>
          </div>
        </div>
        <EditorContent editor={editor} className="admin-rich-text-body" />
      </div>

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={insertImage}
        tagFilter="blog"
      />
    </div>
  );
}
