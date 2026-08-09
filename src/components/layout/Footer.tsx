import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { Container } from "@/components/ui";
import { Facebook, Instagram, WhatsApp, YouTube } from "@/icons";

interface FooterData {
  brand: { logo: string; tagline: string; credentials: string };
  social: Array<{
    label: string;
    href: string;
    icon: "instagram" | "youtube" | "facebook" | "whatsapp";
  }>;
  columns: Array<{
    heading: string;
    links: Array<{ label: string; href: string; external?: boolean }>;
  }>;
  contact: { address: string; email: string; phone: string };
  legal: Array<{ label: string; href: string }>;
}

const ICON_MAP: Record<
  "instagram" | "youtube" | "facebook" | "whatsapp",
  ComponentType<{ size?: number }>
> = {
  instagram: Instagram,
  youtube: YouTube,
  facebook: Facebook,
  whatsapp: WhatsApp,
};

/**
 * Whether a footer link should open in a new tab.
 *
 * @param href - Link destination
 * @param external - Explicit external flag from CMS
 */
function isExternalLink(href: string, external?: boolean): boolean {
  if (typeof external === "boolean") return external;
  return /^https?:\/\//i.test(href);
}

/**
 * Builds a WhatsApp chat URL from a phone string when digits are present.
 *
 * @param phone - Display phone number from CMS
 */
function whatsappHrefFromPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

/**
 * Compact column heading for dense footer grids.
 *
 * @param props - Heading text
 */
function ColHeading({ children }: { children: string }) {
  return (
    <p className="type-eyebrow mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}

/**
 * Renders a CMS footer link list.
 *
 * @param props - Link rows for one column
 */
function NavLinks({
  links,
}: {
  links: Array<{ href: string; label: string; external?: boolean }>;
}) {
  return (
    <ul className="space-y-0">
      {links.map((l) => {
        const external = isExternalLink(l.href, l.external);
        return (
          <li key={`${l.label}-${l.href}`}>
            <Link
              href={l.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="footer-nav-link font-sans text-[12.5px] leading-snug text-ink/80"
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Contact block from CMS address / email / phone fields.
 *
 * @param props - Footer contact fields and optional WhatsApp social URL
 */
function ContactLines({
  contact,
  whatsappHref,
}: {
  contact: FooterData["contact"];
  whatsappHref: string | null;
}) {
  const phoneHref =
    whatsappHref ?? whatsappHrefFromPhone(contact.phone) ?? undefined;

  return (
    <address className="space-y-1.5 font-sans text-[12.5px] leading-snug not-italic text-ink/75">
      {contact.address ? (
        <p className="max-w-[16rem] whitespace-pre-line">{contact.address}</p>
      ) : null}
      {contact.email ? (
        <a
          href={`mailto:${contact.email}`}
          className="footer-nav-link block text-ink/80"
        >
          {contact.email}
        </a>
      ) : null}
      {contact.phone && phoneHref ? (
        <a
          href={phoneHref}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-nav-link block text-ink/80"
        >
          {contact.phone}
        </a>
      ) : contact.phone ? (
        <p>{contact.phone}</p>
      ) : null}
    </address>
  );
}

/**
 * Brand logo linking home.
 *
 * @param props - Logo image path from CMS
 */
function BrandLogo({ logo }: { logo: string }) {
  return (
    <Link
      href="/"
      aria-label="Nirvana Yoga School home"
      className="inline-block transition-opacity duration-300 hover:opacity-85"
    >
      <Image
        src={logo}
        alt="Nirvana Yoga School"
        width={112}
        height={45}
        className="h-auto object-contain"
        style={{ maxWidth: 112 }}
      />
    </Link>
  );
}

/**
 * Compact social icon row from CMS.
 *
 * @param props - Social link rows
 */
function SocialIcons({ social }: { social: FooterData["social"] }) {
  if (social.length === 0) return null;

  return (
    <div className="mt-3.5 flex items-center gap-1.5">
      {social.map(({ label, href, icon }) => {
        const Icon = ICON_MAP[icon];
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex size-7 items-center justify-center rounded-full border border-ink/10 text-ink/70 transition-colors duration-200 hover:border-primary/30 hover:text-primary"
          >
            <Icon size={14} />
          </a>
        );
      })}
    </div>
  );
}

type FooterProps = {
  /** Server-loaded footer settings from the site layout */
  initialData?: FooterData | null;
};

/**
 * Compact site footer: brand, link columns, contact, social, and legal.
 *
 * @param props - Server-provided footer settings (no client API fetch)
 */
export default function Footer({ initialData = null }: FooterProps) {
  const footerData = initialData;
  if (!footerData) return null;

  const hasContact = Boolean(
    footerData.contact.address ||
      footerData.contact.email ||
      footerData.contact.phone,
  );
  const whatsappHref =
    footerData.social.find((s) => s.icon === "whatsapp")?.href ?? null;

  const linkColumns = footerData.columns.filter((col) => {
    if (!col.links.some((l) => l.label)) return false;
    // Contact details render from `contact`; skip legacy Contact link columns.
    if (hasContact && col.heading.toLowerCase() === "contact") return false;
    return true;
  });

  /** Brand + link columns + optional contact column */
  const desktopCols = 1 + linkColumns.length + (hasContact ? 1 : 0);
  const desktopGridClass =
    desktopCols >= 5
      ? "lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.9fr))]"
      : desktopCols === 4
        ? "lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(0,1fr))]"
        : desktopCols === 3
          ? "lg:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,1fr))]"
          : "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]";

  return (
    <footer className="relative border-t border-secondary/10 bg-surface text-ink">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative pt-8 pb-5 md:pt-9 md:pb-6">
        <div
          className={`grid gap-x-6 gap-y-7 sm:grid-cols-2 ${desktopGridClass}`}
        >
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo logo={footerData.brand.logo} />
            {footerData.brand.credentials ? (
              <p className="type-eyebrow mt-2.5 text-[9px] tracking-[0.14em] text-muted">
                {footerData.brand.credentials}
              </p>
            ) : null}
            {footerData.brand.tagline ? (
              <p className="mt-2.5 max-w-xs font-sans text-[12.5px] leading-snug text-ink/65 line-clamp-2">
                {footerData.brand.tagline}
              </p>
            ) : null}
            <SocialIcons social={footerData.social} />
          </div>

          {linkColumns.map((col) => (
            <div key={col.heading}>
              <ColHeading>{col.heading}</ColHeading>
              <NavLinks links={col.links} />
            </div>
          ))}

          {hasContact ? (
            <div>
              <ColHeading>Contact</ColHeading>
              <ContactLines
                contact={footerData.contact}
                whatsappHref={whatsappHref}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-7 border-t border-ink/8 pt-3.5 md:mt-8">
          <div className="flex flex-col gap-2 font-sans text-[11px] tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Nirvana Yoga School India</p>
            {footerData.legal.length > 0 ? (
              <nav
                aria-label="Legal"
                className="flex flex-wrap gap-x-4 gap-y-1"
              >
                {footerData.legal.map((l) => {
                  const external = isExternalLink(l.href);
                  return (
                    <Link
                      key={`${l.label}-${l.href}`}
                      href={l.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="footer-nav-link text-muted hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>
        </div>
      </Container>
    </footer>
  );
}
