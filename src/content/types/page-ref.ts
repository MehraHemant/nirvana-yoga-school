/** URL segment + data-loader classification for every routable page. */
export type PageType = "course" | "online" | "retreat" | "venue" | "site";

export type PageRef = {
  type: PageType;
  slug: string;
};
