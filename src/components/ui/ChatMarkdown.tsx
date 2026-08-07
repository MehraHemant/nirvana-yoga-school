"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Stabilize markdown while streaming so incomplete `[label](url` syntax
 * never flashes as raw text — show a real link (or just the label) instead.
 *
 * @param content - Partial or complete markdown body
 */
export function prepareStreamingMarkdown(content: string): string {
  let text = content;

  // Incomplete image: ![alt](url… or ![alt
  if (/!\[[^\]]*\]\([^)]*$/.test(text)) {
    text = text.replace(/!\[([^\]]*)\]\([^)]*$/, "$1");
  } else if (/!\[[^\]]*$/.test(text)) {
    text = text.replace(/!\[([^\]]*)$/, "$1");
  }

  // Incomplete link with a usable http(s) URL — close it for the parser so
  // it renders as <a> while the remaining URL characters still arrive.
  if (/\[[^\]]+\]\(https?:\/\/[^)\s]*$/.test(text)) {
    text = text.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]*)$/,
      (_full, label: string, url: string) => {
        if (url.length < 8) return label;
        return `[${label}](${url})`;
      },
    );
  } else if (/\[[^\]]*\]\([^)]*$/.test(text)) {
    // [label](… without a full URL yet — show label only
    text = text.replace(/\[([^\]]*)\]\([^)]*$/, "$1");
  } else if (/\[[^\]]*$/.test(text)) {
    // Incomplete [label without ]
    text = text.replace(/\[([^\]]*)$/, "$1");
  }

  // Incomplete autolink <https://…>
  if (/<https?:[^>\s]*$/.test(text)) {
    text = text.replace(/<(https?:\/\/[^>\s]*)$/, "$1");
  }

  return text;
}

type ChatMarkdownProps = {
  content: string;
  streaming?: boolean;
};

/**
 * Renders assistant markdown (links, bold, lists) without raw HTML.
 *
 * @param props - Markdown body and optional streaming flag
 */
export default function ChatMarkdown({
  content,
  streaming = false,
}: ChatMarkdownProps) {
  const source = streaming ? prepareStreamingMarkdown(content) : content;

  return (
    <div className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
