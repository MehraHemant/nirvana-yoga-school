/**
 * Contentful-style field definitions for content types.
 */

/** Built-in field widgets available when designing a content type. */
export type ContentFieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "dropdown"
  | "image"
  | "toggle"
  | "repeater"
  | "reference"
  | "media";

/** Scalar widgets allowed as columns inside a repeater row. */
export type RepeaterColumnType = Exclude<
  ContentFieldType,
  "repeater" | "richtext" | "reference" | "media"
>;

/**
 * One field on a content type — drives the page content editor form.
 */
export type ContentFieldDefinition = {
  /** Unique key within the type — stored under Page.contentData[key] */
  key: string;
  /** Admin-facing label */
  label: string;
  /** Widget kind */
  type: ContentFieldType;
  /** Show as required in the editor */
  required?: boolean;
  /** Help text under the control */
  help?: string;
  /** Default value when creating / assigning a type */
  defaultValue?: string | number | boolean;
  /** Options for `dropdown` fields */
  options?: { label: string; value: string }[];
  /**
   * Column definitions for `repeater` fields. Each row of the table stores a
   * record keyed by the sub-field key. Sub-fields are scalar widgets only.
   */
  subFields?: ContentFieldDefinition[];
  /**
   * Allowed target content-type keys for `reference` fields. Empty / omitted
   * means any component type is allowed.
   */
  refTypes?: string[];
  /**
   * For `reference` and `media` fields — allow linking multiple items
   * (stored as an ordered array of ids) rather than a single one.
   */
  multiple?: boolean;
};

/**
 * Admin payload for creating/updating a content type.
 */
export type ContentTypeInput = {
  key: string;
  name: string;
  description?: string;
  fields?: ContentFieldDefinition[];
};

/**
 * Human-friendly names for field widgets (Contentful-style).
 */
export const CONTENT_FIELD_TYPE_LABELS: Record<ContentFieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  richtext: "Rich text",
  dropdown: "Dropdown",
  image: "Image",
  toggle: "Toggle",
  repeater: "Repeater (table)",
  reference: "Reference (link items)",
  media: "Media (asset)",
};

/**
 * Short descriptions shown in the field-type picker.
 */
export const CONTENT_FIELD_TYPE_HINTS: Record<ContentFieldType, string> = {
  text: "Single line — titles, names, short labels",
  textarea: "Multi-line plain text",
  richtext: "Formatted copy with headings and links",
  dropdown: "Pick one value from a list",
  image: "Image URL or media path",
  toggle: "On / off switch",
  repeater: "Multiple entries — a table of rows you can add to",
  reference: "Link to other reusable content items (e.g. page sections)",
  media: "Link to a media library asset",
};

export const CONTENT_FIELD_TYPES = Object.keys(
  CONTENT_FIELD_TYPE_LABELS,
) as ContentFieldType[];

/** Scalar widget types allowed for repeater columns. */
export const REPEATER_COLUMN_TYPES: RepeaterColumnType[] = [
  "text",
  "textarea",
  "dropdown",
  "image",
  "toggle",
];
