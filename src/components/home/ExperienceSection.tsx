import Image from "next/image";
import { Container, SectionHeader } from "@/components/ui";

type Feature = {
  title: string;
  description: string;
  image: string;
};

const FEATURES: Feature[] = [
  {
    title: "Sattvic Cuisine",
    description:
      "Three nourishing vegetarian meals daily, prepared with Ayurvedic balance and cold-pressed oils.",
    image:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=1200&auto=format&fit=crop&q=80",
  },
  {
    title: "Riverside Ashram",
    description:
      "A serene residence in upper Tapovan, footsteps from the Ganga and the Himalayan foothills.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80",
  },
  {
    title: "Daily Kirtan & Aarti",
    description:
      "Begin and end your days in devotional song, chanting, and the ancient Ganga aarti ceremony.",
    image:
      "https://images.unsplash.com/photo-1532798442725-41036acc7489?w=1200&auto=format&fit=crop&q=80",
  },
  {
    title: "Sacred Excursions",
    description:
      "Sunday visits to temples, waterfalls, sound healing sessions, and acro-yoga on the riverbank.",
    image:
      "https://images.unsplash.com/photo-1591291621164-2c6367723315?w=1200&auto=format&fit=crop&q=80",
  },
];

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      className="bg-primary py-14 md:py-16 lg:py-20 text-white"
    >
      <Container size="xl">
        <SectionHeader
          invert
          align="center"
          eyebrow="The Nirvana Experience"
          title={
            <>
              Yoga, lived from <span className="italic">dawn</span> to dusk.
            </>
          }
          description="Every detail is held with care — from the food on your plate to the chants at twilight. This is yoga as a way of being, not a class on a schedule."
          className="mb-10 sm:mb-12 md:mb-20 mx-auto"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-ink/40"
            >
              <Image
                src={f.image}
                alt={f.title}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 md:p-7">
                <h3 className="font-serif text-xl sm:text-2xl text-white">
                  {f.title}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
