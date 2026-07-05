import Image from "next/image";
import Link from "next/link";
import { logo_white } from "@/assets";
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
  { href: "/#teachers", label: "Teachers" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#gallery", label: "Gallery" },
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
        src={logo_white}
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
    <p className="type-eyebrow text-[10px] tracking-[0.22em] text-accent mb-5">
      {children}
    </p>
  );
}

function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="space-y-3">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-[13px] text-white/55 hover:text-white transition-colors duration-300 font-sans"
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
    <div className="flex items-center gap-3">
      {SOCIAL.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-white/40 hover:text-white transition-colors duration-300"
        >
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}

function ContactLines() {
  return (
    <address className="not-italic space-y-2 font-sans text-[13px] leading-relaxed">
      <p className="text-white/45">
        Tapovan, Rishikesh
        <br />
        Uttarakhand 249192, India
      </p>
      <a
        href="mailto:hello@nirvanayogaschoolindia.com"
        className="block text-white/55 hover:text-white transition-colors"
      >
        hello@nirvanayogaschoolindia.com
      </a>
      <a
        href="https://wa.me/919876543210"
        className="block text-white/55 hover:text-white transition-colors"
      >
        +91 98765 43210
      </a>
    </address>
  );
}

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <Container size="2xl" className="pt-20 pb-10">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16">
          <div className="border-l-2 border-primary/40 pl-6 lg:pl-8">
            <BrandLogo />
            <p className="mt-6 text-[14px] text-white/55 font-sans leading-[1.7] max-w-sm">
              A residential sanctuary for seekers — where classical Hatha,
              philosophy, and meditation converge on the sacred banks of the
              Ganga.
            </p>
            <p className="mt-5 type-eyebrow text-white/35">{CREDENTIALS}</p>
          </div>
          <div>
            <div className="grid sm:grid-cols-3 gap-10">
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
            <div className="mt-12">
              <SocialIcons />
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] font-sans text-white/30">
            <p>© {new Date().getFullYear()} Nirvana Yoga School India</p>
            <div className="flex gap-5">
              {LEGAL.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="hover:text-white/60 transition-colors"
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
