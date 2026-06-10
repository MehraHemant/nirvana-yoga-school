import Image from "next/image";
import Link from "next/link";
import { logo_white } from "@/assets";
import { Container } from "@/components/ui";
import { Facebook, Instagram, YouTube } from "@/icons";

const SITE = "https://www.nirvanayogaschoolindia.com";

const SOCIAL_LINKS = [
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
] as const;

const COURSE_LINKS = [
  {
    href: `${SITE}/200-hour-yoga-teacher-training-in-rishikesh-india`,
    label: "200hr Yoga Teacher Training",
  },
  {
    href: `${SITE}/300-hour-yoga-teacher-training-in-rishikesh-india`,
    label: "300hr Advanced YTT",
  },
  {
    href: `${SITE}/500-hour-yoga-teacher-training-in-rishikesh-india`,
    label: "500hr Master's YTT",
  },
  {
    href: `${SITE}/200-hour-kundalini-yoga-teacher-training-in-rishikesh-india`,
    label: "Kundalini YTT",
  },
  {
    href: `${SITE}/online-yoga-teacher-training-courses`,
    label: "Online Courses",
  },
  {
    href: `${SITE}/3-day-yoga-retreat-in-rishikesh-india`,
    label: "Retreats",
  },
];

const SCHOOL_LINKS = [
  { href: "#about", label: "About Us" },
  { href: "#teachers", label: "Teachers" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: `${SITE}/blog`, label: "Blog" },
  { href: "#contact", label: "Contact Us" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-10 pb-5 relative overflow-hidden border-t border-white/10">
      {/* Background Soft Glow / Radial highlights */}
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 -left-40 w-[300px] h-[300px] bg-accent/8 blur-[100px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="relative z-10">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Brand + newsletter */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div>
              <Link
                href="/"
                aria-label="Nirvana Yoga School home"
                className="inline-block group"
              >
                <Image
                  src={logo_white}
                  alt="Nirvana Yoga School"
                  width={160}
                  height={64}
                  className="h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </Link>
              <p className="font-serif italic text-accent font-light text-[11px] mt-1 tracking-wide">
                Lineage, Tradition, and Tapasya since 2012
              </p>
              <p className="mt-2 text-white/80 max-w-sm leading-relaxed text-sm/snug">
                An authentic, Yoga Alliance certified school on the banks of the
                Ganga in Rishikesh. Providing traditional education, ayurvedic
                nutrition, and modern alignment tools.
              </p>
            </div>

            {/* <div className="mt-1">
              <h4 className="font-serif text-xs text-white font-medium mb-1">
                Subscribe to the Nirvana Journal
              </h4>
              <p className="text-[10px] text-white/60 leading-relaxed max-w-sm mb-2 font-sans">
                Monthly notes on classical practice, seasonal retreats, and
                wisdom from Rishikesh. No spam.
              </p>
              <form className="flex flex-col sm:flex-row gap-2 max-w-md">
                <label htmlFor="newsletter" className="sr-only">
                  Your email
                </label>
                <input
                  id="newsletter"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white placeholder-white/45 focus:outline-none focus:border-white hover:border-white/30 transition-all duration-300 font-sans text-[11px]"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-sand text-secondary font-semibold transition-all duration-300 font-sans text-[11px] shadow-md shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div> */}
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-6">
            <div>
              <h3 className="type-eyebrow text-[9px] tracking-widest text-accent font-bold mb-2.5">
                Courses
              </h3>
              <ul className="space-y-1.5">
                {COURSE_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        l.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-white/75 hover:text-accent text-xs font-medium transition-colors duration-300 font-sans"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="type-eyebrow text-[9px] tracking-widest text-accent font-bold mb-2.5">
                School
              </h3>
              <ul className="space-y-1.5">
                {SCHOOL_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        l.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-white/75 hover:text-accent text-xs font-medium transition-colors duration-300 font-sans"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="type-eyebrow text-[9px] tracking-widest text-accent font-bold mb-2.5">
                Visit Us
              </h3>
              <address className="not-italic text-white/75 text-xs leading-relaxed space-y-1.5 font-sans">
                <p className="font-semibold text-white/90">Course Campus</p>
                <p className="text-white/70 -mt-1">
                  Tapovan, Rishikesh, Uttarakhand 249192, India
                </p>
                <div className="pt-1.5 space-y-1">
                  <p className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] text-accent font-bold uppercase tracking-wider">
                      Email:
                    </span>
                    <a
                      href="mailto:hello@nirvanayogaschoolindia.com"
                      className="text-white/90 hover:text-accent transition-colors duration-300"
                    >
                      hello@nirvanayogaschoolindia.com
                    </a>
                  </p>
                  <p className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] text-accent font-bold uppercase tracking-wider">
                      Phone:
                    </span>
                    <a
                      href="https://wa.me/919876543210"
                      className="text-white/90 hover:text-accent transition-colors duration-300"
                    >
                      +91 98765 43210
                    </a>
                  </p>
                </div>
              </address>

              <div className="mt-4 flex gap-2.5">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7.5 h-7.5 rounded-full bg-white/10 border border-white/10 hover:border-white hover:bg-white hover:text-secondary flex items-center justify-center transition-all duration-300 text-white/80"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[10px] text-white/45 font-sans">
          <p>
            © {new Date().getFullYear()} Nirvana Yoga School India. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
