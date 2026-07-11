/** Blog article document. */

export type BlogContentBlock =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "date"; text: string };

export type BlogPostDocument = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  publishedAt?: string | null;
  /** Legacy structured blocks — used when `bodyHtml` is empty */
  content: BlogContentBlock[];
  /** Rich-text HTML from the CMS editor (preferred when set) */
  bodyHtml?: string | null;
};
