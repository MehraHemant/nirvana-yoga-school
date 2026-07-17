import { createId as createCuid } from "@paralleldrive/cuid2";

/**
 * Generates a cuid-compatible primary key for new rows.
 *
 * @returns New id string
 */
export function createId(): string {
  return createCuid();
}
