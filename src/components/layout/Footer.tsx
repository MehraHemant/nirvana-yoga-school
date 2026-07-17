"use client";

import Image from "next/image";
import Link from "next/link";
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
  React.ComponentType<{ size?: number }>
> = {
  instagram: Instagram,
  youtube: YouTube,
  facebook: Facebook,
  whatsapp: WhatsApp,
};

function ColHeading({ children }: { children: string }) {
  return (
    <p className="type-eyebrow mb-5 text-[10px] font-semibold tracking-[0.22em] text-primary">
      {children}
    </p>
  );
}

function NavLinks({
  links,
}: {
  links: Array<{ href: string; label: string; external?: boolean }>;
}) {
  return (
    <ul className="space-y-1">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            href={l.href}
            target={
              l.external || l.href.startsWith("http") ? "_blank" : undefined
            }
            rel={
              l.external || l.href.startsWith("http")
                ? "noopener noreferrer"
                : undefined
            }
            className="footer-nav-link font-sans text-[13px] text-muted"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function _ContactLines({ contact }: { contact: FooterData["contact"] }) {
  return (
    <address className="space-y-2 font-sans text-[13px] leading-relaxed not-italic">
      <p className="text-muted">{contact.address.replace(/\n/g, "<br />")}</p>
      <a
        href={`mailto:${contact.email}`}
        className="footer-nav-link block text-muted"
      >
        {contact.email}
      </a>
      <a
        href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
        className="footer-nav-link block text-muted"
      >
        {contact.phone}
      </a>
    </address>
  );
}

function BrandLogo({ logo }: { logo: string }) {
  return (
    <Link
      href="/"
      aria-label="Nirvana Yoga School home"
      className="inline-block"
    >
      <Image
        src={logo}
        alt="Nirvana Yoga School"
        width={144}
        height={58}
        className="h-auto object-contain"
        style={{ maxWidth: 144 }}
      />
    </Link>
  );
}

type FooterProps = {
  /** Server-loaded footer settings from the site layout */
  initialData?: FooterData | null;
};

/**
 * Site footer with brand, link columns, and social icons.
 *
 * @param props - Server-provided footer settings (no client API fetch)
 */
export default function Footer({ initialData = null }: FooterProps) {
  const footerData = initialData;
  if (!footerData) return null;

  return (
    <footer className="relative overflow-hidden border-t border-secondary/12 bg-linear-to-b from-surface-muted via-surface to-sand text-ink">
      <div
        className="pointer-events-none absolute -top-24 left-[-8%] h-72 w-72 rounded-full bg-secondary/10 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[-6%] bottom-0 h-56 w-56 rounded-full bg-primary/8 blur-[90px]"
        aria-hidden="true"
      />
      <Container size="2xl" className="relative pt-16 pb-8 md:pt-20 md:pb-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="border-l-2 border-primary/25 pl-6 lg:pl-8">
            <BrandLogo logo={footerData.brand.logo} />
            <p className="mt-6 max-w-sm font-sans text-[14px] leading-[1.7] text-muted">
              {footerData.brand.tagline}
            </p>
            <p className="type-eyebrow mt-5 text-muted/70">
              {footerData.brand.credentials}
            </p>
          </div>
          <div>
            <div className="grid gap-10 sm:grid-cols-3">
              {footerData.columns.map((col) => (
                <div key={col.heading}>
                  <ColHeading>{col.heading}</ColHeading>
                  <NavLinks links={col.links} />
                </div>
              ))}
            </div>
            <div className="mt-10">
              <SocialIcons social={footerData.social} />
            </div>
          </div>
        </div>
        <div className="mt-14 border-t border-ink/8 pt-7 md:mt-16 md:pt-8">
          <div className="flex flex-col gap-3 font-sans text-[11px] text-muted/80 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Nirvana Yoga School India</p>
            <div className="flex gap-5">
              {footerData.legal.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="footer-nav-link text-muted/70"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
function SocialIcons({ social }: { social: FooterData["social"] }) {
  return (
    <div className="flex items-center gap-2.5">
      {social.map(({ label, href, icon }) => {
        const Icon = ICON_MAP[icon];
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex size-9 items-center justify-center rounded-full border border-ink/8 bg-white text-muted shadow-xs transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            <Icon size={16} />
          </a>
        );
      })}
    </div>
  );
}
