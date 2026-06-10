"use client";

import Image from "next/image";
import { Container, SectionHeader } from "@/components/ui";
import { Google, Star, Tripadvisor } from "@/icons";

type Testimonial = {
  name: string;
  country: string;
  course: string;
  source: "Google" | "Tripadvisor" | "Trustpilot";
  title: string;
  quote: string;
  avatar: string;
};

const REVIEWS: Testimonial[] = [
  // Google
  {
    name: "Usha Singh",
    country: "India",
    course: "200hr Yoga Nidra TTC",
    source: "Google",
    title: "Felt More Like a Family",
    quote:
      "My experience at Nirvana Yoga School has been beyond what I ever expected. This place felt more like a family than just a school. Guru Dhruvji paid special attention to our comfort, making sure every student had a calming environment both in the classroom and in our rooms. The food was prepared with utmost care, ensuring it was sattvic and made with cold-pressed sunflower oil, which made the experience feel holistic.",
    avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Ole Netek",
    country: "Denmark",
    course: "500hr Hatha Ashtanga YTT",
    source: "Google",
    title: "Well Organized & Very Professional",
    quote:
      "I've just completed the 200 hours Hatha Ashtanga Teacher training. The program was well organized & the school is very professional in terms of structure and responding. I am really thankful for the dedicated & passionate teachers at Nirvana! I can really recommend this school to everyone.",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Niall Phelan",
    country: "Ireland",
    course: "500hr Advanced YTT",
    source: "Google",
    title: "Best Investment I Have Ever Made",
    quote:
      "Best investment I have ever made, both in terms of my own wellbeing and in that I will be able to impart on others through the teaching knowledge and skills. Guru Dhruvaji made the experience especially magical and informative.",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Valentina Catenacci",
    country: "Italy",
    course: "200hr Kundalini YTT",
    source: "Google",
    title: "An Amazing Place to Grow",
    quote:
      "Nirvana Yoga school is an amazing place where you will learn so much more than what they state in their program! An amazing place to make meaningful connections and grow as a person. Highly recommended!",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
  // Tripadvisor
  {
    name: "Joan Nakazono",
    country: "USA",
    course: "200hr Yoga Teacher Training",
    source: "Tripadvisor",
    title: "Once-in-a-lifetime Experience",
    quote:
      "I feel incredibly fortunate to have completed my 200-hour Yoga Teacher Training at Nirvana Yoga School. From the start, the professionalism, expertise, and unwavering support of the teachers truly stood out. Each instructor brought a deep understanding of yoga, and their guidance was invaluable throughout the course.",
    avatar:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Beatrice Ani-Asamoah",
    country: "Ghana",
    course: "200hr Yoga Nidra TTC",
    source: "Tripadvisor",
    title: "Incredible & Life Changing Experience",
    quote:
      "Nirvana Yoga School was an incredible experience for me, more than I ever imagined it would be. I spent a month in the 200 TTC focusing on yoga Nidra (and also Hatha, Philosophy, and more). It was my first time both in India and doing a TTC and I felt completely supported. The management and teachers are wonderful, patient, and very experienced.",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Eve Lesage",
    country: "France",
    course: "300hr Advanced YTT",
    source: "Tripadvisor",
    title: "Very Grateful for This Training",
    quote:
      "I recently completed 300 hour Yoga Teacher Training at Nirvana, and it was an incredible journey. The instructors were so supportive, and truly passionate about yoga. I look up to them not only for their expertise but also for their genuine care in guiding us us through the journey.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Agathe De Vargas",
    country: "France",
    course: "200hr Yoga Teacher Training",
    source: "Tripadvisor",
    title: "Professeurs de Grande Qualité",
    quote:
      "Je souhaite prendre le temps de détailler mon avis sur Nirvana. Les professeurs sont de grande qualité, à l'écoute et enseignent le yoga traditionnellement. Les shalas sont grands et lumineux, et le bâtiment est calme, situé à la fin de Tapovan. La nourriture est saine et délicieuse.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  // Trustpilot
  {
    name: "Ujjwala Prasad",
    country: "India",
    course: "200hr Ayurveda Yoga TTC",
    source: "Trustpilot",
    title: "Lucky & Grateful to Learn Here",
    quote:
      "I am so lucky and grateful to have been able to learn at such an incredible yoga school. The combination courses is what truly caught my eye at Nirvana and then everything that followed was just magical. The rooms, classes, and especially the kitchen staff for feeding us such nutritional meals. Can't wait to be back!",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Laetitia Haziza",
    country: "France",
    course: "300hr Advanced YTT",
    source: "Trustpilot",
    title: "Transformative Experience",
    quote:
      "I had a great time at Nirvana school that I will never, never forget! The teachers are very professional and sweet. The Guru is so generous and I learned so much there. Be ready to be disciplined, ready to learn, and ready for a transformative experience!",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Swati Snigdha",
    country: "India",
    course: "500hr Yoga Teacher Training",
    source: "Trustpilot",
    title: "Nothing Short of Life-Changing",
    quote:
      "Joining Nirvana Yoga School has been nothing short of life-changing. The 500-hour teacher training pushed me out of my comfort zone while helping me connect deeper with myself physically, mentally, and spiritually. The teachers were super supportive, blending traditional yoga practices with real-world insights.",
    avatar:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Corinne Germann",
    country: "Switzerland",
    course: "200hr Kundalini Yoga TTC",
    source: "Trustpilot",
    title: "Schule mit Herz",
    quote:
      "Im April 2025 war ich hier für das 200h Kundalini TTC. Eine Schule, die sich mit Herz für das Weitergeben des Wissens einsetzt. Lehrer:innen, die mit Elan und hoher Professionalität Erfahrungen weitergeben. Räume, in denen du dich wohlzustimmen, und ein traditionelles Kundalini-Yoga, das den Stamm und die Lineage aufzeigt.",
    avatar:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
  },
];

function SourceBadge({ source }: { source: Testimonial["source"] }) {
  if (source === "Google") {
    return (
      <div className="flex items-center gap-1 text-[9px] font-semibold text-muted bg-neutral-50 px-1.5 py-0.5 rounded-full border border-neutral-100">
        <Google size={9} className="text-neutral-500" />
        <span className="font-sans">Google</span>
      </div>
    );
  }
  if (source === "Tripadvisor") {
    return (
      <div className="flex items-center gap-1 text-[9px] font-semibold text-muted bg-neutral-50 px-1.5 py-0.5 rounded-full border border-neutral-100">
        <Tripadvisor size={9} className="text-neutral-500" />
        <span className="font-sans">Tripadvisor</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[9px] font-semibold text-muted bg-neutral-50 px-1.5 py-0.5 rounded-full border border-neutral-100">
      <span className="w-2.5 h-2.5 rounded-full bg-[#00a568] flex items-center justify-center text-[6px] text-white font-bold font-sans">
        ★
      </span>
      <span className="font-sans">Trustpilot</span>
    </div>
  );
}

function TestimonialCard({
  r,
  platformId,
}: {
  r: Testimonial;
  platformId: string;
}) {
  return (
    <figure className="flex flex-col bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-ink/5 w-[360px] sm:w-[420px] h-[340px] shrink-0 select-none text-left relative overflow-hidden">
      {/* Top Section: Avatar left, Name & Stars right, Platform badge absolute top-right */}
      <div className="flex items-center gap-3.5 mb-5 relative z-10">
        <div
          className={`h-11 w-11 rounded-full overflow-hidden shrink-0 border relative bg-sand/80 shadow-2xs ${
            platformId === "Google"
              ? "border-primary/10 ring-2 ring-primary/5"
              : platformId === "Tripadvisor"
                ? "border-secondary/10 ring-2 ring-secondary/5"
                : "border-emerald-500/10 ring-2 ring-emerald-500/5"
          }`}
        >
          <Image
            src={r.avatar}
            alt={r.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-sans text-[14px] sm:text-base font-bold text-ink leading-tight">
            {r.name}
          </h4>
          <div
            className="flex gap-0.5 mt-1"
            role="img"
            aria-label="5 out of 5 stars"
          >
            {[0, 1, 2, 3, 4].map((starIdx) => (
              <Star
                key={starIdx}
                size={11}
                className={`${
                  platformId === "Google"
                    ? "text-[#facc15] fill-[#facc15]"
                    : platformId === "Tripadvisor"
                      ? "text-emerald-500 fill-emerald-500"
                      : "text-[#00a568] fill-[#00a568]"
                } shrink-0`}
              />
            ))}
          </div>
        </div>

        {/* Small source badge at top right */}
        <div className="absolute top-0 right-0">
          <SourceBadge source={r.source} />
        </div>
      </div>

      {/* Review Content: Title and Quote */}
      <div className="flex flex-col flex-1 min-h-0 relative z-10">
        <h3 className="font-serif text-[15px] sm:text-base md:text-lg font-semibold text-ink leading-tight mb-2.5">
          {r.title}
        </h3>
        <blockquote className="font-sans text-xs sm:text-sm text-ink/75 leading-relaxed overflow-y-auto pr-1">
          &ldquo;{r.quote}&rdquo;
        </blockquote>
      </div>
    </figure>
  );
}

export default function TestimonialsSection() {
  // Grouped reviews
  const googleReviews = REVIEWS.filter((r) => r.source === "Google");
  const tripadvisorReviews = REVIEWS.filter((r) => r.source === "Tripadvisor");
  const trustpilotReviews = REVIEWS.filter((r) => r.source === "Trustpilot");

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-sand py-12 sm:py-14 lg:py-16 w-full"
    >
      <div
        className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/3 blur-[100px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <Container size="2xl" className="w-full relative z-10">
        {/* Section Header */}
        <div className="w-full text-center mb-10 sm:mb-16">
          <SectionHeader
            align="center"
            eyebrow="Student Testimonials"
            title={
              <>
                Global Lineage.{" "}
                <span className="italic text-primary font-serif font-medium animate-glow-primary">
                  5,000+ Five-Star Reviews.
                </span>
              </>
            }
            description="Read the authentic journeys of practitioners from all corners of the globe who trained at our sanctuary."
            className="mx-auto"
          />
        </div>

        {/* Triple Marquee Rivers */}
        <div className="space-y-6 sm:space-y-8 mt-2 w-full relative">
          {/* Row 1: Google Reviews (Scroll Left) */}
          <div className="flex overflow-hidden w-full select-none py-1.5 marquee-mask marquee-hover-pause">
            <div className="flex w-max gap-6 shrink-0 animate-marquee">
              <div className="flex gap-6 shrink-0">
                {googleReviews.map((r) => (
                  <TestimonialCard
                    key={`g1-${r.name}`}
                    r={r}
                    platformId="Google"
                  />
                ))}
              </div>
              <div className="flex gap-6 shrink-0" aria-hidden="true">
                {googleReviews.map((r) => (
                  <TestimonialCard
                    key={`g2-${r.name}`}
                    r={r}
                    platformId="Google"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Tripadvisor Reviews (Scroll Right) */}
          <div className="flex overflow-hidden w-full select-none py-1.5 marquee-mask marquee-hover-pause">
            <div className="flex w-max gap-6 shrink-0 animate-marquee-reverse">
              <div className="flex gap-6 shrink-0">
                {tripadvisorReviews.map((r) => (
                  <TestimonialCard
                    key={`t1-${r.name}`}
                    r={r}
                    platformId="Tripadvisor"
                  />
                ))}
              </div>
              <div className="flex gap-6 shrink-0" aria-hidden="true">
                {tripadvisorReviews.map((r) => (
                  <TestimonialCard
                    key={`t2-${r.name}`}
                    r={r}
                    platformId="Tripadvisor"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Trustpilot Reviews (Scroll Left) */}
          <div className="flex overflow-hidden w-full select-none py-1.5 marquee-mask marquee-hover-pause">
            <div className="flex w-max gap-6 shrink-0 animate-marquee-slow">
              <div className="flex gap-6 shrink-0">
                {trustpilotReviews.map((r) => (
                  <TestimonialCard
                    key={`tp1-${r.name}`}
                    r={r}
                    platformId="Trustpilot"
                  />
                ))}
              </div>
              <div className="flex gap-6 shrink-0" aria-hidden="true">
                {trustpilotReviews.map((r) => (
                  <TestimonialCard
                    key={`tp2-${r.name}`}
                    r={r}
                    platformId="Trustpilot"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
