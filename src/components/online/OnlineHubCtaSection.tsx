"use client";

import { motion } from "framer-motion";
import { Button, Container, Heading } from "@/components/ui";
import { ArrowRight, WhatsApp } from "@/icons";
import { fadeUp, VIEWPORT_ONCE } from "@/lib/motion";

type OnlineHubCtaSectionProps = {
  /** Digits-only WhatsApp number from site config */
  whatsappNumber?: string;
  /** Enquire / form href */
  enquireHref?: string;
};

/**
 * Closing conversion band for the online courses hub.
 *
 * @param props - WhatsApp number and enquire link
 */
export default function OnlineHubCtaSection({
  whatsappNumber,
  enquireHref = "/enquire-now",
}: OnlineHubCtaSectionProps) {
  const waDigits = whatsappNumber?.replace(/\D/g, "") ?? "";
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        "Hi! I'm interested in an online yoga teacher training course at Nirvana Yoga School.",
      )}`
    : undefined;

  return (
    <section className="bg-ink section-padding-y text-white">
      <Container size="2xl" className="text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUp}
        >
          <p className="type-eyebrow text-accent">Ready to begin?</p>
          <Heading as="h2" align="center" size="h2" invert>
            Start your online yoga
            <br />
            <span className="font-bold text-accent">teacher training</span>
          </Heading>
          <p className="type-lead mx-auto mt-4 max-w-xl text-white/80">
            Enquire for guidance on the right course, Indian student pricing, or
            enrollment — we reply quickly on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href={enquireHref} variant="primary" size="md">
              Enquire now
              <ArrowRight size={16} />
            </Button>
            {waHref ? (
              <Button href={waHref} variant="outline-light" size="md">
                <WhatsApp size={16} />
                WhatsApp
              </Button>
            ) : null}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
