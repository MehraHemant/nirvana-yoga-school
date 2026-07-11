import Image from "next/image";
import Link from "next/link";
import { logo } from "@/assets";
import { Container } from "@/components/ui";
import { pagePath } from "@/content/pages/path";
import type { PageRef } from "@/content/types/page-ref";
import { Facebook, Instagram, WhatsApp, YouTube } from "@/icons";

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/nirvanayogaschool",
    Icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@nirvanayogaschool",
    Icon: YouTube,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/nirvanayogaschool",
    Icon: Facebook,
  },
  { label: "WhatsApp", href: "https://wa.me/919876543210", Icon: WhatsApp },
] as const;

const PROGRAMS = [
  {
    page: {
      type: "course",
      slug: "200-hour-yoga-teacher-training-in-rishikesh-india",
    },
    label: "200-Hour YTT",
  },
  {
    page: {
      type: "course",
      slug: "300-hour-yoga-teacher-training-in-rishikesh-india",
    },
    label: "300-Hour YTT",
  },
  {
    page: {
      type: "course",
      slug: "500-hour-yoga-teacher-training-in-rishikesh-india",
    },
    label: "500-Hour YTT",
  },
  {
    page: {
      type: "course",
      slug: "200-hour-kundalini-yoga-teacher-training-in-rishikesh-india",
    },
    label: "Kundalini YTT",
  },
  {
    page: { type: "site", slug: "online-yoga-teacher-training-courses" },
    label: "Online Courses",
  },
  {
    page: { type: "retreat", slug: "3-day-yoga-retreat-in-rishikesh-india" },
    label: "Retreats",
  },
].map((item) => ({
  href: pagePath(item.page as PageRef),
  label: item.label,
}));

const SCHOOL = [
  { href: "/#about", label: "About" },
  { href: "/teacher", label: "Teachers" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/venue/course-venue", label: "Course Venue" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Journal" },
  { href: "/#faq", label: "FAQ" },
];

const LEGAL = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Sitemap" },
];

const CREDENTIALS = "Yoga Alliance RYS · Est. 2012 · Tapovan, Rishikesh";

function BrandLogo() {
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

function ColHeading({ children }: { children: string }) {
  return (
    <p className="type-eyebrow mb-5 text-[10px] font-semibold tracking-[0.22em] text-primary">
      {children}
    </p>
  );
}

function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="space-y-1">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="footer-nav-link font-sans text-[13px] text-muted"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SocialIcons() {
  return (
    <div className="flex items-center gap-2.5">
      {SOCIAL.map(({ label, href, Icon }) => (
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
      ))}
    </div>
  );
}

function ContactLines() {
  return (
    <address className="space-y-2 font-sans text-[13px] leading-relaxed not-italic">
      <p className="text-muted">
        Tapovan, Rishikesh
        <br />
        Uttarakhand 249192, India
      </p>
      <a
        href="mailto:hello@nirvanayogaschoolindia.com"
        className="footer-nav-link block text-muted"
      >
        hello@nirvanayogaschoolindia.com
      </a>
      <a
        href="https://wa.me/919876543210"
        className="footer-nav-link block text-muted"
      >
        +91 98765 43210
      </a>
    </address>
  );
}

/**
 * Site-wide footer with programs, school links, contact details, and social icons.
 */
export default function Footer() {
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
      <Container size="xl" className="relative pt-16 pb-8 md:pt-20 md:pb-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="border-l-2 border-primary/25 pl-6 lg:pl-8">
            <BrandLogo />
            <p className="mt-6 max-w-sm font-sans text-[14px] leading-[1.7] text-muted">
              A residential sanctuary for seekers — where classical Hatha,
              philosophy, and meditation converge on the sacred banks of the
              Ganga.
            </p>
            <p className="type-eyebrow mt-5 text-muted/70">{CREDENTIALS}</p>
          </div>
          <div>
            <div className="grid gap-10 sm:grid-cols-3">
              <div>
                <ColHeading>Programs</ColHeading>
                <NavLinks links={PROGRAMS} />
              </div>
              <div>
                <ColHeading>School</ColHeading>
                <NavLinks links={SCHOOL} />
              </div>
              <div>
                <ColHeading>Contact</ColHeading>
                <ContactLines />
              </div>
            </div>
            <div className="mt-10">
              <SocialIcons />
            </div>
          </div>
        </div>
        <div className="mt-14 border-t border-ink/8 pt-7 md:mt-16 md:pt-8">
          <div className="flex flex-col gap-3 font-sans text-[11px] text-muted/80 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Nirvana Yoga School India</p>
            <div className="flex gap-5">
              {LEGAL.map((l) => (
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
