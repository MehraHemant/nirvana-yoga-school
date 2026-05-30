import { Container, SectionHeader } from "@/components/ui";
import { Plus } from "@/icons";

const FAQS = [
  {
    q: "How much does yoga teacher training cost in India?",
    a: "Yoga teacher training in India typically costs between $700 and $1,800. At Nirvana, our 200-hour course starts at $649 all-inclusive — covering accommodation, three sattvic meals a day, course manual, excursions and Yoga Alliance certification.",
  },
  {
    q: "Which certification is best for yoga teachers?",
    a: "Yoga Alliance USA is the most widely recognised yoga certification in the world. We offer RYT 200, RYT 300, and RYT 500-hour programs — all meeting international standards so you can teach confidently anywhere.",
  },
  {
    q: "Do I need prior yoga experience to join?",
    a: "No advanced experience is required for our 200-hour foundational course. An open heart, basic familiarity with yoga, and the willingness to commit fully are all you need. Our courses gently guide you from the ground up.",
  },
  {
    q: "What kind of food do you serve?",
    a: "Three nourishing sattvic vegetarian meals daily, prepared fresh with Ayurvedic balance and cold-pressed sunflower oil. Vegan and gluten-free options are available on request — just let us know at registration.",
  },
  {
    q: "Why is Rishikesh called the yoga capital of the world?",
    a: "Rishikesh is where ancient sages first practiced and taught yoga, on the banks of the Ganges and beneath the Himalayas. To this day seekers come here to feel its radiant spiritual energy and deep yogic culture firsthand.",
  },
  {
    q: "What does a typical day look like?",
    a: "Days begin around 6am with meditation and pranayama, followed by Hatha or Ashtanga practice, breakfast, philosophy and anatomy classes, lunch, rest, alignment workshops, evening practice, satsang or kirtan, and dinner. Sundays are reserved for excursions and rest.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="bg-paper py-14 md:py-20 lg:py-28">
      <Container size="md">
        <SectionHeader
          align="center"
          eyebrow="Questions, answered"
          title="Frequently asked"
          className="mb-8 sm:mb-10 md:mb-16 mx-auto"
        />

        <div className="space-y-2.5 sm:space-y-3">
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              className="group bg-white rounded-xl sm:rounded-2xl border border-ink/5 shadow-sm hover:shadow-card transition-shadow"
              open={i === 0}
            >
              <summary className="flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 md:p-6">
                <span className="type-display-sm text-ink leading-tight text-left">
                  {item.q}
                </span>
                <span
                  className="accordion-icon flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Plus />
                </span>
              </summary>
              <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 -mt-1">
                <p className="type-body text-ink/80">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
