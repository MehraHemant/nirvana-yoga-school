import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeader } from "@/components/ui";

type Teacher = {
  name: string;
  role: string;
  experience: string;
  image: string;
};

const TEACHERS: Teacher[] = [
  {
    name: "Gurudev Dhruvaji",
    role: "Founder · Philosophy & Vedanta",
    experience: "20+ years of teaching",
    image:
      "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Jeet Thapliyal",
    role: "Hatha & Ashtanga Vinyasa",
    experience: "9 years of teaching",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Dr. Akshay Vashisht",
    role: "Meditation, Pranayama & Mantra",
    experience: "7+ years of teaching",
    image:
      "https://images.unsplash.com/photo-1559548331-f9cb98001426?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Meghna Banerjee",
    role: "Yoga Nidra & Anatomy",
    experience: "7+ years of teaching",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
  },
];

export default function TeachersSection() {
  return (
    <section id="teachers" className="bg-paper py-20 md:py-28">
      <Container size="xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <SectionHeader
            eyebrow="Our Spiritual Gurus"
            title={
              <>
                Teachers rooted in tradition,
                <br />
                guided by compassion.
              </>
            }
            description="Twelve experienced teachers, each carrying decades of practice — from temple lineages to modern yoga therapy."
          />
          <Link
            href="#"
            className="text-sm font-semibold text-primary hover:underline whitespace-nowrap"
          >
            Meet all 12 teachers →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {TEACHERS.map((t) => (
            <article
              key={t.name}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <div className="p-5 md:p-6">
                <h3 className="type-display-sm text-ink leading-tight">
                  {t.name}
                </h3>
                <div className="text-sm text-primary font-medium mt-1">
                  {t.role}
                </div>
                <div className="text-xs text-muted mt-3 uppercase tracking-wider">
                  {t.experience}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
