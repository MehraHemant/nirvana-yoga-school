/**
 * Client-safe admin section navigation helpers (no DB imports).
 */

/**
 * Section list URL for the “back” link after editing a page.
 *
 * @param type - Page type
 * @param slug - Page slug (used for home / teacher / contact / enquire)
 * @returns Sidebar section path
 */
export function adminSectionListHref(type: string, slug?: string): string {
  switch (type) {
    case "course":
      return "/admin/sections/courses";
    case "online":
      return "/admin/sections/online";
    case "retreat":
      return "/admin/sections/retreats";
    case "venue":
      return "/admin/sections/venues";
    case "site":
      if (slug === "home") return "/admin/sections/home";
      if (slug === "teacher") return "/admin/sections/teachers";
      if (slug === "contact") return "/admin/sections/contact";
      if (slug === "enquire-now") return "/admin/sections/enquire";
      return "/admin/sections/other";
    default:
      return "/admin";
  }
}

/**
 * Human label for the section back link.
 *
 * @param type - Page type
 * @param slug - Page slug
 * @returns Short back-link label
 */
export function adminSectionListLabel(type: string, slug?: string): string {
  switch (type) {
    case "course":
      return "Courses";
    case "online":
      return "Online courses";
    case "retreat":
      return "Retreats";
    case "venue":
      return "Venues";
    case "site":
      if (slug === "home") return "Home";
      if (slug === "teacher") return "Teachers";
      if (slug === "contact") return "Contact";
      if (slug === "enquire-now") return "Enquire";
      return "Other pages";
    default:
      return "Dashboard";
  }
}
