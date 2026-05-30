import Image from "next/image";
import { Button, Container, Pill } from "@/components/ui";
import { ArrowRight, WhatsApp } from "@/icons";

export default function FinalCTASection() {
  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=2000&auto=format&fit=crop&q=80"
        alt="Sunrise yoga practice on the banks of the Ganges"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/75"
        aria-hidden="true"
      />

      <Container size="md" className="relative z-10 text-center">
        <Pill invert className="mb-6 mx-auto">
          Limited spots · 25% early-bird saving
        </Pill>
        <h2 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
          Your journey begins
          <br />
          <span className="italic text-accent">when you arrive.</span>
        </h2>
        <p className="type-lead mt-6 text-white/85 max-w-2xl mx-auto">
          Reach out today &mdash; we&apos;ll answer every question and help you
          choose the path that&apos;s right for you. No pressure, only presence.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="#courses" variant="primary" size="lg">
            Apply Now
            <ArrowRight />
          </Button>
          <Button
            href="https://wa.me/919876543210"
            variant="outline-light"
            size="lg"
          >
            <WhatsApp size={18} />
            Chat on WhatsApp
          </Button>
        </div>

        <p className="mt-8 text-white/60 text-xs uppercase tracking-widest">
          Save 25% when you book by 25 July 2026
        </p>
      </Container>
    </section>
  );
}
