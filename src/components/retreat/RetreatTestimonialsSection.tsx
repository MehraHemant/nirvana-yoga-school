import Link from "next/link";
import type { ReactNode } from "react";
import { RETREAT_TESTIMONIALS } from "@/data/retreatTestimonials";
import { Google, Star, Tripadvisor } from "@/icons";
import RetreatSectionShell from "./RetreatSectionShell";

const PLATFORM_LINKS = {
  google: "https://g.co/kgs/cftBiC3",
  tripadvisor:
    "https://www.tripadvisor.com/Attraction_Review-g580106-d27745947-Reviews-Nirvana_Yoga_School-Rishikesh_Dehradun_District_Uttarakhand.html",
} as const;

function RatingCard({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl border border-secondary/10 bg-white px-4 py-4 transition-colors hover:border-secondary/20"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/5">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              // biome-ignore lint/suspicious/noArrayIndexKey: static rating stars
              key={index}
              size={12}
              className="fill-amber-400 text-amber-400"
            />
          ))}
          <span className="ml-1 text-sm font-semibold text-ink">5/5 Stars</span>
        </div>
      </div>
    </Link>
  );
}

export default function RetreatTestimonialsSection() {
  return (
    <RetreatSectionShell
      id="testimonials"
      title="Testimonials"
      className="border-b-0 pb-20"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <RatingCard
            label="Google Rating"
            href={PLATFORM_LINKS.google}
            icon={<Google size={18} />}
          />
          <RatingCard
            label="Trip Advisor Rating"
            href={PLATFORM_LINKS.tripadvisor}
            icon={<Tripadvisor size={18} />}
          />
        </div>

        <div className="space-y-4">
          {RETREAT_TESTIMONIALS.map((item) => (
            <blockquote
              key={item.name}
              className="rounded-2xl border border-secondary/10 bg-white px-5 py-4"
            >
              <p className="type-body text-ink/85">{item.quote}</p>
              <footer className="mt-3 text-sm font-semibold text-ink">
                — {item.name}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </RetreatSectionShell>
  );
}
