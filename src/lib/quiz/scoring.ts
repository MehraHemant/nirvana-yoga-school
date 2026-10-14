export type AnswerStatus = "correct" | "incorrect" | "skipped";

/**
 * Derives answer status from the selected option index.
 *
 * @param correctIndex - Zero-based index of the correct option
 * @param selectedIndex - Selected option index, or null when skipped
 */
export function getAnswerStatus(
  correctIndex: number,
  selectedIndex: number | null,
): AnswerStatus {
  if (selectedIndex === null) {
    return "skipped";
  }
  if (selectedIndex === correctIndex) {
    return "correct";
  }
  return "incorrect";
}

/**
 * Score as a whole percentage of the attempt's maximum.
 *
 * @param score - Points earned
 * @param maxScore - Points for a perfect attempt
 */
export function scorePercent(score: number, maxScore: number): number {
  return maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;
}
