import "server-only";
import { normalizeQuizSettings, type QuizSettings } from "@/content/types/quiz";
import { fetchGlobalSettingsFromDb } from "@/lib/cms/cache";
import { isDbEnabled } from "@/lib/db";

/** `global_settings` key holding the quiz configuration. */
export const QUIZ_SETTINGS_KEY = "quiz";

/**
 * Quiz settings from the CMS, with defaults for anything not saved yet.
 */
export async function getQuizSettings(): Promise<QuizSettings> {
  if (!isDbEnabled()) return normalizeQuizSettings(null);
  const value = await fetchGlobalSettingsFromDb(QUIZ_SETTINGS_KEY).catch(
    () => null,
  );
  return normalizeQuizSettings(value);
}
