import { Button, Container } from "@/components/ui";
import { ArrowRight, HeroFlourish, HeroUnderline } from "@/icons";
import HeroBackgroundVideo from "./HeroBackgroundVideo";

const MARQUEE_ITEMS = [
  "5.0 ★ Google Reviews",
  "Yoga Alliance Certified",
  "5,000+ Students Trained",
  "50+ Countries Reached",
  "5.0 ★ Tripadvisor",
  "Since 2012 · Rishikesh",
  "RYT 200 · 300 · 500",
];

const MOBILE_TRUST = [
  { value: "5.0★", label: "Rated" },
  { value: "5,000+", label: "Students" },
  { value: "50+", label: "Countries" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden bg-ink">
      <HeroBackgroundVideo />

      {/* Cinematic overlays — video stays clear in the upper half */}
      <div
        className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 via-45% to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/50 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hero-glow pointer-events-none"
        aria-hidden="true"
      />

      <HeroFlourish className="absolute top-28 right-6 md:right-12 w-24 md:w-32 h-24 md:h-32 text-white/10 pointer-events-none" />

      {/* Top eyebrow */}
      <div className="absolute top-20 md:top-24 inset-x-0 z-10 animate-fade-up fade-delay-100">
        <Container size="2xl">
          <div className="flex items-center justify-center gap-3 text-white/60">
            <span className="h-px w-10 md:w-20 bg-linear-to-r from-transparent to-white/35" />
            <span className="type-eyebrow text-[0.65rem] sm:text-xs text-white/60">
              Est. Rishikesh · 2012
            </span>
            <span className="h-px w-10 md:w-20 bg-linear-to-l from-transparent to-white/35" />
          </div>
        </Container>
      </div>

      {/* Bottom-anchored content */}
      <div className="relative z-10 min-h-svh flex items-end pb-36 sm:pb-[4.5rem] md:pb-[5rem]">
        <Container size="2xl" className="w-full">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7 xl:col-span-8 relative">
              {/* Editorial accent line */}
              <span
                className="hidden md:block absolute -left-6 top-2 bottom-2 w-px bg-linear-to-b from-transparent via-accent/70 to-transparent"
                aria-hidden="true"
              />

              <div className="animate-fade-up fade-delay-200 inline-flex items-center gap-2 hero-glass rounded-full px-3 py-1.5 mb-4 sm:gap-2.5 sm:px-4 sm:py-2 sm:mb-6">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-full w-full rounded-full bg-accent" />
                </span>
                <span className="type-eyebrow text-[0.65rem] sm:text-xs text-white/90">
                  Yoga Alliance Certified · India
                </span>
              </div>

              <h1 className="animate-fade-up fade-delay-300 font-serif font-medium text-white text-[1.75rem] leading-[1.08] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl sm:leading-[1.04] tracking-tight text-balance">
                Where ancient yoga
                <br className="hidden sm:block" />
                <span className="text-white/95"> meets the soul of the </span>
                <span className="relative inline-block whitespace-nowrap">
                  <span className=" text-accent font-normal">Himalayas</span>
                  <HeroUnderline className="absolute -bottom-1 md:-bottom-2 left-0 w-full text-accent" />
                </span>
                <span className="text-white/90">.</span>
              </h1>

              <p className="animate-fade-up fade-delay-400 mt-4 sm:mt-6 text-sm leading-relaxed sm:text-base sm:leading-normal md:type-lead text-white/80 max-w-lg">
                <span className="text-white/90">200, 300 &amp; 500-hour</span>{" "}
                residential teacher trainings on the banks of the sacred Ganga.
              </p>

              <div className="animate-fade-up fade-delay-500 mt-5 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                <Button
                  href="#courses"
                  variant="primary"
                  responsive
                  className="group shadow-lg shadow-primary/30 hover:shadow-primary/40"
                >
                  Explore Courses
                  <ArrowRight
                    size={16}
                    className="sm:w-[18px] sm:h-[18px] transition-transform group-hover:translate-x-1"
                  />
                </Button>
                <Button href="#contact" variant="outline-light" responsive>
                  WhatsApp Us
                </Button>
              </div>

              {/* Mobile trust chips */}
              <div className="animate-fade-up fade-delay-600 lg:hidden mt-5 sm:mt-8 flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                {MOBILE_TRUST.map((item) => (
                  <div
                    key={item.label}
                    className="hero-glass shrink-0 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[76px] sm:min-w-[88px] text-center"
                  >
                    <div className="font-serif text-lg sm:text-xl text-white leading-none">
                      {item.value}
                    </div>
                    <div className="type-eyebrow text-[0.65rem] sm:text-xs text-white/60 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Marquee with edge fade */}
      <div className="absolute bottom-0 inset-x-0 z-10 border-t border-white/10 bg-black/50 backdrop-blur-md">
        <div className="marquee-mask overflow-hidden py-3">
          <div className="flex w-max animate-marquee" aria-hidden="true">
            {["a", "b"].map((set) => (
              <div key={set} className="flex">
                {MARQUEE_ITEMS.map((item) => (
                  <div
                    key={`${set}-${item}`}
                    className="flex items-center gap-5 md:gap-10 px-5 md:px-10 text-white/75 text-xs md:text-sm whitespace-nowrap"
                  >
                    <span className="font-sans tracking-wide">{item}</span>
                    <span
                      className="w-1 h-1 rounded-full bg-accent/70"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
