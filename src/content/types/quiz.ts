/** Quiz content types shared by the CMS editor, API, and public quiz. */

/** How a question's answers are shown. */
export type QuizOptionType = "text" | "image";

/** One answer choice. `imageUrl` is used when the question's options are images. */
export type QuizOption = {
  /** Answer text, or the caption / alt text for an image answer. */
  label: string;
  /** Image for image answers; empty for text answers. */
  imageUrl: string;
};

/** Full question as stored and edited in the CMS. */
export type QuizQuestion = {
  id: string;
  prompt: string;
  /** Optional image above the question, e.g. a pose photo to name. */
  promptImageUrl: string;
  optionType: QuizOptionType;
  options: QuizOption[];
  /** Zero-based index of the right option. */
  correctIndex: number;
  /** Optional note shown in the answer review. */
  explanation: string;
  /** Inactive questions stay in the CMS but are never served. */
  active: boolean;
};

/** Question as sent to the browser — no correct answer or explanation. */
export type PublicQuizQuestion = Pick<
  QuizQuestion,
  "id" | "prompt" | "promptImageUrl" | "optionType" | "options"
>;

/** Quiz configuration stored in `global_settings.quiz`. */
export type QuizSettings = {
  /** When false the floating button and quiz page are hidden. */
  live: boolean;
  /** Finished attempts allowed per account per calendar month (Asia/Kolkata). */
  monthlyLimit: number;
  /** Points for each correct answer. */
  pointsPerCorrect: number;
  /** Questions per attempt; 0 serves every active question. */
  questionsPerAttempt: number;
  /** Random question order for each attempt. */
  shuffleQuestions: boolean;
  /** Show right answers and explanations after finishing. */
  showAnswerReview: boolean;
  /** Rough time shown on the intro, in minutes. */
  estimatedMinutes: number;
  launcherLabel: string;
  launcherTagline: string;
  introEyebrow: string;
  introTitle: string;
  /** Highlighted end of the intro title, in the brand colour. */
  introHighlight: string;
  introBody: string;
  giftEyebrow: string;
  /** `{name}` is replaced with the visitor's first name. */
  giftTitle: string;
  giftBody: string;
  giftCtaLabel: string;
  giftCtaHref: string;
};

/** One graded answer returned after an attempt. */
export type QuizReviewItem = {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  status: "correct" | "incorrect" | "skipped";
  explanation: string;
};

/** Server response after an attempt is submitted. */
export type QuizAttemptResult = {
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  skipped: number;
  totalTimeMs: number;
  remaining: number;
  nextAvailableAt: string | null;
  review: QuizReviewItem[];
};

/** Bounds enforced on numeric settings. */
export const QUIZ_LIMITS = {
  monthlyLimit: { min: 1, max: 10 },
  pointsPerCorrect: { min: 1, max: 100 },
  questionsPerAttempt: { min: 0, max: 100 },
  estimatedMinutes: { min: 1, max: 60 },
  options: { min: 2, max: 6 },
} as const;

/**
 * Starting settings for a new quiz.
 */
export function createDefaultQuizSettings(): QuizSettings {
  return {
    live: true,
    monthlyLimit: 2,
    pointsPerCorrect: 10,
    questionsPerAttempt: 0,
    shuffleQuestions: false,
    showAnswerReview: true,
    estimatedMinutes: 3,
    launcherLabel: "Yoga quiz",
    launcherTagline: "Test yourself",
    introEyebrow: "Yoga quiz",
    introTitle: "How well do you know",
    introHighlight: "yoga & Rishikesh?",
    introBody:
      "One question at a time. Choose an answer, or skip if you are unsure. Your score and a note from the school wait at the end.",
    giftEyebrow: "From the school",
    giftTitle: "{name}, a gift is waiting for you at Nirvana Yoga School",
    giftBody:
      "Visit the ashram in Tapovan, Rishikesh, and collect it in person.",
    giftCtaLabel: "Plan your visit",
    giftCtaHref: "/booking",
  };
}

/**
 * Whole number clamped to a range, or the fallback when not numeric.
 *
 * @param value - Raw value
 * @param range - Inclusive bounds
 * @param fallback - Used when the value is not a finite number
 */
function clampInt(
  value: unknown,
  range: { min: number; max: number },
  fallback: number,
): number {
  const number = typeof value === "string" ? Number(value) : value;
  if (typeof number !== "number" || !Number.isFinite(number)) return fallback;
  return Math.min(range.max, Math.max(range.min, Math.round(number)));
}

/**
 * Trimmed string, or the fallback when not a string.
 *
 * @param value - Raw value
 * @param fallback - Used when the value is not a string
 */
function text(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.trim() : fallback;
}

/**
 * Fills missing settings with defaults and clamps numbers.
 *
 * @param raw - Stored or submitted settings
 */
export function normalizeQuizSettings(raw: unknown): QuizSettings {
  const defaults = createDefaultQuizSettings();
  const input =
    raw && typeof raw === "object" ? (raw as Partial<QuizSettings>) : {};
  return {
    live: input.live !== false,
    monthlyLimit: clampInt(
      input.monthlyLimit,
      QUIZ_LIMITS.monthlyLimit,
      defaults.monthlyLimit,
    ),
    pointsPerCorrect: clampInt(
      input.pointsPerCorrect,
      QUIZ_LIMITS.pointsPerCorrect,
      defaults.pointsPerCorrect,
    ),
    questionsPerAttempt: clampInt(
      input.questionsPerAttempt,
      QUIZ_LIMITS.questionsPerAttempt,
      defaults.questionsPerAttempt,
    ),
    shuffleQuestions: input.shuffleQuestions === true,
    showAnswerReview: input.showAnswerReview !== false,
    estimatedMinutes: clampInt(
      input.estimatedMinutes,
      QUIZ_LIMITS.estimatedMinutes,
      defaults.estimatedMinutes,
    ),
    launcherLabel: text(input.launcherLabel, defaults.launcherLabel),
    launcherTagline: text(input.launcherTagline, defaults.launcherTagline),
    introEyebrow: text(input.introEyebrow, defaults.introEyebrow),
    introTitle: text(input.introTitle, defaults.introTitle),
    introHighlight: text(input.introHighlight, defaults.introHighlight),
    introBody: text(input.introBody, defaults.introBody),
    giftEyebrow: text(input.giftEyebrow, defaults.giftEyebrow),
    giftTitle: text(input.giftTitle, defaults.giftTitle),
    giftBody: text(input.giftBody, defaults.giftBody),
    giftCtaLabel: text(input.giftCtaLabel, defaults.giftCtaLabel),
    giftCtaHref: text(input.giftCtaHref, defaults.giftCtaHref),
  };
}

/**
 * Checks one question and returns it cleaned, or the first problem found.
 *
 * @param raw - Submitted question
 * @param position - 1-based position for error messages
 */
export function validateQuizQuestion(
  raw: unknown,
  position: number,
): { ok: true; question: QuizQuestion } | { ok: false; error: string } {
  const input =
    raw && typeof raw === "object" ? (raw as Partial<QuizQuestion>) : {};
  const label = `Question ${position}`;
  const optionType: QuizOptionType =
    input.optionType === "image" ? "image" : "text";
  const prompt = text(input.prompt, "");
  if (!prompt) return { ok: false, error: `${label}: add the question text.` };

  const options = (Array.isArray(input.options) ? input.options : []).map(
    (option) => ({
      label: text(option?.label, ""),
      imageUrl: optionType === "image" ? text(option?.imageUrl, "") : "",
    }),
  );
  if (
    options.length < QUIZ_LIMITS.options.min ||
    options.length > QUIZ_LIMITS.options.max
  ) {
    return {
      ok: false,
      error: `${label}: use ${QUIZ_LIMITS.options.min}–${QUIZ_LIMITS.options.max} answers.`,
    };
  }
  for (const [index, option] of options.entries()) {
    const letter = String.fromCharCode(65 + index);
    if (optionType === "image" && !option.imageUrl) {
      return { ok: false, error: `${label}: answer ${letter} needs an image.` };
    }
    if (optionType === "text" && !option.label) {
      return { ok: false, error: `${label}: answer ${letter} needs text.` };
    }
  }

  const correctIndex = Number(input.correctIndex);
  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    return { ok: false, error: `${label}: choose the correct answer.` };
  }

  return {
    ok: true,
    question: {
      id: text(input.id, ""),
      prompt,
      promptImageUrl: text(input.promptImageUrl, ""),
      optionType,
      options,
      correctIndex,
      explanation: text(input.explanation, ""),
      active: input.active !== false,
    },
  };
}

/**
 * Gift heading with `{name}` filled, or dropped cleanly when there is no name.
 *
 * @param template - Heading from settings
 * @param firstName - Visitor's first name, when signed in
 */
export function fillQuizName(template: string, firstName?: string | null) {
  if (firstName) return template.replace(/\{name\}/g, firstName);
  const stripped = template.replace(/\{name\}\s*,?\s*/g, "").trim();
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}
