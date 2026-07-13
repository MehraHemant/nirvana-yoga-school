import { Container } from "@/components/ui";
import { BookOpen, Clock } from "@/icons";

const TRUST_FEATURES = [
  {
    title: "Self-Paced",
    description: "Learn at your own preferred pace",
    icon: Clock,
  },
  {
    title: "Lifetime Access",
    description: "Videos and resources for a lifetime",
    icon: BookOpen,
  },
] as const;

export default function OnlineTrustBar() {
  return (
    <div className="border-b border-accent/15 bg-white">
      <Container size="2xl" className="grid gap-4 py-6 md:grid-cols-2 md:py-8">
        {TRUST_FEATURES.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-3xl border border-accent/15 bg-accent/8 px-5 py-5"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-serif text-xl text-ink">{title}</p>
              <p className="mt-1 type-body text-muted">{description}</p>
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}
