export type ContentSource = "json";

export type ContentResult<T> = {
  data: T;
  source: ContentSource;
};

export type RepositoryOptions = {
  /** Reserved for future API/DB sources. Currently file-only. */
  source?: ContentSource;
};

/** File-based content only. DB/API hooks removed — extend here when adding remote fetch. */
export function fromJson<T>(data: T): ContentResult<T> {
  return { data, source: "json" };
}
