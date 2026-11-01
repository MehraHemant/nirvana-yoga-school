import type { QuizSettings } from "@/content/types/quiz";
import type { QuizCategoryFilter } from "@/content/types/quiz-categories";

/**
 * Questions in one category, or the full list when the filter is `all`.
 *
 * @param questions - Questions that carry a category
 * @param category - Selected category, or `all`
 */
export function filterQuizQuestions<T extends { category: string }>(
  questions: T[],
  category: QuizCategoryFilter,
): T[] {
  if (category === "all") return questions;
  return questions.filter((question) => question.category === category);
}

/**
 * Number of questions one attempt contains.
 *
 * @param settings - Quiz settings
 * @param available - Active questions in the chosen pool
 */
export function questionsPerAttempt(
  settings: QuizSettings,
  available: number,
): number {
  return settings.questionsPerAttempt > 0
    ? Math.min(settings.questionsPerAttempt, available)
    : available;
}

/**
 * Picks the questions for a new attempt: a random subset when the CMS caps the
 * count, shuffled when the CMS asks for it.
 *
 * @param questions - Active questions in CMS order
 * @param settings - Quiz settings
 */
export function pickQuestionsForAttempt<T extends { id: string }>(
  questions: T[],
  settings: QuizSettings,
): T[] {
  const count = questionsPerAttempt(settings, questions.length);
  const pool = [...questions];
  if (settings.shuffleQuestions || count < questions.length) {
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[swap]] = [pool[swap], pool[index]];
    }
  }
  const picked = pool.slice(0, count);
  if (settings.shuffleQuestions) return picked;
  const order = new Map(
    questions.map((question, index) => [question.id, index]),
  );
  return picked.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
