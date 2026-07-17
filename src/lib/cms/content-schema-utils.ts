import type {
  ContentFieldDefinition,
  ContentFieldType,
} from "@/content/types/content-schema";
import { CONTENT_FIELD_TYPES } from "@/content/types/content-schema";

const KEY_RE = /^[a-z][a-z0-9_-]{1,63}$/;

const LEGACY_FIELD_TYPE_MAP: Record<string, ContentFieldType> = {
  select: "dropdown",
  boolean: "toggle",
  number: "text",
  url: "text",
};

/**
 * Returns whether a string is a valid content-type or field key.
 *
 * @param value - Candidate key
 */
export function isValidContentKey(value: string): boolean {
  return KEY_RE.test(value);
}

/**
 * Normalizes a raw field type string (including legacy aliases).
 *
 * @param raw - Stored type name
 */
export function normalizeFieldType(raw: unknown): ContentFieldType | null {
  if (typeof raw !== "string") return null;
  if (CONTENT_FIELD_TYPES.includes(raw as ContentFieldType)) {
    return raw as ContentFieldType;
  }
  return LEGACY_FIELD_TYPE_MAP[raw] ?? null;
}

/**
 * Parses and validates a fields JSON array from the database or form input.
 *
 * @param raw - Unknown JSON value
 * @param allowRepeater - Allow the `repeater` type (false for nested columns)
 * @returns Normalized field definitions (invalid entries dropped)
 */
export function parseContentFields(
  raw: unknown,
  allowRepeater = true,
): ContentFieldDefinition[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const fields: ContentFieldDefinition[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const key = typeof row.key === "string" ? row.key.trim() : "";
    const label = typeof row.label === "string" ? row.label.trim() : "";
    let type = normalizeFieldType(row.type);
    if (!key || !label || !type) continue;
    // Columns are scalar-only — coerce structural/relational widgets down.
    if (!allowRepeater) {
      if (type === "repeater" || type === "reference") type = "text";
      else if (type === "richtext") type = "textarea";
      else if (type === "media") type = "image";
    }
    if (seen.has(key)) continue;
    seen.add(key);

    const field: ContentFieldDefinition = { key, label, type };
    if (row.required === true) field.required = true;
    if (typeof row.help === "string" && row.help.trim()) {
      field.help = row.help.trim();
    }
    if (
      typeof row.defaultValue === "string" ||
      typeof row.defaultValue === "number" ||
      typeof row.defaultValue === "boolean"
    ) {
      field.defaultValue = row.defaultValue;
    }
    if (type === "dropdown" && Array.isArray(row.options)) {
      field.options = row.options
        .filter(
          (opt): opt is { label: string; value: string } =>
            !!opt &&
            typeof opt === "object" &&
            typeof (opt as { label?: unknown }).label === "string" &&
            typeof (opt as { value?: unknown }).value === "string",
        )
        .map((opt) => ({ label: opt.label, value: opt.value }));
    }
    if (type === "repeater") {
      // Repeater columns are a single level of scalar sub-fields.
      field.subFields = parseContentFields(row.subFields, false);
    }
    if (type === "reference") {
      if (Array.isArray(row.refTypes)) {
        field.refTypes = row.refTypes.filter(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        );
      }
      if (row.multiple === true) field.multiple = true;
    }
    if (type === "media" && row.multiple === true) {
      field.multiple = true;
    }
    fields.push(field);
  }

  return fields;
}

/**
 * Coerces a raw repeater value (JSON string or array) into normalized rows.
 *
 * @param field - The repeater field definition (uses its subFields)
 * @param value - Stored array or serialized JSON string of rows
 */
export function normalizeRepeaterRows(
  field: ContentFieldDefinition,
  value: unknown,
): Record<string, unknown>[] {
  const columns = field.subFields ?? [];
  let list: unknown = value;
  if (typeof list === "string") {
    if (!list.trim()) return [];
    try {
      list = JSON.parse(list);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];
  return list.map((row) =>
    normalizeItemData(
      columns,
      row && typeof row === "object" ? (row as Record<string, unknown>) : {},
    ),
  );
}

/**
 * Coerces a raw value (JSON string or array) into a clean list of string ids.
 *
 * @param value - Stored array or serialized JSON string of ids
 */
export function normalizeIdList(value: unknown): string[] {
  let list: unknown = value;
  if (typeof list === "string") {
    const trimmed = list.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        list = JSON.parse(trimmed);
      } catch {
        return [trimmed];
      }
    } else {
      return [trimmed];
    }
  }
  if (!Array.isArray(list)) return [];
  return list
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

/**
 * Builds default data values from a type’s field definitions.
 *
 * @param fields - Field definitions
 */
export function defaultsFromFields(
  fields: ContentFieldDefinition[],
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === "repeater" || field.type === "reference") {
      data[field.key] = [];
    } else if (field.type === "media") {
      data[field.key] = field.multiple ? [] : "";
    } else if (field.defaultValue !== undefined) {
      data[field.key] = field.defaultValue;
    } else if (field.type === "toggle") {
      data[field.key] = false;
    } else {
      data[field.key] = "";
    }
  }
  return data;
}

/**
 * Coerces form/data values to match field types.
 *
 * @param fields - Schema fields
 * @param raw - Incoming data map
 */
export function normalizeItemData(
  fields: ContentFieldDefinition[],
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    const value = raw[field.key];
    switch (field.type) {
      case "toggle":
        data[field.key] =
          value === true || value === "true" || value === "on" || value === 1;
        break;
      case "repeater":
        data[field.key] = normalizeRepeaterRows(field, value);
        break;
      case "reference":
        data[field.key] = normalizeIdList(value);
        break;
      case "media":
        data[field.key] = field.multiple
          ? normalizeIdList(value)
          : value == null
            ? ""
            : String(value);
        break;
      default:
        data[field.key] = value == null ? "" : String(value);
    }
  }
  return data;
}

/**
 * True when CMS content has at least one meaningful filled field.
 *
 * @param data - content_data map
 */
export function hasFilledCmsData(data: Record<string, unknown>): boolean {
  return Object.values(data).some(valueHasContent);
}

/** True when a single field value holds meaningful content. */
function valueHasContent(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) {
    return value.some((row) =>
      row && typeof row === "object"
        ? Object.values(row as Record<string, unknown>).some(valueHasContent)
        : valueHasContent(row),
    );
  }
  return false;
}

/**
 * Reads `data[key]` entries from FormData into a plain object.
 *
 * @param formData - Submitted form data
 * @param prefix - Form name prefix (default `data`)
 */
export function readDataFromFormData(
  formData: FormData,
  prefix = "data",
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const re = new RegExp(`^${prefix}\\[(.+)]$`);
  for (const [name, value] of formData.entries()) {
    const match = re.exec(name);
    if (!match) continue;
    data[match[1]] = typeof value === "string" ? value : "";
  }
  return data;
}
