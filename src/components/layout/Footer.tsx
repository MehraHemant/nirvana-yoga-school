import Image from "next/image";
import Link from "next/link";
import { logo_white } from "@/assets";
import { Container } from "@/components/ui";
import { Facebook, Instagram, YouTube } from "@/icons";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    Icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    Icon: YouTube,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    Icon: Facebook,
  },
] as const;

const COURSE_LINKS = [
  { href: "#", label: "200hr Yoga Teacher Training" },
  { href: "#", label: "300hr Advanced YTT" },
  { href: "#", label: "500hr Master's YTT" },
  { href: "#", label: "Kundalini YTT" },
  { href: "#", label: "Online Courses" },
  { href: "#", label: "Retreats" },
];

const SCHOOL_LINKS = [
  { href: "#", label: "About Us" },
  { href: "#teachers", label: "Teachers" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: "#", label: "Become an Affiliate" },
  { href: "#contact", label: "Contact Us" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white pt-20 pb-8">
      <Container size="xl">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Nirvana Yoga School home">
              <Image
                src={logo_white}
                alt="Nirvana Yoga School"
                width={180}
                height={72}
                className="h-14 w-auto"
              />
            </Link>
            <p className="type-lead mt-6 text-white/70 max-w-md">
              An authentic, Yoga Alliance certified school on the banks of the
              Ganga in Rishikesh. Teaching yoga as a way of life since 2012.
            </p>

            <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
              <label htmlFor="newsletter" className="sr-only">
                Your email
              </label>
              <input
                id="newsletter"
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-accent text-ink font-semibold hover:bg-accent/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-white/40">
              Monthly notes on practice, courses & retreats. No spam.
            </p>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-accent font-semibold mb-5">
                Courses
              </h3>
              <ul className="space-y-3">
                {COURSE_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/70 hover:text-white text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-accent font-semibold mb-5">
                School
              </h3>
              <ul className="space-y-3">
                {SCHOOL_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/70 hover:text-white text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-accent font-semibold mb-5">
                Visit Us
              </h3>
              <address className="not-italic text-white/70 text-sm leading-relaxed space-y-2">
                <p>Tapovan, Rishikesh</p>
                <p>Uttarakhand 249192, India</p>
                <p className="pt-2">
                  <a
                    href="mailto:hello@nirvanayogaschoolindia.com"
                    className="hover:text-white"
                  >
                    hello@nirvanayogaschoolindia.com
                  </a>
                </p>
                <p>
                  <a
                    href="https://wa.me/919876543210"
                    className="hover:text-white"
                  >
                    +91 98765 43210
                  </a>
                </p>
              </address>

              <div className="mt-6 flex gap-3">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent hover:text-ink flex items-center justify-center transition-colors"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} Nirvana Yoga School. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
            <Link href="#" className="hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
