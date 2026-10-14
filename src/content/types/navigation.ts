import type { PageType } from "@/content/types/page-ref";

export type NavPageTarget = {
  type: PageType;
  slug: string;
};

export type NavLink = {
  label: string;
} & ({ href: string; external?: boolean } | NavPageTarget);

export type NavItem =
  | {
      type: "link";
      label: string;
      href?: string;
      external?: boolean;
      page?: NavPageTarget;
    }
  | {
      type: "dropdown";
      label: string;
      href?: string;
      external?: boolean;
      page?: NavPageTarget;
      items: NavLink[];
    };
