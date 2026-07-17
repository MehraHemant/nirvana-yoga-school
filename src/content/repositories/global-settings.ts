import type {
  GlobalFooter,
  GlobalHeader,
  SiteConfig,
} from "@/content/types/global-settings";
import { fetchGlobalSettingsFromDb } from "@/lib/cms/cache";
import { requireDb } from "./db-fallback";
import type { ContentResult, RepositoryOptions } from "./fetch";

/**
 * Error when a required global_settings row is missing.
 */
export class GlobalSettingsMissingError extends Error {
  /**
   * @param key - Settings key that was not found
   */
  constructor(key: string) {
    super(`Global settings "${key}" not found in the database.`);
    this.name = "GlobalSettingsMissingError";
  }
}

/**
 * Load a typed global settings value; throws if the row is missing.
 *
 * @param key - Settings key (header, footer, siteConfig, residentialLife, …)
 */
export async function requireGlobalSetting<T>(key: string): Promise<T> {
  const value = await fetchGlobalSettingsFromDb(key);
  if (value == null) {
    throw new GlobalSettingsMissingError(key);
  }
  return value as T;
}

/**
 * Returns the global header from MySQL only (no PRIMARY_NAV / default merge).
 *
 * @param options - Optional repository options
 */
export async function getGlobalHeader(
  options?: RepositoryOptions,
): Promise<ContentResult<GlobalHeader>> {
  return requireDb(() => requireGlobalSetting<GlobalHeader>("header"), options);
}

/**
 * Returns the global footer from MySQL only.
 *
 * @param options - Optional repository options
 */
export async function getGlobalFooter(
  options?: RepositoryOptions,
): Promise<ContentResult<GlobalFooter>> {
  return requireDb(() => requireGlobalSetting<GlobalFooter>("footer"), options);
}

/**
 * Returns site config from MySQL only.
 *
 * @param options - Optional repository options
 */
export async function getSiteConfig(
  options?: RepositoryOptions,
): Promise<ContentResult<SiteConfig>> {
  return requireDb(
    () => requireGlobalSetting<SiteConfig>("siteConfig"),
    options,
  );
}
