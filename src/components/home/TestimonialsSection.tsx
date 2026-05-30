import { Container, SectionHeader } from "@/components/ui";
import { Google, Star, Tripadvisor } from "@/icons";

type Testimonial = {
  name: string;
  country: string;
  course: string;
  source: "Google" | "Tripadvisor";
  quote: string;
};

const REVIEWS: Testimonial[] = [
  {
    name: "Usha Singh",
    country: "India",
    course: "200hr Hatha Ashtanga YTT",
    source: "Google",
    quote:
      "More like family than a school. Gurudev Dhruvji paid special attention to our comfort — the food, the setting, the teachers. A truly holistic experience that became my extended family.",
  },
  {
    name: "Ole Netek",
    country: "Denmark",
    course: "200hr Hatha Ashtanga YTT",
    source: "Google",
    quote:
      "Beautifully organised and deeply professional. Dedicated, passionate teachers in one of the quieter, greener parts of upper Tapovan. I recommend Nirvana to everyone.",
  },
  {
    name: "Joan Nakazono",
    country: "USA",
    course: "200hr Yoga Teacher Training",
    source: "Tripadvisor",
    quote:
      "A once-in-a-lifetime experience. Rigorous yet beautifully balanced, with breathtaking surroundings. I made lasting friendships with people from across the world.",
  },
  {
    name: "Beatrice Ani-Asamoah",
    country: "Ghana",
    course: "200hr Kundalini YTT",
    source: "Tripadvisor",
    quote:
      "Traditional, supportive, and life-changing. The level of devotion and love from the entire team was outstanding. After the course many of us stayed in Rishikesh — it was hard to leave.",
  },
  {
    name: "Eve Lesage",
    country: "France",
    course: "300hr Advanced YTT",
    source: "Tripadvisor",
    quote:
      "A perfect mix of theory, practice and personal growth. I left with a holistic understanding of my own practice and the confidence to teach. Deeply grateful.",
  },
  {
    name: "Niall Phelan",
    country: "Ireland",
    course: "200hr Hatha Ashtanga YTT",
    source: "Google",
    quote:
      "The best investment I've ever made — for my own wellbeing and for what I can now pass on to others. Gurudev Dhruvaji made it magical and informative.",
  },
];

function SourceBadge({ source }: { source: Testimonial["source"] }) {
  if (source === "Google") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Google />
        Google
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
      <Tripadvisor />
      Tripadvisor
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="bg-sand py-20 md:py-28">
      <Container size="xl">
        <SectionHeader
          align="center"
          eyebrow="From our students"
          title={
            <>
              5.0★ across{" "}
              <span className="italic text-primary">5,000+ reviews.</span>
            </>
          }
          description="Words from yogis who walked the path with us — from Denmark to Ghana, India to the USA."
          className="mb-14 md:mb-20 mx-auto"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col bg-white rounded-3xl p-6 md:p-7 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex gap-0.5"
                  role="img"
                  aria-label="5 out of 5 stars"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className="w-4 h-4 text-[#facc15]"
                    />
                  ))}
                </div>
                <SourceBadge source={r.source} />
              </div>

              <blockquote className="type-lead text-ink/85 flex-1">
                &ldquo;{r.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-5 pt-5 border-t border-ink/10">
                <div className="font-serif text-ink">{r.name}</div>
                <div className="text-xs text-muted mt-1 uppercase tracking-wider">
                  {r.country} · {r.course}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
