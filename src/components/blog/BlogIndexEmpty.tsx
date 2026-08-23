import { Button } from "@/components/ui";
import { ArrowRight } from "@/icons";

/**
 * Quiet empty state when the journal has no published essays.
 */
export function BlogIndexEmpty() {
  return (
    <div className="flex flex-col items-center px-4 py-20 text-center sm:py-28">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary">
        Coming soon
      </p>
      <p className="mt-5 max-w-lg text-[clamp(1.75rem,3.4vw,2.5rem)] font-bold leading-tight tracking-[-0.025em] text-ink">
        New essays are being prepared
      </p>
      <p className="mx-auto mt-4 max-w-md text-base font-semibold leading-relaxed text-ink">
        Our teachers are shaping the next collection of practice notes and
        philosophy guides. Please check back soon.
      </p>
      <div className="mt-10">
        <Button href="/course" variant="primary" size="lg" className="group">
          Explore courses
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Button>
      </div>
    </div>
  );
}
