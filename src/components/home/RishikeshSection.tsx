import Image from "next/image";
import { Container, Pill } from "@/components/ui";

const BENEFITS = [
  "The birthplace of yoga, blessed by the Ganga",
  "Crisp Himalayan air & timeless silence",
  "Centuries-old ashrams & living masters",
  "A spiritual current you can feel in the body",
];

export default function RishikeshSection() {
  return (
    <section className="relative bg-secondary text-white overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {/* Image side */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[640px]">
          <Image
            src="https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=2000&auto=format&fit=crop&q=80"
            alt="The Ganges flowing through Rishikesh at sunrise, framed by the Himalayan foothills"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-secondary/40 to-transparent"
            aria-hidden="true"
          />
        </div>

        {/* Copy side */}
        <div className="flex items-center px-6 md:px-12 lg:px-16 py-16 md:py-24 lg:py-32">
          <Container size="sm" className="!px-0 !mx-0">
            <Pill invert className="mb-6">
              Why Rishikesh
            </Pill>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Where earth, sky, and{" "}
              <span className="italic text-accent">spirit</span> meet.
            </h2>
            <p className="type-lead mt-6 text-white/85">
              There is a sacred rhythm in Rishikesh that cannot be explained —
              only felt. It lives in the silence between temple bells, in the
              flow of the Ganga, in the stillness of the Himalayas. To learn
              yoga here is to join an ancient stream of wisdom, healing, and
              inner peace.
            </p>

            <ul className="mt-8 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-white/90">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span className="type-body">{b}</span>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </div>
    </section>
  );
}
