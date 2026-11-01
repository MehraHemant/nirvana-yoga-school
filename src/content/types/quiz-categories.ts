/** Fixed quiz categories shared by the CMS editor, API, and public quiz. */

export const QUIZ_CATEGORY_IDS = [
  "yoga-basics",
  "yoga-poses",
  "yoga-philosophy",
  "yoga-teacher-training",
  "200-hour-ttc",
  "300-hour-ttc",
  "500-hour-ttc",
  "yin-yoga",
  "sound-healing",
  "kirtan",
  "mantra-chanting",
  "meditation",
  "chakras",
  "yoga-anatomy",
  "yoga-retreats",
  "3-day-yoga-meditation",
  "5-day-yoga-meditation",
  "7-day-yoga-meditation",
] as const;

/** Stored category value on quiz questions. */
export type QuizCategoryId = (typeof QUIZ_CATEGORY_IDS)[number];

/** A single category, or every category in one attempt. */
export type QuizCategoryFilter = QuizCategoryId | "all";

export type QuizCategoryOption = {
  id: QuizCategoryId;
  label: string;
};

/** Human-readable labels for each fixed quiz category. */
export const QUIZ_CATEGORIES: QuizCategoryOption[] = [
  { id: "yoga-basics", label: "Yoga Basics" },
  { id: "yoga-poses", label: "Yoga Poses" },
  { id: "yoga-philosophy", label: "Yoga Philosophy" },
  { id: "yoga-teacher-training", label: "Yoga Teacher Training" },
  { id: "200-hour-ttc", label: "200 Hour TTC" },
  { id: "300-hour-ttc", label: "300 Hour TTC" },
  { id: "500-hour-ttc", label: "500 Hour TTC" },
  { id: "yin-yoga", label: "Yin Yoga" },
  { id: "sound-healing", label: "Sound Healing" },
  { id: "kirtan", label: "Kirtan" },
  { id: "mantra-chanting", label: "Mantra Chanting" },
  { id: "meditation", label: "Meditation" },
  { id: "chakras", label: "Chakras" },
  { id: "yoga-anatomy", label: "Yoga Anatomy" },
  { id: "yoga-retreats", label: "Yoga Retreats" },
  { id: "3-day-yoga-meditation", label: "3-Day Yoga Meditation" },
  { id: "5-day-yoga-meditation", label: "5-Day Yoga Meditation" },
  { id: "7-day-yoga-meditation", label: "7-Day Yoga Meditation" },
];

/** Default for questions saved before categories existed. */
export const DEFAULT_QUIZ_CATEGORY: QuizCategoryId = "yoga-basics";

const QUIZ_CATEGORY_SET = new Set<string>(QUIZ_CATEGORY_IDS);

/** Human label → category id. */
const QUIZ_CATEGORY_LABEL_TO_ID: Record<string, QuizCategoryId> =
  Object.fromEntries(
    QUIZ_CATEGORIES.map((category) => [
      category.label.toLowerCase(),
      category.id,
    ]),
  ) as Record<string, QuizCategoryId>;

/**
 * Known category id, or null when the value is missing or not one of the fixed set.
 *
 * @param value - Raw category from the CMS or an attempt
 */
export function parseQuizCategory(value: unknown): QuizCategoryId | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (QUIZ_CATEGORY_SET.has(trimmed)) return trimmed as QuizCategoryId;
  return QUIZ_CATEGORY_LABEL_TO_ID[trimmed.toLowerCase()] ?? null;
}

/**
 * Coerce a stored category to one of the fixed quiz categories.
 *
 * @param value - Raw category from the database or CMS JSON
 */
export function normalizeQuizCategory(value: unknown): QuizCategoryId {
  return parseQuizCategory(value) ?? DEFAULT_QUIZ_CATEGORY;
}

/** Lookup table for category labels. */
export const QUIZ_CATEGORY_LABELS: Record<QuizCategoryId, string> =
  Object.fromEntries(
    QUIZ_CATEGORIES.map((category) => [category.id, category.label]),
  ) as Record<QuizCategoryId, string>;
